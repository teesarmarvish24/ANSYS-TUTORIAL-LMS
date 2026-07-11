import Link from 'next/link';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';
import { PlayCircle, ClipboardList, Lock, Clock, ArrowRight } from 'lucide-react';

const NAV_ITEMS = [{ label: 'Overview', href: '/dashboard' }];

function getAssessmentState(opensAt: string | null, closesAt: string | null) {
  const now = new Date();
  if (opensAt && new Date(opensAt) > now) {
    return { locked: true, label: `Opens ${new Date(opensAt).toLocaleDateString()}` };
  }
  if (closesAt && new Date(closesAt) < now) {
    return { locked: true, label: 'Closed' };
  }
  return { locked: false, label: null as string | null };
}

export default async function StudentDashboard() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: modules } = await supabase
    .from('modules')
    .select('*, recordings(id), assessments(*)')
    .order('sort_order', { ascending: true });

  // Flatten recent recordings across all modules (latest 6)
  const { data: recentRecordings } = await supabase
    .from('recordings')
    .select('*, modules(title, slug)')
    .order('created_at', { ascending: false })
    .limit(6);

  // Flatten all assessments across modules for the Assessments section
  const allAssessments = (modules ?? []).flatMap((m: any) =>
    (m.assessments ?? []).map((a: any) => ({ ...a, moduleTitle: m.title, moduleSlug: m.slug }))
  );

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s where you left off.</p>
      </div>

      {/* Modules */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-8 mb-3">
        Modules
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(modules ?? []).map((mod: any, i: number) => (
          <Link
            key={mod.id}
            href={`/dashboard/module/${mod.slug}`}
            style={{ ['--delay' as any]: `${i * 60}ms` }}
            className="block bg-white border border-gray-100 rounded-2xl p-6 card-hover press-scale animate-fade-in-up stagger"
          >
            <h3 className="font-semibold text-navy-900">{mod.title}</h3>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{mod.description}</p>
            <div className="flex items-center gap-3 mt-4 text-xs text-navy-600 font-medium">
              <span>{mod.recordings?.length ?? 0} recording{(mod.recordings?.length ?? 0) === 1 ? '' : 's'}</span>
              {mod.assessments?.length > 0 && (
                <span className="text-navy-400">· {mod.assessments.length} assessment{mod.assessments.length === 1 ? '' : 's'}</span>
              )}
            </div>
          </Link>
        ))}

        {(!modules || modules.length === 0) && (
          <p className="text-gray-500 text-sm col-span-full">
            No modules have been set up yet. Check back soon.
          </p>
        )}
      </div>

      {/* Recordings */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-10 mb-3">
        Recent Recordings
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(recentRecordings ?? []).map((rec: any, i: number) => (
          <Link
            key={rec.id}
            href={`/dashboard/recording/${rec.id}`}
            style={{ ['--delay' as any]: `${i * 50}ms` }}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 card-hover press-scale animate-fade-in-up stagger"
          >
            <div className="bg-navy-900 text-white rounded-lg p-2.5 shrink-0">
              <PlayCircle size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-navy-900 truncate">{rec.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{rec.modules?.title}</p>
            </div>
          </Link>
        ))}

        {(!recentRecordings || recentRecordings.length === 0) && (
          <p className="text-gray-500 text-sm col-span-full">
            No recordings uploaded yet. Check back after your next class.
          </p>
        )}
      </div>

      {/* Assessments */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-10 mb-3">
        Assessments
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAssessments.map((a: any, i: number) => {
          const { locked, label } = getAssessmentState(a.opens_at, a.closes_at);
          const Card = (
            <div
              style={{ ['--delay' as any]: `${i * 50}ms` }}
              className={`flex items-center gap-3 border rounded-xl p-4 animate-fade-in-up stagger transition-all ${
                locked
                  ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                  : 'bg-white border-gray-100 card-hover press-scale cursor-pointer'
              }`}
            >
              <div
                className={`rounded-lg p-2.5 shrink-0 ${
                  locked ? 'bg-gray-300 text-white' : 'bg-navy-700 text-white'
                }`}
              >
                {locked ? <Lock size={18} /> : <ClipboardList size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-navy-900 truncate">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{a.moduleTitle}</p>
                {label && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Clock size={12} /> {label}
                  </p>
                )}
              </div>
              {!locked && <ArrowRight size={16} className="text-navy-400 shrink-0" />}
            </div>
          );

          return locked ? (
            <div key={a.id} aria-disabled="true">
              {Card}
            </div>
          ) : (
            <Link key={a.id} href={`/dashboard/assessment/${a.id}`}>
              {Card}
            </Link>
          );
        })}

        {allAssessments.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full">
            No assessments available yet. They&apos;ll appear here as soon as your instructor
            adds one.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
