// Feature flags (build-time, from NEXT_PUBLIC_* env). Safe on server and client.

/** True only when Supabase public env vars are present. */
export function isCloudConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Cloud SYNC engine flag (Phase 2 sync). Auth can exist while this stays false.
 * Kept separate from auth so login works without turning sync on.
 */
export const CLOUD_SYNC_ENABLED = process.env.NEXT_PUBLIC_CLOUD_SYNC_ENABLED === "true";
