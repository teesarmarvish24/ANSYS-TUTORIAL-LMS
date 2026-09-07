import { Wallet, TrendingUp, Receipt } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { formatNaira, formatDateTime } from '@/lib/format';

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
};

export default async function AdminPaymentsPage() {
  const supabase = createClient();

  const { data: payments } = await supabase
    .from('payments')
    .select('*, course:courses(title), student:profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(200);

  const rows = payments ?? [];
  const successful = rows.filter((p) => p.status === 'success');
  const totalRevenue = successful.reduce((sum, p) => sum + p.amount_kobo, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Payments</h1>
        <p className="text-navy-500 mt-1">Every transaction processed through Paystack.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label="Total revenue" value={formatNaira(totalRevenue)} />
        <StatCard icon={TrendingUp} label="Successful payments" value={successful.length} />
        <StatCard icon={Receipt} label="All transactions" value={rows.length} />
      </div>

      {rows.length > 0 ? (
        <div className="bg-white border border-navy-100 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-navy-500 border-b border-navy-100">
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const course = p.course as unknown as { title: string } | null;
                const student = p.student as unknown as { full_name: string | null; email: string } | null;
                return (
                  <tr key={p.id} className="border-b border-navy-50 last:border-0">
                    <td className="px-5 py-3.5 text-navy-800">{student?.full_name ?? student?.email ?? '—'}</td>
                    <td className="px-5 py-3.5 text-navy-800">{course?.title ?? '—'}</td>
                    <td className="px-5 py-3.5 text-navy-800">{formatNaira(p.amount_kobo)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-navy-500">{formatDateTime(p.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Receipt} title="No payments yet" />
      )}
    </div>
  );
}
