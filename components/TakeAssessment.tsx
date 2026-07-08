'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Question, Submission, Answer } from '@/lib/types';

export default function TakeAssessment({
  assessmentId,
  questions,
  existingSubmission,
  existingAnswers,
}: {
  assessmentId: string;
  questions: Question[];
  existingSubmission: Submission | null;
  existingAnswers: Answer[];
}) {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const alreadySubmitted = !!existingSubmission;

  function setResponse(questionId: string, value: string | number) {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    setError('');
    for (const q of questions) {
      if (responses[q.id] === undefined || responses[q.id] === '') {
        setError('Please answer every question before submitting.');
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError('You must be logged in.');
      return;
    }

    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({ assessment_id: assessmentId, student_id: user.id, max_score: maxScore })
      .select()
      .single();

    if (subError || !submission) {
      setLoading(false);
      setError('Failed to submit. ' + subError?.message);
      return;
    }

    let mcqScore = 0;
    const answerRows = questions.map((q) => {
      if (q.type === 'mcq') {
        const selected = Number(responses[q.id]);
        const correct = selected === q.correct_option_index;
        if (correct) mcqScore += q.points;
        return {
          submission_id: submission.id,
          question_id: q.id,
          selected_option_index: selected,
          is_correct: correct,
          points_awarded: correct ? q.points : 0,
        };
      }
      return {
        submission_id: submission.id,
        question_id: q.id,
        answer_text: String(responses[q.id]),
        points_awarded: null,
      };
    });

    await supabase.from('answers').insert(answerRows);

    const hasOpenEnded = questions.some((q) => q.type === 'open_ended');
    if (!hasOpenEnded) {
      await supabase
        .from('submissions')
        .update({ status: 'graded', total_score: mcqScore, graded_at: new Date().toISOString() })
        .eq('id', submission.id);
    }

    setLoading(false);
    router.refresh();
  }

  if (alreadySubmitted) {
    const answersByQuestion = Object.fromEntries(existingAnswers.map((a) => [a.question_id, a]));
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <p className="font-semibold text-navy-900">
          {existingSubmission.status === 'graded' ? 'Result' : 'Submitted — pending review'}
        </p>
        {existingSubmission.status === 'graded' && (
          <p className="text-2xl font-bold text-navy-900 mt-2">
            {existingSubmission.total_score} / {existingSubmission.max_score}
          </p>
        )}
        {existingSubmission.status === 'submitted' && (
          <p className="text-sm text-gray-500 mt-2">
            Your multiple-choice answers were scored automatically. Open-ended answers are
            awaiting review from the instructor — your final score will appear here once graded.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {questions.map((q) => {
            const ans = answersByQuestion[q.id];
            return (
              <div key={q.id} className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-navy-900">{q.question_text}</p>
                {q.type === 'mcq' ? (
                  <p
                    className={`text-sm mt-1 ${
                      ans?.is_correct ? 'text-green-700' : 'text-red-600'
                    }`}
                  >
                    Your answer:{' '}
                    {ans?.selected_option_index !== null && ans?.selected_option_index !== undefined
                      ? q.options?.[ans.selected_option_index]
                      : '—'}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-lg p-3">
                    {ans?.answer_text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {questions.map((q, index) => (
        <div key={q.id} className="bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-sm font-medium text-navy-900">
            {index + 1}. {q.question_text}{' '}
            <span className="text-xs text-gray-400 font-normal">({q.points} pt{q.points === 1 ? '' : 's'})</span>
          </p>

          {q.type === 'mcq' ? (
            <div className="mt-3 space-y-2">
              {(q.options ?? []).map((opt, oIndex) => (
                <label
                  key={oIndex}
                  className="flex items-center gap-2 text-sm text-navy-800 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={responses[q.id] === oIndex}
                    onChange={() => setResponse(q.id, oIndex)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : (
            <textarea
              rows={4}
              value={(responses[q.id] as string) ?? ''}
              onChange={(e) => setResponse(q.id, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mt-3"
              placeholder="Type your answer here…"
            />
          )}
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-navy-950 text-white font-semibold py-3 rounded-lg hover:bg-navy-800 disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'Submit Assessment'}
      </button>
    </div>
  );
}
