"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isCloudConfigured } from "@/lib/flags";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const configured = isCloudConfigured();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirect);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}` },
        });
        if (error) throw error;
        setNotice("Account created. Check your email to confirm, then sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}` },
      });
      if (error) throw error;
      // Redirects to Google, then back to /auth/callback.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-5 py-6">
      <div className="text-center">
        <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg text-white">℞</div>
        <h1 className="text-2xl font-bold text-slate-800">{isLogin ? "Sign in to MedCrux" : "Create your MedCrux account"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Optional — you can keep studying without an account. Login enables cloud sync (coming soon).
        </p>
      </div>

      {!configured ? (
        <div className="card p-6 text-center">
          <div className="text-2xl">🔒</div>
          <p className="mt-2 text-sm font-medium text-slate-700">Cloud login not configured yet</p>
          <p className="mt-1 text-xs text-slate-500">
            This build has no Supabase keys set. The app works fully offline. Add
            <code className="mx-1 rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and
            <code className="mx-1 rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable login.
          </p>
          <Link href="/dashboard" className="btn-primary mt-4 inline-flex">Continue to app →</Link>
        </div>
      ) : (
        <div className="card space-y-4 p-6">
          <button onClick={handleGoogle} disabled={busy} className="btn-ghost w-full justify-center">
            <span className="mr-1">🔵</span> Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" /> or email <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            />
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          {error && <p className="rounded-lg bg-rose-50 p-2 text-center text-xs text-rose-600">{error}</p>}
          {notice && <p className="rounded-lg bg-green-50 p-2 text-center text-xs text-green-700">{notice}</p>}

          <p className="text-center text-xs text-slate-500">
            {isLogin ? (
              <>New here? <Link href="/signup" className="text-brand-600 hover:underline">Create an account</Link></>
            ) : (
              <>Already have an account? <Link href="/login" className="text-brand-600 hover:underline">Sign in</Link></>
            )}
          </p>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        <Link href="/dashboard" className="hover:text-slate-600">← Back to app</Link>
      </p>
    </div>
  );
}
