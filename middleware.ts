import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth gate. Allows a request through if EITHER:
 *   - there's a valid Supabase session (logged-in user), OR
 *   - the guest cookie is set (using the app without an account).
 * Otherwise: pages redirect to /login, API routes return 401.
 *
 * Also refreshes the Supabase session cookies on every request (SSR pattern).
 */
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isApi = req.nextUrl.pathname.startsWith("/api");

  // Auth not configured: open in dev, locked in prod (fail-closed).
  if (!url || !anon) {
    if (process.env.NODE_ENV !== "production") return res;
    const msg = "Auth is not configured (NEXT_PUBLIC_SUPABASE_* missing).";
    return isApi
      ? NextResponse.json({ error: msg }, { status: 503 })
      : new NextResponse(msg, { status: 503 });
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
      ) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          res.cookies.set(name, value, options as any)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guest = req.cookies.get("pp_guest")?.value === "1";
  const isPublic = req.nextUrl.pathname === "/"; // public marketing landing

  if (user || guest || isPublic) return res;

  if (isApi) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Protect everything except Next internals, favicon, the login + reset pages.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|reset).*)"],
};
