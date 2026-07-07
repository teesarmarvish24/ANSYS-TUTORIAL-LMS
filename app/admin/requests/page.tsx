import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';
import RequestsManager from '@/components/RequestsManager';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin' },
  { label: 'Recordings', href: '/admin/recordings' },
  { label: 'Students', href: '/admin/students' },
  { label: 'Requests', href: '/admin/requests' },
];

export default async function AdminRequestsPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: requests } = await supabase
    .from('enrollment_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <RequestsManager requests={requests ?? []} />
    </DashboardShell>
  );
}
