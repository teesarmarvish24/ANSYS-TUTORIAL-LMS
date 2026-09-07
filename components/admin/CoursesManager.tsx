'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatNaira } from '@/lib/format';
import { slugify } from '@/lib/validation/rules';
import type { Course } from '@/lib/types';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function CoursesManager({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [durationHours, setDurationHours] = useState('');
  const [priceNaira, setPriceNaira] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from('courses')
      .insert({
        title: title.trim(),
        slug: slugify(title),
        subtitle: subtitle.trim() || null,
        level,
        duration_hours: durationHours ? Number(durationHours) : null,
        price_kobo: priceNaira ? Math.round(Number(priceNaira) * 100) : 0,
        is_published: false,
      })
      .select()
      .single();
    setSaving(false);

    if (insertError) {
      setError(insertError.message.includes('duplicate') ? 'A course with a similar title already exists.' : 'Could not create course.');
      return;
    }

    setCourses((prev) => [...prev, data as Course]);
    setShowForm(false);
    setTitle('');
    setSubtitle('');
    setDurationHours('');
    setPriceNaira('');
  }

  async function togglePublish(course: Course) {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('courses')
      .update({ is_published: !course.is_published })
      .eq('id', course.id);
    if (!updateError) {
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, is_published: !c.is_published } : c))
      );
    }
  }

  async function handleDelete(course: Course) {
    if (!confirm(`Delete "${course.title}"? This removes all its modules, recordings, assignments and enrollments. This cannot be undone.`)) {
      return;
    }
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('courses').delete().eq('id', course.id);
    if (!deleteError) {
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 bg-navy-950 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-navy-800"
        >
          <Plus size={16} /> New course
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-navy-100 rounded-2xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                placeholder="e.g. FEA Fundamentals with Ansys"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1">Subtitle</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="A short one-line description"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1">Duration (hours)</label>
              <input
                type="number"
                min="0"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1">Price (₦, 0 for free)</label>
              <input
                type="number"
                min="0"
                value={priceNaira}
                onChange={(e) => setPriceNaira(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-navy-950 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-navy-800 disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create course'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-navy-600 text-sm font-medium px-3"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-navy-100 rounded-2xl divide-y divide-navy-100">
        {courses.length === 0 && (
          <p className="text-sm text-navy-500 p-6">No courses yet — create your first one above.</p>
        )}
        {courses.map((course) => (
          <div key={course.id} className="flex items-center justify-between gap-4 px-5 py-4 flex-wrap">
            <div>
              <p className="font-medium text-navy-900">{course.title}</p>
              <p className="text-xs text-navy-500 mt-0.5">
                {course.level} · {course.price_kobo > 0 ? formatNaira(course.price_kobo) : 'Free'} ·{' '}
                {course.is_published ? (
                  <span className="text-emerald-700">Published</span>
                ) : (
                  <span className="text-amber-700">Draft</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePublish(course)}
                title={course.is_published ? 'Unpublish' : 'Publish'}
                className="p-2 text-navy-500 hover:text-navy-900 hover:bg-navy-50 rounded-lg"
              >
                {course.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <Link
                href={`/admin/courses/${course.id}`}
                title="Manage course"
                className="p-2 text-navy-500 hover:text-navy-900 hover:bg-navy-50 rounded-lg"
              >
                <Pencil size={18} />
              </Link>
              <button
                onClick={() => handleDelete(course)}
                title="Delete"
                className="p-2 text-navy-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
