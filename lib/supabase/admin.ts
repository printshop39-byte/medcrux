import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY Supabase admin client (service role key). The `server-only` import
 * makes the build fail if this module is ever imported by a client component.
 * Reserved for future admin route handlers (account delete/export). Not used yet.
 */
export function createAdminSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase admin not configured (SUPABASE_SERVICE_ROLE_KEY missing).");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
