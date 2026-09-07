'use client';

import { useState } from 'react';
import { Plus, Trash2, PlayCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { CourseModule, Recording } from '@/lib/types';

export default function RecordingsManager({
  courseId,
  modules,
  initialRecordings,
}: {
  courseId: string;
  modules: CourseModule[];
  initialRecordings: Recording[];
}) {
  const [recordings, setRecordings] = useState(initialRecordings);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !videoUrl.trim()) {
      setError('Title and video URL are required.');
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from('recordings')
      .insert({
        course_id: courseId,
        module_id: moduleId || null,
        title: title.trim(),
        description: description.trim() || null,
        video_url: videoUrl.trim(),
        duration_minutes: durationMinutes ? Number(durationMinutes) : null,
        position: recordings.length,
      })
      .select()
      .single();
    setSaving(false);
    if (insertError) {
      setError('Could not add recording.');
      return;
    }
    setRecordings((prev) => [...prev, data as Recording]);
    setShowForm(false);
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setModuleId('');
    setDurationMinutes('');
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this recording?')) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('recordings').delete().eq('id', id);
    if (!deleteError) setRecordings((prev) => prev.filter((r) => r.id !== id));
  }

  const moduleTitleById = new Map(modules.map((m) => [m.id, m.title]));

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-navy-900">Recordings</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline"
        >
          <Plus size={16} /> Add recording
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border border-navy-100 rounded-xl p-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Recording title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube (unlisted) or Vimeo (private) URL"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
            >
              <option value="">No module</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="Duration (minutes)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="bg-navy-950 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Add recording'}
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {recordings.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 border border-navy-100 rounded-lg px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm text-navy-800">
              <PlayCircle size={16} className="text-navy-500 flex-shrink-0" />
              {r.title}
              {r.module_id && (
                <span className="text-xs text-navy-400">· {moduleTitleById.get(r.module_id)}</span>
              )}
            </span>
            <button onClick={() => handleDelete(r.id)} className="p-1.5 text-navy-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
        {recordings.length === 0 && <p className="text-sm text-navy-500">No recordings yet.</p>}
      </ul>
    </div>
  );
}
