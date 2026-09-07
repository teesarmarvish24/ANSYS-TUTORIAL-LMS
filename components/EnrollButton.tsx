'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EnrollButton({
  courseId,
  isFree,
  isLoggedIn,
  isEnrolled,
  courseSlug,
}: {
  courseId: string;
  isFree: boolean;
  isLoggedIn: boolean;
  isEnrolled: boolean;
  courseSlug: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push(`/dashboard/courses/${courseSlug}`)}
        className="w-full bg-navy-950 text-white font-semibold py-3.5 rounded-lg hover:bg-navy-800 transition-colors"
      >
        Go to course
      </button>
    );
  }

  async function handleClick() {
    if (!isLoggedIn) {
      router.push(`/signup?next=${encodeURIComponent(`/courses/${courseSlug}`)}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isFree) {
        const res = await fetch('/api/enrollments/free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not enroll.');
        router.push(`/dashboard/courses/${courseSlug}`);
        router.refresh();
        return;
      }

      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start payment.');
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-navy-950 text-white font-semibold py-3.5 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {loading ? 'Please wait…' : isFree ? 'Enroll for free' : 'Enroll & pay with Paystack'}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
