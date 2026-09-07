'use client';

import { useState } from 'react';
import { Plus, UserX, UserCheck, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/format';
import type { Course, Profile } from '@/lib/types';

interface StudentRow extends Profile {
  enrollments: { course_id: string; status: string }[];
}

export default function StudentsManager({
  initialStudents,
  courses,
}: {
  initialStudents: StudentRow[];
  courses: Course[];
}) {
  const [students, setStudents] = useState(initialStudents);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteCourse, setInviteCourse] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    setInviting(true);
    const res = await fetch('/api/admin/invite-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), fullName: inviteName.trim(), courseId: inviteCourse || null }),
    });
    const data = await res.json();
    setInviting(false);
    if (!res.ok) {
      setInviteError(data.error || 'Could not invite student.');
      return;
    }
    setInviteSuccess(`Invite sent to ${inviteEmail}.`);
    setInviteEmail('');
    setInviteName('');
    setInviteCourse('');
  }

  async function toggleStatus(student: StudentRow) {
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', student.id);
    if (!error) {
      setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, status: newStatus } : s)));
    }
  }

  async function handleDelete(student: StudentRow) {
    if (!confirm(`Permanently delete ${student.full_name ?? student.email}'s account? This cannot be undone.`)) return;
    const res = await fetch('/api/admin/delete-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student.id }),
    });
    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
    }
  }

  async function grantCourse(studentId: string, courseId: string) {
    if (!courseId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('enrollments')
      .upsert({ user_id: studentId, course_id: courseId, status: 'active', source: 'admin_grant' }, { onConflict: 'user_id,course_id' });
    if (!error) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                enrollments: [...s.enrollments.filter((e) => e.course_id !== courseId), { course_id: courseId, status: 'active' }],
              }
            : s
        )
      );
    }
  }

  async function revokeCourse(studentId: string, courseId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'revoked' })
      .eq('user_id', studentId)
      .eq('course_id', courseId);
    if (!error) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, enrollments: s.enrollments.map((e) => (e.course_id === courseId ? { ...e, status: 'revoked' } : e)) }
            : s
        )
      );
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => setShowInvite((s) => !s)}
          className="inline-flex items-center gap-2 bg-navy-950 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-navy-800"
        >
          <Plus size={16} /> Admit a student
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="bg-white border border-navy-100 rounded-2xl p-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Student email"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
            />
            <input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Full name"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
            />
          </div>
          <select
            value={inviteCourse}
            onChange={(e) => setInviteCourse(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
          >
            <option value="">Don&apos;t grant a course yet</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>Grant free access: {c.title}</option>
            ))}
          </select>
          {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
          {inviteSuccess && <p className="text-sm text-emerald-700">{inviteSuccess}</p>}
          <button
            type="submit"
            disabled={inviting}
            className="bg-navy-950 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-800 disabled:opacity-60"
          >
            {inviting ? 'Sending invite…' : 'Send invite'}
          </button>
        </form>
      )}

      <div className="bg-white border border-navy-100 rounded-2xl divide-y divide-navy-100">
        {students.length === 0 && <p className="text-sm text-navy-500 p-6">No students yet.</p>}
        {students.map((student) => {
          const activeEnrollments = student.enrollments.filter((e) => e.status === 'active');
          const isExpanded = expandedId === student.id;
          return (
            <div key={student.id}>
              <div className="flex items-center justify-between gap-4 px-5 py-4 flex-wrap">
                <div>
                  <p className="font-medium text-navy-900">{student.full_name ?? 'Unnamed'}</p>
                  <p className="text-xs text-navy-500">
                    {student.email} · Joined {formatDate(student.created_at)} ·{' '}
                    {student.status === 'active' ? (
                      <span className="text-emerald-700">Active</span>
                    ) : (
                      <span className="text-amber-700">Inactive</span>
                    )}
                    {' · '}
                    {activeEnrollments.length} course{activeEnrollments.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : student.id)}
                    className="p-2 text-navy-500 hover:text-navy-900 hover:bg-navy-50 rounded-lg"
                    title="Manage enrollments"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <button
                    onClick={() => toggleStatus(student)}
                    title={student.status === 'active' ? 'Deactivate' : 'Activate'}
                    className="p-2 text-navy-500 hover:text-navy-900 hover:bg-navy-50 rounded-lg"
                  >
                    {student.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(student)}
                    title="Delete permanently"
                    className="p-2 text-navy-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 bg-navy-50/40">
                  <p className="text-xs font-semibold text-navy-700 mb-2">Courses</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {courses.map((course) => {
                      const enrollment = student.enrollments.find((e) => e.course_id === course.id);
                      const active = enrollment?.status === 'active';
                      return (
                        <button
                          key={course.id}
                          onClick={() =>
                            active ? revokeCourse(student.id, course.id) : grantCourse(student.id, course.id)
                          }
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                            active
                              ? 'bg-navy-900 text-white border-navy-900'
                              : 'bg-white text-navy-600 border-navy-200 hover:border-navy-400'
                          }`}
                        >
                          {course.title} {active ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
