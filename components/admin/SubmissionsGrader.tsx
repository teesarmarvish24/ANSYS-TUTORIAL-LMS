'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AttachmentLink from '@/components/AttachmentLink';
import { formatDateTime } from '@/lib/format';

interface SubmissionRow {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  content: string | null;
  attachment_url: string | null;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
}

export default function SubmissionsGrader({
  maxScore,
  initialSubmissions,
}: {
  maxScore: number;
  initialSubmissions: SubmissionRow[];
}) {
  const [rows, setRows] = useState(initialSubmissions);

  async function handleGrade(id: string, score: string, feedback: string) {
    const supabase = createClient();
    const numericScore = score === '' ? null : Math.max(0, Math.min(maxScore, Number(score)));
    const { error } = await supabase
      .from('assignment_submissions')
      .update({ score: numericScore, feedback, graded_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, score: numericScore, feedback, graded_at: new Date().toISOString() } : r))
      );
    }
  }

  if (rows.length === 0) {
    return <p className="text-sm text-navy-500">No submissions yet.</p>;
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <SubmissionCard key={row.id} row={row} maxScore={maxScore} onGrade={handleGrade} />
      ))}
    </div>
  );
}

function SubmissionCard({
  row,
  maxScore,
  onGrade,
}: {
  row: SubmissionRow;
  maxScore: number;
  onGrade: (id: string, score: string, feedback: string) => Promise<void>;
}) {
  const [score, setScore] = useState(row.score?.toString() ?? '');
  const [feedback, setFeedback] = useState(row.feedback ?? '');
  const [saving, setSaving] = useState(false);

  return (
    <div className="border border-navy-100 rounded-2xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="font-medium text-navy-900">{row.student_name}</p>
          <p className="text-xs text-navy-500">{row.student_email}</p>
        </div>
        <span className="text-xs text-navy-500">Submitted {formatDateTime(row.submitted_at)}</span>
      </div>

      {row.content && <p className="text-sm text-navy-700 mt-3 whitespace-pre-line">{row.content}</p>}
      {row.attachment_url && (
        <div className="mt-2">
          <AttachmentLink path={row.attachment_url} label="View submitted file" />
        </div>
      )}

      <div className="grid sm:grid-cols-[120px_1fr] gap-3 mt-4">
        <input
          type="number"
          min="0"
          max={maxScore}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder={`/ ${maxScore}`}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
        />
        <input
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Feedback for the student"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
        />
      </div>
      <button
        onClick={async () => {
          setSaving(true);
          await onGrade(row.id, score, feedback);
          setSaving(false);
        }}
        disabled={saving}
        className="mt-3 bg-navy-950 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-800 disabled:opacity-60"
      >
        {saving ? 'Saving…' : row.graded_at ? 'Update grade' : 'Save grade'}
      </button>
    </div>
  );
}
