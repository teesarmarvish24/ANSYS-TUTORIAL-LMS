'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Users2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import FileUploadField from '@/components/FileUploadField';
import { formatDate } from '@/lib/format';
import type { GroupProject } from '@/lib/types';

export default function GroupProjectsManager({
  courseId,
  initialProjects,
}: {
  courseId: string;
  initialProjects: GroupProject[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from('group_projects')
      .insert({
        course_id: courseId,
        title: title.trim(),
        instructions: instructions.trim() || null,
        attachment_url: attachment,
        due_at: dueAt || null,
        max_score: Number(maxScore) || 100,
      })
      .select()
      .single();
    setSaving(false);
    if (insertError) {
      setError('Could not create group project.');
      return;
    }
    setProjects((prev) => [...prev, data as GroupProject]);
    setShowForm(false);
    setTitle('');
    setInstructions('');
    setDueAt('');
    setMaxScore('100');
    setAttachment(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this group project, its groups and submissions?')) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('group_projects').delete().eq('id', id);
    if (!deleteError) setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-navy-900">Group Projects</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline"
        >
          <Plus size={16} /> Add group project
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border border-navy-100 rounded-xl p-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Instructions"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
            />
            <input
              type="number"
              min="1"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              placeholder="Max score"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
            />
          </div>
          <FileUploadField
            pathPrefix={`course-materials/${courseId}/group-projects`}
            value={attachment}
            onChange={setAttachment}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="bg-navy-950 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Add group project'}
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 border border-navy-100 rounded-lg px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm text-navy-800">
              <Users2 size={16} className="text-navy-500 flex-shrink-0" />
              {p.title}
              <span className="text-xs text-navy-400">· due {formatDate(p.due_at)}</span>
            </span>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/group-projects/${p.id}`}
                className="text-xs font-semibold text-navy-700 hover:underline"
              >
                Manage groups
              </Link>
              <button onClick={() => handleDelete(p.id)} className="p-1.5 text-navy-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
        {projects.length === 0 && <p className="text-sm text-navy-500">No group projects yet.</p>}
      </ul>
    </div>
  );
}
