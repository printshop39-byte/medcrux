"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

/**
 * Provides the current Supabase user to the app. Hydration-safe: the Supabase
 * client is created only in an effect (client-only), so server HTML and the
 * client's first render are identical (user=null, loading=true). Auth-conditional
 * UI must therefore gate on `loading`/`user` (resolved after mount).
 *
 * When cloud is not configured (no env), the client is null → user stays null,
 * loading resolves to false, and the app behaves exactly like V1.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const sb = createBrowserSupabase();
    setSupabase(sb);

    if (!sb) {
      setUser(null);
      setLoading(false);
      return;
    }

    sb.auth
      .getUser()
      .then(({ data }) => setUser(data.user ?? null))
      .finally(() => setLoading(false));

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function refreshUser() {
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
    setLoading(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
