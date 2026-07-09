"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { CLOUD_SYNC_ENABLED } from "@/lib/flags";

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name?: string; university?: string; onboarded?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    supabase.from("profiles").select("full_name, university, onboarded").eq("id", user.id).single()
      .then(({ data }) => setProfile(data ?? null));
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push("/dashboard");
    router.refresh();
  }

  // Exports the on-device (localStorage) data — works offline, no server needed.
  function exportLocalData() {
    const dump: Record<string, unknown> = {};
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("pharmaos.")) {
        try {
          dump[key] = JSON.parse(localStorage.getItem(key) as string);
        } catch {
          dump[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medcrux-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    if (!confirm("Delete your account and all cloud data permanently? This cannot be undone.")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await signOut();
      router.push("/dashboard");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-6 text-sm text-slate-400">Loading…</div>;
  if (!user)
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="text-sm text-slate-600">Please sign in to view your account.</p>
        <Link href="/login?redirect=/account" className="btn-primary mt-3 inline-flex">Sign in</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-lg space-y-5 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account</h1>
        <p className="text-sm text-slate-500">Manage your MedCrux account and data.</p>
      </div>

      {/* Profile */}
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white">
            {(user.email?.[0] ?? "U").toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-800">{profile?.full_name || "Student"}</div>
            <div className="text-sm text-slate-500">{user.email}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href="/onboarding" className="btn-ghost text-sm">Edit profile</Link>
          {!profile?.onboarded && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">Profile incomplete</span>
          )}
        </div>
      </div>

      {/* Sync status */}
      <div className="card p-5">
        <div className="section-title mb-1">Cloud sync</div>
        <p className="text-sm text-slate-600">
          {CLOUD_SYNC_ENABLED
            ? "Cloud sync is enabled — your progress syncs across devices."
            : "Cloud sync is coming soon. Your progress is currently stored on this device (localStorage)."}
        </p>
      </div>

      {/* Data controls */}
      <div className="card space-y-3 p-5">
        <div className="section-title">Your data</div>
        <button onClick={exportLocalData} className="btn-ghost w-full justify-center">⬇️ Export on-device data (JSON)</button>
        <button onClick={handleSignOut} className="btn-ghost w-full justify-center">Sign out</button>
      </div>

      {/* Danger zone */}
      <div className="card p-5">
        <div className="section-title mb-2 text-rose-500">Danger zone</div>
        <button
          onClick={deleteAccount}
          disabled={busy}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete account"}
        </button>
        <p className="mt-2 text-xs text-slate-400">Removes your account and cloud data. On-device data stays until you reset it in Settings.</p>
        {msg && <p className="mt-2 text-xs text-rose-600">{msg}</p>}
      </div>
    </div>
  );
}
