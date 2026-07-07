import Link from 'next/link';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard' },
];

export default async function StudentDashboard() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: modules } = await supabase
    .from('modules')
    .select('*, recordings(id)')
    .order('sort_order', { ascending: true });

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <h1 className="text-2xl font-bold text-navy-900">
        Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
      </h1>
      <p className="text-gray-500 mt-1">
        Pick a module below to continue watching your class recordings.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {(modules ?? []).map((mod: any) => (
          <Link
            key={mod.id}
            href={`/dashboard/module/${mod.slug}`}
            className="block bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-navy-900">{mod.title}</h3>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{mod.description}</p>
            <p className="text-xs text-navy-600 mt-4 font-medium">
              {mod.recordings?.length ?? 0} recording
              {(mod.recordings?.length ?? 0) === 1 ? '' : 's'}
            </p>
          </Link>
        ))}

        {(!modules || modules.length === 0) && (
          <p className="text-gray-500 text-sm col-span-full">
            No modules have been set up yet. Check back soon.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
