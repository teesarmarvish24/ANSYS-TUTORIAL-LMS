'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isValidEmail, isNonEmpty } from '@/lib/validation/rules';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isNonEmpty(password)) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    // Look up role to decide redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .single();

    setLoading(false);

    if (!profile) {
      setError('No profile found for this account. Contact the admin.');
      return;
    }

    if (profile.role === 'admin') {
      router.push('/admin');
    } else if (profile.status === 'active') {
      router.push('/dashboard');
    } else {
      router.push('/unauthorized');
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left brand panel */}
      <div className="md:w-1/2 bg-gradient-to-br from-navy-950 to-navy-800 text-white flex flex-col justify-center px-8 sm:px-16 py-20">
        <div className="max-w-sm mx-auto md:mx-0 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-10">
            <span className="bg-white text-navy-950 rounded-lg p-2">
              <GraduationCap size={22} />
            </span>
            <span className="leading-tight text-left">
              <span className="block font-bold text-sm tracking-wide">MASTERMIND</span>
              <span className="block text-[10px] text-navy-300 tracking-widest">LEARNING</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Ansys Simulation Mastery</h1>
          <p className="mt-4 text-navy-200">
            Master FEA, CFD, and Advanced Computational Solid Mechanics with our
            comprehensive programme.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-navy-300">Modules</p>
            </div>
            <div>
              <p className="text-2xl font-bold">50+</p>
              <p className="text-xs text-navy-300">Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-navy-300">Practical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="md:w-1/2 flex items-center justify-center px-6 py-16 bg-gray-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-navy-900">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-1">
            Log in to access your course materials and recordings.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-900 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-navy-900">
                  Password
                </label>
                <Link href="/login" className="text-xs text-navy-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-950 text-white font-semibold py-3 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Not enrolled yet?{' '}
            <Link href="/request-access" className="font-semibold text-navy-900 hover:underline">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
