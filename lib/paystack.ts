// SERVER-ONLY. Talks to the Paystack REST API using the secret key.
// Never import this from a Client Component.

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set');
  return key;
}

interface InitializeParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

interface InitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializeTransaction(
  params: InitializeParams
): Promise<InitializeResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: 'NGN',
      metadata: params.metadata ?? {},
    }),
  });
  return res.json();
}

export interface VerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    currency: string;
    paid_at: string | null;
    customer: { email: string };
    metadata: Record<string, unknown>;
  };
}

export async function verifyTransaction(reference: string): Promise<VerifyResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: 'no-store',
    }
  );
  return res.json();
}
