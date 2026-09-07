import Link from 'next/link';
import { ClipboardList, CheckCircle2, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import EmptyState from '@/components/EmptyState';
import { formatDate } from '@/lib/format';

export default async function AssignmentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, course:courses(title)')
    .eq('user_id', user!.id)
    .eq('status', 'active');

  const courseIds = (enrollments ?? []).map((e) => e.course_id);
  const courseTitleById = new Map(
    (enrollments ?? []).map((e) => [e.course_id, (e.course as unknown as { title: string } | null)?.title ?? ''])
  );

  const { data: assignments } = courseIds.length
    ? await supabase
        .from('assignments')
        .select('*')
        .in('course_id', courseIds)
        .order('due_at', { ascending: true })
    : { data: [] };

  const { data: submissions } = await supabase
    .from('assignment_submissions')
    .select('assignment_id, score, graded_at')
    .eq('student_id', user!.id);

  const submissionByAssignment = new Map((submissions ?? []).map((s) => [s.assignment_id, s]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Assignments</h1>
        <p className="text-navy-500 mt-1">Across all the courses you&apos;re enrolled in.</p>
      </div>

      {assignments && assignments.length > 0 ? (
        <div className="bg-white border border-navy-100 rounded-2xl divide-y divide-navy-100">
          {assignments.map((a) => {
            const submission = submissionByAssignment.get(a.id);
            return (
              <Link
                key={a.id}
                href={`/dashboard/assignments/${a.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-navy-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-navy-900">{a.title}</p>
                  <p className="text-xs text-navy-500 mt-0.5">{courseTitleById.get(a.course_id)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {submission ? (
                    submission.graded_at ? (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 size={16} /> {submission.score}/{a.max_score}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-navy-500">
                        <Clock size={16} /> Submitted
                      </span>
                    )
                  ) : (
                    <span className="text-sm text-navy-500">Due {formatDate(a.due_at)}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={ClipboardList} title="No assignments yet" description="Assignments from your courses will show up here." />
      )}
    </div>
  );
}
