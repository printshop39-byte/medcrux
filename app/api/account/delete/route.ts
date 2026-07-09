import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

/**
 * Deletes the caller's account. Verifies the session (their own cookie), then uses
 * the SERVER-ONLY admin client to remove the auth user — cascading all their
 * user_* rows via FK `on delete cascade`.
 */
export async function POST() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Cloud not configured." }, { status: 501 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const admin = createAdminSupabase(); // throws if SUPABASE_SERVICE_ROLE_KEY missing
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed." },
      { status: 500 },
    );
  }
}
