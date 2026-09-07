import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Self-enroll into a free (price_kobo = 0) course — no payment needed.
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { courseId } = await request.json();
  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, price_kobo, is_published')
    .eq('id', courseId)
    .single();

  if (!course || !course.is_published) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }
  if (course.price_kobo > 0) {
    return NextResponse.json({ error: 'This course requires payment.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from('enrollments').upsert(
    { user_id: user.id, course_id: courseId, status: 'active', source: 'admin_grant' },
    { onConflict: 'user_id,course_id' }
  );

  if (error) {
    return NextResponse.json({ error: 'Could not enroll.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
