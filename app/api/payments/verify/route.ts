import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { confirmPayment } from '@/lib/payments';

// Best-effort fallback in case the Paystack webhook is delayed: called by the
// browser when the user lands back on /payments/callback after paying.
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, reason: 'not_authenticated' }, { status: 401 });
  }

  const reference = request.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ ok: false, reason: 'missing_reference' }, { status: 400 });
  }

  const result = await confirmPayment(reference);
  return NextResponse.json(result);
}
