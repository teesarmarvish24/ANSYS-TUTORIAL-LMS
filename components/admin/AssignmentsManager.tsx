'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, ClipboardList } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import FileUploadField from '@/components/FileUploadField';
import { formatDate } from '@/lib/format';
import type { CourseModule, Assignment } from '@/lib/types';

export default function AssignmentsManager({
  courseId,
  modules,
  initialAssignments,
}: {
  courseId: string;
  modules: CourseModule[];
  initialAssignments: Assignment[];
}) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [moduleId, setModuleId] = useState('');
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
      .from('assignments')
      .insert({
        course_id: courseId,
        module_id: moduleId || null,
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
      setError('Could not create assignment.');
      return;
    }
    setAssignments((prev) => [...prev, data as Assignment]);
    setShowForm(false);
    setTitle('');
    setInstructions('');
    setModuleId('');
    setDueAt('');
    setMaxScore('100');
    setAttachment(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this assignment and all student submissions for it?')) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('assignments').delete().eq('id', id);
    if (!deleteError) setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-navy-900">Assignments</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline"
        >
          <Plus size={16} /> Add assignment
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border border-navy-100 rounded-xl p-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assignment title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Instructions"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
          <div className="grid sm:grid-cols-3 gap-3">
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
            pathPrefix={`course-materials/${courseId}/assignments`}
            value={attachment}
            onChange={setAttachment}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="bg-navy-950 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Add assignment'}
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {assignments.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 border border-navy-100 rounded-lg px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm text-navy-800">
              <ClipboardList size={16} className="text-navy-500 flex-shrink-0" />
              {a.title}
              <span className="text-xs text-navy-400">· due {formatDate(a.due_at)}</span>
            </span>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/assignments/${a.id}/submissions`}
                className="text-xs font-semibold text-navy-700 hover:underline"
              >
                Submissions
              </Link>
              <button onClick={() => handleDelete(a.id)} className="p-1.5 text-navy-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
        {assignments.length === 0 && <p className="text-sm text-navy-500">No assignments yet.</p>}
      </ul>
    </div>
  );
}
