'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Module, Recording } from '@/lib/types';

const emptyForm = {
  id: '',
  title: '',
  description: '',
  module_id: '',
  video_url: '',
  thumbnail_url: '',
  duration_minutes: '',
  class_date: '',
};

export default function RecordingsManager({
  modules,
  recordings,
}: {
  modules: Module[];
  recordings: (Recording & { modules?: { title: string } })[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openNew() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(rec: Recording) {
    setForm({
      id: rec.id,
      title: rec.title,
      description: rec.description ?? '',
      module_id: rec.module_id,
      video_url: rec.video_url,
      thumbnail_url: rec.thumbnail_url ?? '',
      duration_minutes: rec.duration_minutes ? String(rec.duration_minutes) : '',
      class_date: rec.class_date ?? '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.module_id || !form.video_url.trim()) {
      setError('Title, module, and video URL are required.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      module_id: form.module_id,
      video_url: form.video_url.trim(),
      thumbnail_url: form.thumbnail_url.trim() || null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      class_date: form.class_date || null,
    };

    const result = form.id
      ? await supabase.from('recordings').update(payload).eq('id', form.id)
      : await supabase.from('recordings').insert(payload);

    setLoading(false);

    if (result.error) {
      setError('Failed to save recording. ' + result.error.message);
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('recordings').delete().eq('id', id);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-navy-900">Recordings</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-navy-950 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-navy-800"
        >
          <Plus size={16} /> Add Recording
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {recordings.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4"
          >
            <div className="min-w-0">
              <p className="font-medium text-navy-900 truncate">{rec.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{rec.modules?.title}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => openEdit(rec)}
                className="p-2 text-navy-700 hover:bg-navy-50 rounded-lg"
                aria-label="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setDeleteTarget(rec.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {recordings.length === 0 && (
          <p className="text-gray-500 text-sm">No recordings uploaded yet.</p>
        )}
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-navy-900">
                {form.id ? 'Edit Recording' : 'Add Recording'}
              </h2>
              <button onClick={() => setShowForm(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1">Module</label>
                <select
                  value={form.module_id}
                  onChange={(e) => update('module_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                >
                  <option value="">Select a module</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1">
                  Video URL (YouTube unlisted, Vimeo, or direct file link)
                </label>
                <input
                  value={form.video_url}
                  onChange={(e) => update('video_url', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                  placeholder="https://youtu.be/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1">
                    Class date
                  </label>
                  <input
                    type="date"
                    value={form.class_date}
                    onChange={(e) => update('class_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => update('duration_minutes', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-950 text-white font-semibold py-3 rounded-lg hover:bg-navy-800 disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save Recording'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <p className="font-semibold text-navy-900">Delete this recording?</p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
