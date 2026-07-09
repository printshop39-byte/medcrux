"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { CLOUD_SYNC_ENABLED } from "@/lib/flags";
import { startSync, stopSync, type SyncStatus } from "@/lib/sync/engine";

/**
 * Runs the cloud SyncEngine ONLY when the flag is on AND a user is signed in.
 * When the flag is off or logged out, it does nothing → app behaves exactly
 * like V1 (localStorage only). Renders a brief "Synced" toast on success.
 */
export function SyncGate() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!CLOUD_SYNC_ENABLED || !user) return;
    const supabase = createBrowserSupabase();
    if (!supabase) return;

    let active = true;
    startSync(supabase, user.id, (s) => {
      if (active) setStatus(s);
    });
    return () => {
      active = false;
      stopSync();
    };
  }, [user]);

  useEffect(() => {
    if (status === "synced" || status === "migrated") {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(t);
    }
  }, [status]);

  if (!showToast) return null;
  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg lg:bottom-6">
      ✅ Synced successfully
    </div>
  );
}
