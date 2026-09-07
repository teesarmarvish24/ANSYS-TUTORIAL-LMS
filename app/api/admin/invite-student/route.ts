import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Admin-only: manually create a student account (e.g. paid offline) and send
// them an email invite to set their own password. Optionally grants free
// access to one course right away.
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!callerProfile || callerProfile.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { email, fullName, courseId } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/set-password`,
    data: fullName ? { full_name: fullName } : undefined,
  });

  if (inviteError || !invited.user) {
    return NextResponse.json({ error: inviteError?.message || 'Could not invite student' }, { status: 500 });
  }

  if (fullName) {
    await admin.from('profiles').update({ full_name: fullName }).eq('id', invited.user.id);
  }

  if (courseId) {
    await admin.from('enrollments').upsert(
      { user_id: invited.user.id, course_id: courseId, status: 'active', source: 'admin_grant' },
      { onConflict: 'user_id,course_id' }
    );
  }

  await admin.from('activity_log').insert({
    actor_id: user.id,
    action: 'admin_invited_student',
    target_table: 'profiles',
    target_id: invited.user.id,
  });

  return NextResponse.json({ ok: true });
}
