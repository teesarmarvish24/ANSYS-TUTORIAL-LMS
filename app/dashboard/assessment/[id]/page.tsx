import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';
import TakeAssessment from '@/components/TakeAssessment';

const NAV_ITEMS = [{ label: 'Overview', href: '/dashboard' }];

export default async function AssessmentPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*, modules(slug, title)')
    .eq('id', params.id)
    .single();

  if (!assessment) notFound();

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('assessment_id', params.id)
    .order('sort_order');

  const { data: existingSubmission } = await supabase
    .from('submissions')
    .select('*')
    .eq('assessment_id', params.id)
    .eq('student_id', profile?.id ?? '')
    .maybeSingle();

  let existingAnswers: any[] = [];
  if (existingSubmission) {
    const { data } = await supabase
      .from('answers')
      .select('*')
      .eq('submission_id', existingSubmission.id);
    existingAnswers = data ?? [];
  }

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <Link
        href={`/dashboard/module/${assessment.modules?.slug}`}
        className="text-sm text-navy-700 hover:underline"
      >
        ← Back to {assessment.modules?.title}
      </Link>
      <h1 className="text-2xl font-bold text-navy-900 mt-3">{assessment.title}</h1>
      {assessment.description && <p className="text-gray-500 mt-1">{assessment.description}</p>}

      <div className="mt-6">
        <TakeAssessment
          assessmentId={params.id}
          questions={questions ?? []}
          existingSubmission={existingSubmission ?? null}
          existingAnswers={existingAnswers}
        />
      </div>
    </DashboardShell>
  );
}
