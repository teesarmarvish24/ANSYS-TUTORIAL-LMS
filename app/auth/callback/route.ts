import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Handles the redirect back from Google OAuth, email confirmation links, and
// password-reset / invite links. All of these arrive with a `code` query
// param that must be exchanged for a session before the destination page
// (e.g. /dashboard or /set-password) can see the user as signed in.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') return NextResponse.redirect(`${origin}/admin`);
        if (profile?.status === 'active') return NextResponse.redirect(`${origin}/dashboard`);
        return NextResponse.redirect(`${origin}/unauthorized`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
