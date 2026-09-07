import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Admin-only: permanently deletes a student's account. Prefer deactivating
// (profiles.status) for a reversible removal — this is for real deletions.
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

  const { studentId } = await request.json();
  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
  }
  if (studentId === user.id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: target } = await admin.from('profiles').select('role').eq('id', studentId).single();
  if (target?.role === 'admin') {
    return NextResponse.json({ error: 'Cannot delete an admin account here.' }, { status: 400 });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(studentId);
  if (deleteError) {
    return NextResponse.json({ error: 'Could not delete account.' }, { status: 500 });
  }

  await admin.from('activity_log').insert({
    actor_id: user.id,
    action: 'admin_deleted_student',
    target_table: 'profiles',
    target_id: studentId,
  });

  return NextResponse.json({ ok: true });
}
