'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { CourseModule } from '@/lib/types';

export default function ModulesManager({
  courseId,
  initialModules,
}: {
  courseId: string;
  initialModules: CourseModule[];
}) {
  const [modules, setModules] = useState(
    [...initialModules].sort((a, b) => a.position - b.position)
  );
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('course_modules')
      .insert({ course_id: courseId, title: title.trim(), position: modules.length })
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      setModules((prev) => [...prev, data as CourseModule]);
      setTitle('');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this module? Recordings/assignments inside it will be kept but unassigned.')) return;
    const supabase = createClient();
    const { error } = await supabase.from('course_modules').delete().eq('id', id);
    if (!error) setModules((prev) => prev.filter((m) => m.id !== id));
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= modules.length) return;
    const reordered = [...modules];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setModules(reordered);

    const supabase = createClient();
    await Promise.all(
      reordered.map((m, i) => supabase.from('course_modules').update({ position: i }).eq('id', m.id))
    );
  }

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold text-navy-900">Modules</h2>
      <p className="text-sm text-navy-500 -mt-2">
        Group recordings and assignments into modules (e.g. &quot;Week 1&quot;, &quot;Meshing Basics&quot;).
      </p>

      <ul className="space-y-2">
        {modules.map((m, i) => (
          <li key={m.id} className="flex items-center justify-between gap-3 border border-navy-100 rounded-lg px-3 py-2.5">
            <span className="text-sm text-navy-800">{m.title}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 text-navy-400 hover:text-navy-800 disabled:opacity-30">
                <ArrowUp size={16} />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === modules.length - 1} className="p-1.5 text-navy-400 hover:text-navy-800 disabled:opacity-30">
                <ArrowDown size={16} />
              </button>
              <button onClick={() => handleDelete(m.id)} className="p-1.5 text-navy-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
        {modules.length === 0 && <p className="text-sm text-navy-500">No modules yet.</p>}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New module title"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 bg-navy-950 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-navy-800 disabled:opacity-60"
        >
          <Plus size={16} /> Add
        </button>
      </form>
    </div>
  );
}
