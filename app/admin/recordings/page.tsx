import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';
import RecordingsManager from '@/components/RecordingsManager';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin' },
  { label: 'Recordings', href: '/admin/recordings' },
  { label: 'Assessments', href: '/admin/assessments' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Students', href: '/admin/students' },
  { label: 'Requests', href: '/admin/requests' },
];

export default async function AdminRecordingsPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: modules } = await supabase.from('modules').select('*').order('sort_order');
  const { data: recordings } = await supabase
    .from('recordings')
    .select('*, modules(title)')
    .order('created_at', { ascending: false });

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <RecordingsManager modules={modules ?? []} recordings={recordings ?? []} />
    </DashboardShell>
  );
}
