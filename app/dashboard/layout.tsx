import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'My Courses', href: '/dashboard/courses' },
  { label: 'Assignments', href: '/dashboard/assignments' },
  { label: 'Group Projects', href: '/dashboard/group-projects' },
  { label: 'Announcements', href: '/dashboard/announcements' },
  { label: 'Analytics', href: '/dashboard/analytics' },
  { label: 'Payments', href: '/dashboard/payments' },
  { label: 'Browse Courses', href: '/courses' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) redirect('/unauthorized');
  if (profile.role === 'admin') redirect('/admin');
  if (profile.status !== 'active') redirect('/unauthorized');

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile.full_name || profile.email}>
      {children}
    </DashboardShell>
  );
}
