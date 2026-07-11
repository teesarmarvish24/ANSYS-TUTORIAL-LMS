import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin' },
  { label: 'Recordings', href: '/admin/recordings' },
  { label: 'Assessments', href: '/admin/assessments' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Students', href: '/admin/students' },
  { label: 'Requests', href: '/admin/requests' },
];

export default async function AdminAnalyticsPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: modules } = await supabase.from('modules').select('*').order('sort_order');
  const { data: tracking } = await supabase
    .from('module_time_tracking')
    .select('*, profiles(*), modules(*)');

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <AnalyticsDashboard tracking={(tracking as any) ?? []} modules={modules ?? []} />
    </DashboardShell>
  );
}
