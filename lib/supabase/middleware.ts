import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require a logged-in user. Everything else (all study routes) is public.
const PROTECTED_PREFIXES = ["/onboarding", "/account"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function redirectToLogin(request: NextRequest, from: string): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("redirect", from);
  return NextResponse.redirect(loginUrl);
}

/**
 * Refreshes the Supabase session on every request and guards the protected routes.
 * If cloud is not configured (no env), nobody is logged in — so protected routes
 * still redirect to /login, and public routes pass through untouched.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Cloud not configured → treat as logged-out.
  if (!url || !anonKey) {
    return isProtected(path) ? redirectToLogin(request, path) : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // IMPORTANT: getUser() refreshes the session cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected(path) && !user) {
    return redirectToLogin(request, path);
  }

  return response;
}
