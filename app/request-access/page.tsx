'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isValidEmail, isNonEmpty } from '@/lib/validation/rules';

export default function RequestAccessPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    background: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isNonEmpty(form.full_name)) {
      setError('Please enter your full name.');
      return;
    }
    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from('enrollment_requests').insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      background: form.background.trim() || null,
      note: form.note.trim() || null,
    });
    setLoading(false);

    if (insertError) {
      setError('Something went wrong submitting your request. Please try again.');
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md text-center bg-white border border-gray-100 rounded-2xl shadow-sm p-10">
          <h1 className="text-2xl font-bold text-navy-900">Request received</h1>
          <p className="text-gray-600 mt-3">
            Thanks — we&apos;ll review your request and email you your login details
            once your enrollment is confirmed.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 text-sm font-semibold text-navy-900 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-sm p-8 sm:p-10">
        <h1 className="text-2xl font-bold text-navy-900">Request Enrollment</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit your details below. We&apos;ll confirm your commitment fee payment and
          send your login details by email.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1">Full name</label>
            <input
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1">Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1">Phone number</label>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="e.g. 08012345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1">
              Institution / professional background (optional)
            </label>
            <input
              value={form.background}
              onChange={(e) => update('background', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="e.g. UNILAG, 300L Mechanical Engineering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1">
              Note (e.g. payment reference)
            </label>
            <textarea
              value={form.note}
              onChange={(e) => update('note', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="I have paid the commitment fee via..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-950 text-white font-semibold py-3 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already enrolled?{' '}
          <Link href="/login" className="font-semibold text-navy-900 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
