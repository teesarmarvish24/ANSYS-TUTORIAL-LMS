'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, ClipboardList } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Module, Assessment, QuestionType } from '@/lib/types';

interface DraftQuestion {
  question_text: string;
  type: QuestionType;
  options: string[];
  correct_option_index: number;
  points: number;
}

const emptyQuestion = (): DraftQuestion => ({
  question_text: '',
  type: 'mcq',
  options: ['', ''],
  correct_option_index: 0,
  points: 1,
});

export default function AssessmentsManager({
  modules,
  assessments,
}: {
  modules: Module[];
  assessments: (Assessment & { modules?: { title: string } })[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function resetForm() {
    setTitle('');
    setDescription('');
    setModuleId('');
    setOpensAt('');
    setClosesAt('');
    setQuestions([emptyQuestion()]);
    setError('');
  }

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[oIndex] = value;
        return { ...q, options };
      })
    );
  }

  function addOption(qIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ''] } : q))
    );
  }

  function removeOption(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = q.options.filter((_, idx) => idx !== oIndex);
        const correct_option_index =
          q.correct_option_index >= options.length ? 0 : q.correct_option_index;
        return { ...q, options, correct_option_index };
      })
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !moduleId) {
      setError('Title and module are required.');
      return;
    }
    if (questions.length === 0) {
      setError('Add at least one question.');
      return;
    }
    for (const q of questions) {
      if (!q.question_text.trim()) {
        setError('Every question needs text.');
        return;
      }
      if (q.type === 'mcq' && q.options.filter((o) => o.trim()).length < 2) {
        setError('Multiple choice questions need at least 2 options.');
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();

    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        module_id: moduleId,
        opens_at: opensAt ? new Date(opensAt).toISOString() : null,
        closes_at: closesAt ? new Date(closesAt).toISOString() : null,
      })
      .select()
      .single();

    if (assessmentError || !assessment) {
      setLoading(false);
      setError('Failed to create assessment. ' + assessmentError?.message);
      return;
    }

    const questionRows = questions.map((q, index) => ({
      assessment_id: assessment.id,
      question_text: q.question_text.trim(),
      type: q.type,
      options: q.type === 'mcq' ? q.options.filter((o) => o.trim()) : null,
      correct_option_index: q.type === 'mcq' ? q.correct_option_index : null,
      points: q.points || 1,
      sort_order: index,
    }));

    const { error: questionsError } = await supabase.from('questions').insert(questionRows);
    setLoading(false);

    if (questionsError) {
      setError('Assessment created, but questions failed to save. ' + questionsError.message);
      return;
    }

    setShowForm(false);
    resetForm();
    router.refresh();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('assessments').delete().eq('id', id);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-navy-900">Assessments</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-navy-950 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-navy-800"
        >
          <Plus size={16} /> New Assessment
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {assessments.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-navy-900 text-white rounded-lg p-2.5 shrink-0">
                <ClipboardList size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-navy-900 truncate">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{a.modules?.title}</p>
                {(a.opens_at || a.closes_at) && (
                  <p className="text-xs text-navy-500 mt-0.5">
                    {a.opens_at ? `Opens ${new Date(a.opens_at).toLocaleString()}` : 'Open now'}
                    {a.closes_at ? ` · Closes ${new Date(a.closes_at).toLocaleString()}` : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href={`/admin/assessments/${a.id}/submissions`}
                className="text-navy-700 hover:underline text-sm font-medium px-2"
              >
                Submissions
              </Link>
              <button
                onClick={() => setDeleteTarget(a.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {assessments.length === 0 && (
          <p className="text-gray-500 text-sm">No assessments created yet.</p>
        )}
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-navy-900">New Assessment</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1">Module</label>
                <select
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
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
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1">
                    Opens at (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={opensAt}
                    onChange={(e) => setOpensAt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave blank to open immediately.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1">
                    Closes at (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={closesAt}
                    onChange={(e) => setClosesAt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave blank for no deadline.</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-semibold text-navy-900 mb-3">Questions</h3>
                <div className="space-y-5">
                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start gap-3">
                        <span className="text-xs font-semibold text-gray-400 mt-2">
                          Q{qIndex + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-500 text-xs font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <textarea
                        value={q.question_text}
                        onChange={(e) => updateQuestion(qIndex, { question_text: e.target.value })}
                        placeholder="Question text"
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2"
                      />

                      <div className="flex gap-3 items-center mt-3">
                        <select
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(qIndex, { type: e.target.value as QuestionType })
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="mcq">Multiple choice</option>
                          <option value="open_ended">Open-ended</option>
                        </select>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">Points</label>
                          <input
                            type="number"
                            min={1}
                            value={q.points}
                            onChange={(e) =>
                              updateQuestion(qIndex, { points: Number(e.target.value) })
                            }
                            className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm"
                          />
                        </div>
                      </div>

                      {q.type === 'mcq' && (
                        <div className="mt-3 space-y-2">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={q.correct_option_index === oIndex}
                                onChange={() =>
                                  updateQuestion(qIndex, { correct_option_index: oIndex })
                                }
                                title="Mark as correct answer"
                              />
                              <input
                                value={opt}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                              />
                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-xs text-navy-700 font-medium"
                          >
                            + Add option
                          </button>
                          <p className="text-xs text-gray-400">
                            Select the radio button next to the correct answer.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-4 text-sm font-semibold text-navy-700 flex items-center gap-1"
                >
                  <Plus size={14} /> Add another question
                </button>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-950 text-white font-semibold py-3 rounded-lg hover:bg-navy-800 disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Create Assessment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <p className="font-semibold text-navy-900">Delete this assessment?</p>
            <p className="text-sm text-gray-500 mt-2">
              This will also delete all questions and student submissions for it. This cannot be undone.
            </p>
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
