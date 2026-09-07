import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import AttachmentLink from '@/components/AttachmentLink';
import GroupProjectSubmissionForm from '@/components/GroupProjectSubmissionForm';
import { formatDateTime } from '@/lib/format';
import type { GroupProject } from '@/lib/types';

export default async function GroupProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from('group_projects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!project) notFound();
  const typedProject = project as GroupProject;

  const { data: course } = await supabase
    .from('courses')
    .select('slug, title')
    .eq('id', typedProject.course_id)
    .single();

  // Find the group this student belongs to for this project, if any.
  const { data: myGroups } = await supabase
    .from('project_groups')
    .select('id, name, group_project_id')
    .eq('group_project_id', params.id);

  const groupIds = (myGroups ?? []).map((g) => g.id);
  const { data: myMembership } = groupIds.length
    ? await supabase
        .from('project_group_members')
        .select('group_id')
        .eq('student_id', user!.id)
        .in('group_id', groupIds)
        .maybeSingle()
    : { data: null };

  const myGroup = (myGroups ?? []).find((g) => g.id === myMembership?.group_id) ?? null;

  let members: { student_id: string; full_name: string | null }[] = [];
  let submission: { content: string | null; attachment_url: string | null; score: number | null; feedback: string | null; graded_at: string | null } | null =
    null;

  if (myGroup) {
    const { data: memberRows } = await supabase
      .from('project_group_members')
      .select('student_id, profile:profiles(full_name)')
      .eq('group_id', myGroup.id);

    members = (memberRows ?? []).map((m) => ({
      student_id: m.student_id,
      full_name: (m.profile as unknown as { full_name: string | null } | null)?.full_name ?? null,
    }));

    const { data: sub } = await supabase
      .from('project_submissions')
      .select('*')
      .eq('group_id', myGroup.id)
      .maybeSingle();
    submission = sub;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={course ? `/dashboard/courses/${course.slug}` : '/dashboard/group-projects'}
        className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-900"
      >
        <ArrowLeft size={16} /> Back to {course?.title ?? 'group projects'}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-navy-900">{typedProject.title}</h1>
        <p className="text-sm text-navy-500 mt-1">
          Due {formatDateTime(typedProject.due_at)} · {typedProject.max_score} points
        </p>
      </div>

      {typedProject.instructions && (
        <div className="bg-white border border-navy-100 rounded-2xl p-6">
          <h2 className="font-semibold text-navy-900 mb-2">Instructions</h2>
          <p className="text-navy-600 whitespace-pre-line">{typedProject.instructions}</p>
          {typedProject.attachment_url && (
            <div className="mt-3">
              <AttachmentLink path={typedProject.attachment_url} label="Download project brief" />
            </div>
          )}
        </div>
      )}

      {!myGroup ? (
        <div className="bg-white border border-dashed border-navy-200 rounded-2xl p-6 text-center">
          <Users2 className="mx-auto text-navy-300" size={28} />
          <p className="mt-3 text-navy-600 text-sm">
            You haven&apos;t been added to a group for this project yet. Contact your instructor.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-navy-100 rounded-2xl p-6">
            <h2 className="font-semibold text-navy-900 mb-3">Your group: {myGroup.name}</h2>
            <ul className="flex flex-wrap gap-2">
              {members.map((m) => (
                <li
                  key={m.student_id}
                  className="bg-navy-50 text-navy-800 text-sm px-3 py-1.5 rounded-full"
                >
                  {m.full_name ?? 'Student'}
                </li>
              ))}
            </ul>
          </div>

          {submission?.graded_at && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <h2 className="font-semibold text-emerald-900 mb-1">
                Graded: {submission.score}/{typedProject.max_score}
              </h2>
              {submission.feedback && (
                <p className="text-emerald-800 text-sm mt-2">{submission.feedback}</p>
              )}
            </div>
          )}

          <div className="bg-white border border-navy-100 rounded-2xl p-6">
            <h2 className="font-semibold text-navy-900 mb-4">Group submission</h2>
            <GroupProjectSubmissionForm
              groupId={myGroup.id}
              userId={user!.id}
              initialContent={submission?.content ?? ''}
              initialAttachment={submission?.attachment_url ?? null}
            />
          </div>
        </>
      )}
    </div>
  );
}
