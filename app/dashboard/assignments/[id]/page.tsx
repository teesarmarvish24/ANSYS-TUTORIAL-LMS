import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import AttachmentLink from '@/components/AttachmentLink';
import AssignmentSubmissionForm from '@/components/AssignmentSubmissionForm';
import { formatDateTime } from '@/lib/format';
import type { Assignment } from '@/lib/types';

export default async function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignment } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!assignment) notFound();
  const typedAssignment = assignment as Assignment;

  const { data: course } = await supabase
    .from('courses')
    .select('slug, title')
    .eq('id', typedAssignment.course_id)
    .single();

  const { data: submission } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', params.id)
    .eq('student_id', user!.id)
    .maybeSingle();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={course ? `/dashboard/courses/${course.slug}` : '/dashboard/assignments'}
        className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-900"
      >
        <ArrowLeft size={16} /> Back to {course?.title ?? 'assignments'}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-navy-900">{typedAssignment.title}</h1>
        <p className="text-sm text-navy-500 mt-1">
          Due {formatDateTime(typedAssignment.due_at)} · {typedAssignment.max_score} points
        </p>
      </div>

      {typedAssignment.instructions && (
        <div className="bg-white border border-navy-100 rounded-2xl p-6">
          <h2 className="font-semibold text-navy-900 mb-2">Instructions</h2>
          <p className="text-navy-600 whitespace-pre-line">{typedAssignment.instructions}</p>
          {typedAssignment.attachment_url && (
            <div className="mt-3">
              <AttachmentLink path={typedAssignment.attachment_url} label="Download assignment brief" />
            </div>
          )}
        </div>
      )}

      {submission?.graded_at && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <h2 className="font-semibold text-emerald-900 mb-1">
            Graded: {submission.score}/{typedAssignment.max_score}
          </h2>
          {submission.feedback && <p className="text-emerald-800 text-sm mt-2">{submission.feedback}</p>}
        </div>
      )}

      <div className="bg-white border border-navy-100 rounded-2xl p-6">
        <h2 className="font-semibold text-navy-900 mb-4">Your submission</h2>
        <AssignmentSubmissionForm
          assignmentId={typedAssignment.id}
          userId={user!.id}
          initialContent={submission?.content ?? ''}
          initialAttachment={submission?.attachment_url ?? null}
        />
      </div>
    </div>
  );
}
