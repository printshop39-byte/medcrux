import type { SupabaseClient } from "@supabase/supabase-js";
import { readLocalSnapshot, writeLocalSnapshot, mergeSnapshots, summarize } from "./snapshot";
import { pullCloud, pushCloud, hasMigrated, markMigrated } from "./cloud";

export type SyncStatus = "idle" | "syncing" | "synced" | "migrated" | "error";

// Cache-mirror engine: the UI keeps reading/writing localStorage synchronously
// (unchanged V1). This mirrors that cache to/from Supabase when logged in.
let sb: SupabaseClient | null = null;
let userId: string | null = null;
let applyingRemote = false; // guard so our own local writes don't re-trigger a push
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let detach: (() => void) | null = null;

function applyRemote(snapshot: ReturnType<typeof readLocalSnapshot>) {
  applyingRemote = true;
  try {
    writeLocalSnapshot(snapshot);
    window.dispatchEvent(new Event("pharmaos:update")); // refresh UI (useStoreTick)
  } finally {
    applyingRemote = false;
  }
}

function scheduleFlush() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flush, 2000);
}

async function flush() {
  if (!sb || !userId) return;
  try {
    await pushCloud(sb, userId, readLocalSnapshot());
  } catch {
    // network/offline — will retry on next local change or next login
  }
}

/**
 * Reconcile local + cloud (union), push the merged result, write it back to the
 * local cache, mark migration once, then write-through subsequent local changes.
 */
export async function startSync(
  supabase: SupabaseClient,
  uid: string,
  onStatus?: (s: SyncStatus) => void,
): Promise<void> {
  sb = supabase;
  userId = uid;
  onStatus?.("syncing");

  try {
    const local = readLocalSnapshot();
    const cloud = await pullCloud(supabase, uid);
    const merged = mergeSnapshots(local, cloud);
    await pushCloud(supabase, uid, merged);
    applyRemote(merged);

    const already = await hasMigrated(supabase, uid);
    if (!already) {
      await markMigrated(supabase, uid, summarize(merged));
      onStatus?.("migrated");
    } else {
      onStatus?.("synced");
    }
  } catch {
    onStatus?.("error");
    return;
  }

  const handler = () => {
    if (applyingRemote) return; // ignore writes we caused
    scheduleFlush();
  };
  window.addEventListener("pharmaos:update", handler);
  detach = () => window.removeEventListener("pharmaos:update", handler);
}

export function stopSync() {
  if (detach) detach();
  detach = null;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
  sb = null;
  userId = null;
}
