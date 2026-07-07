import { createClient } from '@supabase/supabase-js';

// SERVER-ONLY. Never import this file from a Client Component.
// Uses the service role key, which bypasses RLS - only use inside
// app/api/* route handlers, after verifying the caller is an admin.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
