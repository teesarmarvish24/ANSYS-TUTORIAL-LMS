// SERVER-ONLY. Shared by the Paystack webhook and the client-side "verify on
// return" fallback so both paths funnel through one idempotent function.

import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/paystack';

interface ConfirmResult {
  ok: boolean;
  reason?: string;
}

export async function confirmPayment(reference: string): Promise<ConfirmResult> {
  const admin = createAdminClient();

  const { data: payment } = await admin
    .from('payments')
    .select('*')
    .eq('reference', reference)
    .single();

  if (!payment) return { ok: false, reason: 'unknown_reference' };
  if (payment.status === 'success') return { ok: true };

  const verification = await verifyTransaction(reference);
  const data = verification.data;

  if (!verification.status || !data || data.status !== 'success') {
    await admin.from('payments').update({ status: 'failed' }).eq('reference', reference);
    return { ok: false, reason: 'verification_failed' };
  }

  if (data.amount !== payment.amount_kobo) {
    await admin.from('payments').update({ status: 'failed' }).eq('reference', reference);
    return { ok: false, reason: 'amount_mismatch' };
  }

  await admin
    .from('payments')
    .update({ status: 'success', paid_at: data.paid_at ?? new Date().toISOString() })
    .eq('reference', reference);

  await admin.from('enrollments').upsert(
    {
      user_id: payment.user_id,
      course_id: payment.course_id,
      status: 'active',
      source: 'payment',
    },
    { onConflict: 'user_id,course_id' }
  );

  await admin.from('activity_log').insert({
    actor_id: payment.user_id,
    action: 'course_payment_success',
    target_table: 'courses',
    target_id: payment.course_id,
    metadata: { reference, amount_kobo: payment.amount_kobo },
  });

  return { ok: true };
}
