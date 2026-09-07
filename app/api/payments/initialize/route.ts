import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { initializeTransaction } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { courseId } = await request.json();
  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, price_kobo, is_published, title')
    .eq('id', courseId)
    .single();

  if (!course || !course.is_published) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }
  if (course.price_kobo <= 0) {
    return NextResponse.json({ error: 'This course is free.' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('enrollments')
    .select('status')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle();

  if (existing?.status === 'active') {
    return NextResponse.json({ error: 'You are already enrolled in this course.' }, { status: 400 });
  }

  const reference = `psk_${randomUUID()}`;
  const admin = createAdminClient();

  const { error: insertError } = await admin.from('payments').insert({
    user_id: user.id,
    course_id: courseId,
    amount_kobo: course.price_kobo,
    reference,
    status: 'pending',
  });

  if (insertError) {
    return NextResponse.json({ error: 'Could not start payment.' }, { status: 500 });
  }

  const result = await initializeTransaction({
    email: user.email,
    amountKobo: course.price_kobo,
    reference,
    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payments/callback`,
    metadata: { courseId, userId: user.id, courseTitle: course.title },
  });

  if (!result.status || !result.data) {
    return NextResponse.json({ error: result.message || 'Could not start payment.' }, { status: 500 });
  }

  return NextResponse.json({ authorizationUrl: result.data.authorization_url });
}
