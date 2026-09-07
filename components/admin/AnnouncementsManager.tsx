'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/format';
import type { Course } from '@/lib/types';

interface AnnouncementRow {
  id: string;
  course_id: string | null;
  title: string;
  body: string;
  created_at: string;
}

export default function AnnouncementsManager({
  initialAnnouncements,
  courses,
  userId,
}: {
  initialAnnouncements: AnnouncementRow[];
  courses: Course[];
  userId: string;
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [courseId, setCourseId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !body.trim()) {
      setError('Title and message are required.');
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from('announcements')
      .insert({
        title: title.trim(),
        body: body.trim(),
        course_id: courseId || null,
        created_by: userId,
      })
      .select()
      .single();
    setSaving(false);
    if (insertError) {
      setError('Could not post announcement.');
      return;
    }
    setAnnouncements((prev) => [data as AnnouncementRow, ...prev]);
    setTitle('');
    setBody('');
    setCourseId('');
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('announcements').delete().eq('id', id);
    if (!deleteError) setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleAdd} className="bg-white border border-navy-100 rounded-2xl p-6 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
        />
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
        >
          <option value="">All students (global)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>Only {c.title}</option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 bg-navy-950 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-navy-800 disabled:opacity-60"
        >
          <Plus size={16} /> {saving ? 'Posting…' : 'Post announcement'}
        </button>
      </form>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white border border-navy-100 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-navy-900">{a.title}</h3>
                <p className="text-xs text-navy-500 mt-0.5">
                  {a.course_id ? courseTitleById.get(a.course_id) : 'All students'} ·{' '}
                  {formatDateTime(a.created_at)}
                </p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="p-1.5 text-navy-400 hover:text-red-600 flex-shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
            <p className="text-sm text-navy-600 mt-2 whitespace-pre-line">{a.body}</p>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-sm text-navy-500">No announcements yet.</p>}
      </div>
    </div>
  );
}
