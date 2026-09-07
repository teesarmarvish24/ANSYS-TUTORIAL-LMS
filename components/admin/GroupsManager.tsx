'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AttachmentLink from '@/components/AttachmentLink';

interface Student {
  id: string;
  full_name: string | null;
  email: string;
}

interface GroupWithMembers {
  id: string;
  name: string;
  members: Student[];
  submission: {
    content: string | null;
    attachment_url: string | null;
    score: number | null;
    feedback: string | null;
  } | null;
}

export default function GroupsManager({
  groupProjectId,
  maxScore,
  enrolledStudents,
  initialGroups,
}: {
  groupProjectId: string;
  maxScore: number;
  enrolledStudents: Student[];
  initialGroups: GroupWithMembers[];
}) {
  const [groups, setGroups] = useState(initialGroups);
  const [newGroupName, setNewGroupName] = useState('');

  const assignedStudentIds = new Set(groups.flatMap((g) => g.members.map((m) => m.id)));

  async function handleAddGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('project_groups')
      .insert({ group_project_id: groupProjectId, name: newGroupName.trim() })
      .select()
      .single();
    if (!error && data) {
      setGroups((prev) => [...prev, { id: data.id, name: data.name, members: [], submission: null }]);
      setNewGroupName('');
    }
  }

  async function handleDeleteGroup(groupId: string) {
    if (!confirm('Delete this group?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('project_groups').delete().eq('id', groupId);
    if (!error) setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }

  async function handleAddMember(groupId: string, studentId: string) {
    if (!studentId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('project_group_members')
      .insert({ group_id: groupId, student_id: studentId });
    if (!error) {
      const student = enrolledStudents.find((s) => s.id === studentId);
      if (student) {
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? { ...g, members: [...g.members, student] } : g))
        );
      }
    }
  }

  async function handleRemoveMember(groupId: string, studentId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('project_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('student_id', studentId);
    if (!error) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, members: g.members.filter((m) => m.id !== studentId) } : g
        )
      );
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleAddGroup} className="flex gap-2">
        <input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New group name (e.g. Group A)"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 bg-navy-950 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-navy-800"
        >
          <Plus size={16} /> Add group
        </button>
      </form>

      {groups.map((group) => {
        const available = enrolledStudents.filter(
          (s) => !group.members.some((m) => m.id === s.id) && !assignedStudentIds.has(s.id)
        );
        return (
          <div key={group.id} className="bg-white border border-navy-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-navy-900">{group.name}</h3>
              <button onClick={() => handleDeleteGroup(group.id)} className="p-1.5 text-navy-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>

            <ul className="flex flex-wrap gap-2 mb-3">
              {group.members.map((m) => (
                <li key={m.id} className="flex items-center gap-1.5 bg-navy-50 text-navy-800 text-sm px-3 py-1.5 rounded-full">
                  {m.full_name ?? m.email}
                  <button onClick={() => handleRemoveMember(group.id, m.id)} className="text-navy-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </li>
              ))}
              {group.members.length === 0 && <p className="text-sm text-navy-400">No members yet.</p>}
            </ul>

            {available.length > 0 && (
              <select
                onChange={(e) => {
                  handleAddMember(group.id, e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              >
                <option value="" disabled>Add a student…</option>
                {available.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name ?? s.email}</option>
                ))}
              </select>
            )}

            {group.submission && (
              <div className="mt-4 pt-4 border-t border-navy-100">
                <GroupGradeForm groupId={group.id} maxScore={maxScore} submission={group.submission} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GroupGradeForm({
  groupId,
  maxScore,
  submission,
}: {
  groupId: string;
  maxScore: number;
  submission: { content: string | null; attachment_url: string | null; score: number | null; feedback: string | null };
}) {
  const [score, setScore] = useState(submission.score?.toString() ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const numericScore = score === '' ? null : Math.max(0, Math.min(maxScore, Number(score)));
    const { error } = await supabase
      .from('project_submissions')
      .update({ score: numericScore, feedback, graded_at: new Date().toISOString() })
      .eq('group_id', groupId);
    setSaving(false);
    if (!error) setSaved(true);
  }

  return (
    <div>
      {submission.content && <p className="text-sm text-navy-700 whitespace-pre-line mb-2">{submission.content}</p>}
      {submission.attachment_url && (
        <div className="mb-3">
          <AttachmentLink path={submission.attachment_url} label="View submitted file" />
        </div>
      )}
      <div className="grid sm:grid-cols-[120px_1fr] gap-3">
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
          placeholder="Feedback"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 bg-navy-950 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-800 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save grade'}
      </button>
      {saved && <span className="ml-3 text-sm text-emerald-700">Saved.</span>}
    </div>
  );
}
