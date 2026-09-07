'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('failed');
      return;
    }
    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json())
      .then((data) => setStatus(data.ok ? 'success' : 'failed'))
      .catch(() => setStatus('failed'));
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md text-center bg-white border border-gray-100 rounded-2xl shadow-sm p-10">
        {status === 'checking' && (
          <>
            <Loader2 className="mx-auto animate-spin text-navy-700" size={40} />
            <h1 className="text-2xl font-bold text-navy-900 mt-4">Confirming your payment…</h1>
            <p className="text-gray-600 mt-2">This only takes a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto text-emerald-600" size={40} />
            <h1 className="text-2xl font-bold text-navy-900 mt-4">Payment successful</h1>
            <p className="text-gray-600 mt-2">You&apos;re enrolled — your course is ready.</p>
            <Link
              href="/dashboard/courses"
              className="inline-block mt-6 bg-navy-950 text-white font-semibold px-6 py-3 rounded-lg hover:bg-navy-800 transition-colors"
            >
              Go to my courses
            </Link>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="mx-auto text-red-600" size={40} />
            <h1 className="text-2xl font-bold text-navy-900 mt-4">Payment not confirmed</h1>
            <p className="text-gray-600 mt-2">
              We couldn&apos;t confirm this payment yet. If you were charged, this usually
              resolves within a minute — refresh, or contact support with your reference.
            </p>
            <Link
              href="/dashboard/courses"
              className="inline-block mt-6 text-sm font-semibold text-navy-900 hover:underline"
            >
              Back to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}
