import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';
import StudentsManager from '@/components/StudentsManager';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin' },
  { label: 'Recordings', href: '/admin/recordings' },
  { label: 'Assessments', href: '/admin/assessments' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Students', href: '/admin/students' },
  { label: 'Requests', href: '/admin/requests' },
];

export default async function AdminStudentsPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <StudentsManager students={students ?? []} />
    </DashboardShell>
  );
}
