import Link from 'next/link';
import { Users, BookOpen, Wallet, ClipboardCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/StatCard';
import { formatNaira, formatDateTime } from '@/lib/format';

export default async function AdminOverviewPage() {
  const supabase = createClient();

  const [
    { count: studentCount },
    { count: courseCount },
    { count: ungradedCount },
    { data: payments },
    { data: recentStudents },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase
      .from('assignment_submissions')
      .select('id', { count: 'exact', head: true })
      .is('graded_at', null),
    supabase.from('payments').select('amount_kobo').eq('status', 'success'),
    supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (payments ?? []).reduce((sum, p) => sum + p.amount_kobo, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Admin Overview</h1>
        <p className="text-navy-500 mt-1">A snapshot of the whole programme.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Students" value={studentCount ?? 0} />
        <StatCard icon={BookOpen} label="Courses" value={courseCount ?? 0} />
        <StatCard icon={Wallet} label="Total revenue" value={formatNaira(totalRevenue)} />
        <StatCard icon={ClipboardCheck} label="Submissions to grade" value={ungradedCount ?? 0} />
      </div>

      <div className="bg-white border border-navy-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-navy-900">Recently joined students</h2>
          <Link href="/admin/students" className="text-sm font-semibold text-navy-700 hover:underline">
            View all →
          </Link>
        </div>
        {recentStudents && recentStudents.length > 0 ? (
          <ul className="divide-y divide-navy-50">
            {recentStudents.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="text-navy-900 font-medium">{s.full_name ?? 'Unnamed'}</p>
                  <p className="text-navy-500 text-xs">{s.email}</p>
                </div>
                <span className="text-navy-500">{formatDateTime(s.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy-500">No students yet.</p>
        )}
      </div>
    </div>
  );
}
