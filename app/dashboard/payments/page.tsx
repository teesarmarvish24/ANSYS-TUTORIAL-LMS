import { Receipt } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import EmptyState from '@/components/EmptyState';
import { formatNaira, formatDateTime } from '@/lib/format';

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
};

export default async function PaymentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: payments } = await supabase
    .from('payments')
    .select('*, course:courses(title)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Payment History</h1>
        <p className="text-navy-500 mt-1">Every payment you&apos;ve made on the platform.</p>
      </div>

      {payments && payments.length > 0 ? (
        <div className="bg-white border border-navy-100 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-navy-500 border-b border-navy-100">
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const course = p.course as unknown as { title: string } | null;
                return (
                  <tr key={p.id} className="border-b border-navy-50 last:border-0">
                    <td className="px-5 py-3.5 text-navy-800">{course?.title ?? '—'}</td>
                    <td className="px-5 py-3.5 text-navy-800">{formatNaira(p.amount_kobo)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-navy-500">{formatDateTime(p.created_at)}</td>
                    <td className="px-5 py-3.5 text-navy-400 font-mono text-xs">{p.reference}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Receipt} title="No payments yet" description="Your payment history will appear here after you enroll in a paid course." />
      )}
    </div>
  );
}
