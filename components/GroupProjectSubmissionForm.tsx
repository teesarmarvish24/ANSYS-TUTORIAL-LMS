'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import FileUploadField from '@/components/FileUploadField';

export default function GroupProjectSubmissionForm({
  groupId,
  userId,
  initialContent,
  initialAttachment,
}: {
  groupId: string;
  userId: string;
  initialContent: string;
  initialAttachment: string | null;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [attachment, setAttachment] = useState<string | null>(initialAttachment);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    const supabase = createClient();
    const { error: upsertError } = await supabase.from('project_submissions').upsert(
      {
        group_id: groupId,
        content,
        attachment_url: attachment,
        submitted_by: userId,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'group_id' }
    );

    setSaving(false);

    if (upsertError) {
      setError('Could not save your submission. Please try again.');
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">
          Submission notes
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
          placeholder="Describe your group's submission…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">Attachment</label>
        <FileUploadField
          pathPrefix={`groups/${groupId}`}
          value={attachment}
          onChange={setAttachment}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-700">Submission saved for your group.</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-navy-950 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving…' : initialContent || initialAttachment ? 'Update submission' : 'Submit'}
      </button>
    </form>
  );
}
