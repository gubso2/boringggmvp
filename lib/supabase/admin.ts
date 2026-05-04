import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. NEVER import from a client component or expose to the
 * browser. Bypasses RLS for trusted server-side mutations.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
