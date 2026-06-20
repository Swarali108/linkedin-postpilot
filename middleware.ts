import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, authToken, safeEqual } from "@/lib/auth";

/**
 * Auth gate over the whole app. Every page and API route requires a valid
 * session cookie except /login and /api/auth (and static assets, excluded by
 * the matcher below).
 *
 * Fail-closed: if APP_PASSWORD is unset, the app is open in development but
 * LOCKED in production — so a forgotten env var never silently exposes it.
 */
export async function middleware(req: NextRequest) {
  const password = process.env.APP_PASSWORD;
  const isApi = req.nextUrl.pathname.startsWith("/api");

  if (!password) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    const msg = "App is locked: set APP_PASSWORD in the environment.";
    return isApi
      ? NextResponse.json({ error: msg }, { status: 503 })
      : new NextResponse(msg, { status: 503 });
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const expected = await authToken(password);
  if (cookie && safeEqual(cookie, expected)) {
    return NextResponse.next();
  }

  if (isApi) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Protect everything except Next internals, the favicon, the login page,
  // and the auth endpoint itself.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)"],
};
