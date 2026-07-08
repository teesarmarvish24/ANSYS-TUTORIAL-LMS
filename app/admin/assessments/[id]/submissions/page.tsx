import Link from 'next/link';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';
import SubmissionsGrader from '@/components/SubmissionsGrader';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin' },
  { label: 'Recordings', href: '/admin/recordings' },
  { label: 'Assessments', href: '/admin/assessments' },
  { label: 'Students', href: '/admin/students' },
  { label: 'Requests', href: '/admin/requests' },
];

export default async function AssessmentSubmissionsPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', params.id)
    .single();

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, profiles(*), answers(*, questions(*))')
    .eq('assessment_id', params.id)
    .order('submitted_at', { ascending: false });

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <Link href="/admin/assessments" className="text-sm text-navy-700 hover:underline">
        ← Back to assessments
      </Link>
      <h1 className="text-2xl font-bold text-navy-900 mt-3">{assessment?.title}</h1>
      <p className="text-gray-500 mt-1">Review and grade open-ended answers below.</p>

      <div className="mt-6">
        <SubmissionsGrader submissions={(submissions as any) ?? []} />
      </div>
    </DashboardShell>
  );
}
