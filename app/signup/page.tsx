'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isValidEmail, isNonEmpty, minLength } from '@/lib/validation/rules';
import BrandPanel from '@/components/auth/BrandPanel';
import GoogleButton from '@/components/auth/GoogleButton';

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isNonEmpty(fullName)) {
      setError('Please enter your full name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!minLength(password, 8)) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const next = searchParams.get('next');
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback${
          next ? `?next=${encodeURIComponent(next)}` : ''
        }`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push(next ?? '/dashboard');
      return;
    }

    // Email confirmation is required before a session exists.
    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md text-center bg-white border border-gray-100 rounded-2xl shadow-sm p-10">
          <h1 className="text-2xl font-bold text-navy-900">Check your email</h1>
          <p className="text-gray-600 mt-3">
            We&apos;ve sent a confirmation link to {email}. Click it to activate your account,
            then come back and sign in.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-sm font-semibold text-navy-900 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <BrandPanel />

      <div className="md:w-1/2 flex items-center justify-center px-6 py-16 bg-gray-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-navy-900">Create your account</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sign up to browse courses and start learning.
          </p>

          <div className="mt-6">
            <GoogleButton label="Sign up with Google" />
          </div>
          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1">Email address</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                placeholder="At least 8 characters"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-950 text-white font-semibold py-3 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-navy-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
