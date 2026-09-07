import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin' },
  { label: 'Courses', href: '/admin/courses' },
  { label: 'Students', href: '/admin/students' },
  { label: 'Announcements', href: '/admin/announcements' },
  { label: 'Payments', href: '/admin/payments' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/unauthorized');

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile.full_name || profile.email}>
      {children}
    </DashboardShell>
  );
}
