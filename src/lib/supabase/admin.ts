import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client with the service_role key. Used exclusively
 * for looking up a message recipient's email address — never expose this
 * key to the browser. Returns null when the key isn't configured.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
