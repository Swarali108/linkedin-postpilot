import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, authToken, safeEqual } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  // Logout: clear the cookie.
  if (url.searchParams.get("action") === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, "", cookieOptions(0));
    return res;
  }

  // Throttle login attempts per IP to slow brute force.
  const ip = clientIp(req.headers);
  if (!rateLimit(`auth:${ip}`, 10, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes." },
      { status: 429 }
    );
  }

  const password = process.env.APP_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "Auth is not configured (APP_PASSWORD unset)." },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.password || !safeEqual(body.password, password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await authToken(password);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, cookieOptions(MAX_AGE));
  return res;
}
