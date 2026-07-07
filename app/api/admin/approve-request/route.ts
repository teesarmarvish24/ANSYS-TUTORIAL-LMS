import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  // 1. Verify the caller is a logged-in admin (using the normal, RLS-respecting client)
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!callerProfile || callerProfile.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { requestId } = await request.json();
  if (!requestId) {
    return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
  }

  // 2. Load the enrollment request
  const { data: enrollmentRequest, error: fetchError } = await supabase
    .from('enrollment_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !enrollmentRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  // 3. Use the admin client (service role) to invite the user by email.
  // This sends them a Supabase email with a link to set their own password.
  const admin = createAdminClient();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    enrollmentRequest.email
  );

  if (inviteError || !invited.user) {
    return NextResponse.json(
      { error: inviteError?.message || 'Failed to invite user' },
      { status: 500 }
    );
  }

  // 4. Create the profile row for the new student
  const { error: profileError } = await admin.from('profiles').insert({
    id: invited.user.id,
    full_name: enrollmentRequest.full_name,
    email: enrollmentRequest.email,
    phone: enrollmentRequest.phone,
    role: 'student',
    status: 'active',
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // 5. Mark the request as approved
  await admin
    .from('enrollment_requests')
    .update({ status: 'approved', reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq('id', requestId);

  // 6. Log the action
  await admin.from('activity_log').insert({
    actor_id: user.id,
    action: 'approved_enrollment_request',
    target_table: 'enrollment_requests',
    target_id: requestId,
  });

  return NextResponse.json({ success: true });
}
