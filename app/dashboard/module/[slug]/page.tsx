import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';
import { PlayCircle } from 'lucide-react';

const NAV_ITEMS = [{ label: 'Overview', href: '/dashboard' }];

export default async function ModulePage({ params }: { params: { slug: string } }) {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: mod } = await supabase
    .from('modules')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!mod) notFound();

  const { data: recordings } = await supabase
    .from('recordings')
    .select('*')
    .eq('module_id', mod.id)
    .order('sort_order', { ascending: true });

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <Link href="/dashboard" className="text-sm text-navy-700 hover:underline">
        ← Back to modules
      </Link>
      <h1 className="text-2xl font-bold text-navy-900 mt-3">{mod.title}</h1>
      <p className="text-gray-500 mt-1">{mod.description}</p>

      <div className="mt-8 space-y-3">
        {(recordings ?? []).map((rec: any) => (
          <Link
            key={rec.id}
            href={`/dashboard/recording/${rec.id}`}
            className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="bg-navy-900 text-white rounded-lg p-2.5 shrink-0">
              <PlayCircle size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-navy-900 truncate">{rec.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {rec.class_date ? new Date(rec.class_date).toLocaleDateString() : ''}
                {rec.duration_minutes ? ` · ${rec.duration_minutes} min` : ''}
              </p>
            </div>
          </Link>
        ))}

        {(!recordings || recordings.length === 0) && (
          <p className="text-gray-500 text-sm">No recordings yet in this module.</p>
        )}
      </div>
    </DashboardShell>
  );
}
