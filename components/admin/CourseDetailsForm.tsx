'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, ImagePlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Course } from '@/lib/types';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function CourseDetailsForm({ course }: { course: Course }) {
  const [title, setTitle] = useState(course.title);
  const [subtitle, setSubtitle] = useState(course.subtitle ?? '');
  const [description, setDescription] = useState(course.description ?? '');
  const [level, setLevel] = useState(course.level);
  const [durationHours, setDurationHours] = useState(course.duration_hours?.toString() ?? '');
  const [priceNaira, setPriceNaira] = useState((course.price_kobo / 100).toString());
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleThumbnail(file: File) {
    setUploading(true);
    setError('');
    const supabase = createClient();
    const path = `${course.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: uploadError } = await supabase.storage
      .from('course-thumbnails')
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (uploadError) {
      setError('Thumbnail upload failed.');
      return;
    }
    const { data } = supabase.storage.from('course-thumbnails').getPublicUrl(path);
    setThumbnailUrl(data.publicUrl);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('courses')
      .update({
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        level,
        duration_hours: durationHours ? Number(durationHours) : null,
        price_kobo: priceNaira ? Math.round(Number(priceNaira) * 100) : 0,
        thumbnail_url: thumbnailUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', course.id);
    setSaving(false);
    if (updateError) {
      setError('Could not save changes.');
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSave} className="bg-white border border-navy-100 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-20 bg-navy-50 rounded-lg overflow-hidden flex-shrink-0">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt="" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-navy-300">
              <ImagePlus size={22} />
            </div>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleThumbnail(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm font-semibold text-navy-700 hover:underline disabled:opacity-60"
          >
            {uploading ? <Loader2 size={14} className="inline animate-spin mr-1" /> : null}
            {uploading ? 'Uploading…' : 'Change thumbnail'}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
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
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
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
      {saved && <p className="text-sm text-emerald-700">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-navy-950 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-navy-800 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
