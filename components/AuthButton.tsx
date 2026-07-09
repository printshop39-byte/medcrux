"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { isCloudConfigured } from "@/lib/flags";

/**
 * Compact sign-in / account control for the top bar.
 * Hydration-safe: renders nothing until mounted, so server HTML and the client's
 * first render match. When cloud isn't configured, renders nothing (pure V1).
 */
export function AuthButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { user, loading } = useAuth();

  if (!mounted || loading || !isCloudConfigured()) return null;

  if (user) {
    const initial = (user.email?.[0] ?? "U").toUpperCase();
    return (
      <Link
        href="/account"
        title={user.email ?? "Account"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        {initial}
      </Link>
    );
  }

  return (
    <Link href="/login" className="btn-ghost shrink-0 px-3 py-2 text-sm">
      Sign in
    </Link>
  );
}
