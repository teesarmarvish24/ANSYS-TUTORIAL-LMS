import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmPayment } from '@/lib/payments';

// Paystack webhook. Configure this URL (https://your-domain/api/payments/webhook)
// in the Paystack Dashboard -> Settings -> API Keys & Webhooks.
export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = request.headers.get('x-paystack-signature');
  const rawBody = await request.text();

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success' && event.data?.reference) {
    await confirmPayment(event.data.reference);
  }

  return NextResponse.json({ received: true });
}
