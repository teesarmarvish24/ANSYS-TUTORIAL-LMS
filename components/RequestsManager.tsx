'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EnrollmentRequest } from '@/lib/types';

export default function RequestsManager({ requests }: { requests: EnrollmentRequest[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; action: 'approve' | 'reject' } | null>(
    null
  );
  const [error, setError] = useState('');

  async function handleConfirm() {
    if (!confirmTarget) return;
    setLoadingId(confirmTarget.id);
    setError('');

    const endpoint =
      confirmTarget.action === 'approve'
        ? '/api/admin/approve-request'
        : '/api/admin/reject-request';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: confirmTarget.id }),
    });

    setLoadingId(null);
    setConfirmTarget(null);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Something went wrong.');
      return;
    }

    router.refresh();
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const reviewed = requests.filter((r) => r.status !== 'pending');

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Enrollment Requests</h1>
      <p className="text-gray-500 mt-1">
        Approving a request emails the applicant a link to set their password and log in.
      </p>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-8 mb-3">
        Pending ({pending.length})
      </h2>
      <div className="space-y-3">
        {pending.map((r) => (
          <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="min-w-0">
                <p className="font-medium text-navy-900">{r.full_name}</p>
                <p className="text-sm text-gray-500">{r.email}</p>
                {r.phone && <p className="text-sm text-gray-500">{r.phone}</p>}
                {r.background && (
                  <p className="text-sm text-gray-600 mt-1">{r.background}</p>
                )}
                {r.note && (
                  <p className="text-sm text-gray-500 mt-1 italic">&quot;{r.note}&quot;</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setConfirmTarget({ id: r.id, action: 'approve' })}
                  disabled={loadingId === r.id}
                  className="bg-navy-950 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-800 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  onClick={() => setConfirmTarget({ id: r.id, action: 'reject' })}
                  disabled={loadingId === r.id}
                  className="border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}

        {pending.length === 0 && (
          <p className="text-gray-500 text-sm">No pending requests.</p>
        )}
      </div>

      {reviewed.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-10 mb-3">
            Reviewed
          </h2>
          <div className="space-y-2">
            {reviewed.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center bg-white border border-gray-100 rounded-xl p-4"
              >
                <div>
                  <p className="text-sm font-medium text-navy-900">{r.full_name}</p>
                  <p className="text-xs text-gray-500">{r.email}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    r.status === 'approved'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirm modal */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <p className="font-semibold text-navy-900">
              {confirmTarget.action === 'approve'
                ? 'Approve this request?'
                : 'Reject this request?'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {confirmTarget.action === 'approve'
                ? 'This will create the student account and send them an email invite.'
                : 'The applicant will not be notified automatically.'}
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white ${
                  confirmTarget.action === 'approve' ? 'bg-navy-950' : 'bg-red-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
