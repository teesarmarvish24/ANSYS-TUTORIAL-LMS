'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Submission, Answer, Question, Profile } from '@/lib/types';

interface FullSubmission extends Submission {
  profiles?: Profile;
  answers: (Answer & { questions?: Question })[];
}

export default function SubmissionsGrader({
  submissions,
}: {
  submissions: FullSubmission[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function updateDraft(answerId: string, value: string) {
    setDrafts((prev) => ({ ...prev, [answerId]: value }));
  }

  async function gradeAnswer(answer: Answer, submission: FullSubmission) {
    const raw = drafts[answer.id];
    const points = raw !== undefined ? Number(raw) : answer.points_awarded ?? 0;
    if (Number.isNaN(points)) return;

    setSaving(answer.id);
    const supabase = createClient();

    await supabase.from('answers').update({ points_awarded: points }).eq('id', answer.id);

    // Recompute the submission's total score from all its answers
    const { data: allAnswers } = await supabase
      .from('answers')
      .select('points_awarded')
      .eq('submission_id', submission.id);

    const total = (allAnswers ?? []).reduce((sum, a) => sum + (a.points_awarded ?? 0), 0);

    await supabase
      .from('submissions')
      .update({ status: 'graded', total_score: total, graded_at: new Date().toISOString() })
      .eq('id', submission.id);

    setSaving(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {submissions.map((sub) => (
        <div key={sub.id} className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-navy-900">{sub.profiles?.full_name}</p>
              <p className="text-xs text-gray-500">{sub.profiles?.email}</p>
            </div>
            <div className="text-right">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  sub.status === 'graded'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {sub.status === 'graded' ? 'Graded' : 'Pending review'}
              </span>
              {sub.total_score !== null && (
                <p className="text-sm text-gray-500 mt-1">
                  Score: {sub.total_score} / {sub.max_score}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {sub.answers.map((ans) => (
              <div key={ans.id} className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-navy-900">{ans.questions?.question_text}</p>

                {ans.questions?.type === 'mcq' ? (
                  <p
                    className={`text-sm mt-1 ${
                      ans.is_correct ? 'text-green-700' : 'text-red-600'
                    }`}
                  >
                    Answered:{' '}
                    {ans.selected_option_index !== null
                      ? ans.questions?.options?.[ans.selected_option_index]
                      : '—'}{' '}
                    {ans.is_correct ? '(correct)' : '(incorrect)'} · {ans.points_awarded ?? 0}/
                    {ans.questions?.points} pts
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-lg p-3">
                      {ans.answer_text || '(no answer given)'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-xs text-gray-500">Points (max {ans.questions?.points}):</label>
                      <input
                        type="number"
                        min={0}
                        max={ans.questions?.points}
                        defaultValue={ans.points_awarded ?? ''}
                        onChange={(e) => updateDraft(ans.id, e.target.value)}
                        className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => gradeAnswer(ans, sub)}
                        disabled={saving === ans.id}
                        className="text-xs font-semibold text-navy-700 hover:underline disabled:opacity-50"
                      >
                        {saving === ans.id ? 'Saving…' : 'Save grade'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {submissions.length === 0 && (
        <p className="text-gray-500 text-sm">No submissions yet for this assessment.</p>
      )}
    </div>
  );
}
