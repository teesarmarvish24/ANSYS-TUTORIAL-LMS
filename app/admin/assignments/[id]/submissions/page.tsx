import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import SubmissionsGrader from '@/components/admin/SubmissionsGrader';
import type { Assignment } from '@/lib/types';

export default async function AssignmentSubmissionsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: assignment } = await supabase.from('assignments').select('*').eq('id', params.id).single();
  if (!assignment) notFound();
  const typedAssignment = assignment as Assignment;

  const { data: course } = await supabase.from('courses').select('id').eq('id', typedAssignment.course_id).single();

  const { data: submissions } = await supabase
    .from('assignment_submissions')
    .select('*, profile:profiles(full_name, email)')
    .eq('assignment_id', params.id)
    .order('submitted_at', { ascending: false });

  const rows = (submissions ?? []).map((s) => {
    const profile = s.profile as unknown as { full_name: string | null; email: string } | null;
    return {
      id: s.id,
      student_id: s.student_id,
      student_name: profile?.full_name ?? 'Student',
      student_email: profile?.email ?? '',
      content: s.content,
      attachment_url: s.attachment_url,
      score: s.score,
      feedback: s.feedback,
      submitted_at: s.submitted_at,
      graded_at: s.graded_at,
    };
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={course ? `/admin/courses/${course.id}` : '/admin/courses'}
        className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-900"
      >
        <ArrowLeft size={16} /> Back to course
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-navy-900">{typedAssignment.title}</h1>
        <p className="text-navy-500 mt-1">{rows.length} submission{rows.length === 1 ? '' : 's'}</p>
      </div>

      <SubmissionsGrader maxScore={typedAssignment.max_score} initialSubmissions={rows} />
    </div>
  );
}
