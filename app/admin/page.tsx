import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin' },
  { label: 'Recordings', href: '/admin/recordings' },
  { label: 'Assessments', href: '/admin/assessments' },
  { label: 'Students', href: '/admin/students' },
  { label: 'Requests', href: '/admin/requests' },
];

export default async function AdminOverview() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const [{ count: activeStudents }, { count: pendingRequests }, { count: totalRecordings }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .eq('status', 'active'),
      supabase
        .from('enrollment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('recordings').select('*', { count: 'exact', head: true }),
    ]);

  const stats = [
    { label: 'Active Students', value: activeStudents ?? 0 },
    { label: 'Pending Requests', value: pendingRequests ?? 0 },
    { label: 'Total Recordings', value: totalRecordings ?? 0 },
  ];

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <h1 className="text-2xl font-bold text-navy-900">Admin Overview</h1>
      <p className="text-gray-500 mt-1">A quick snapshot of the programme.</p>

      <div className="grid sm:grid-cols-3 gap-5 mt-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-6">
            <p className="text-3xl font-bold text-navy-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
