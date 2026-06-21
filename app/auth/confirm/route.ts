import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Server-side email-link handler (password reset + signup confirm).
 *
 * The Supabase email template points here with a `token_hash` + `type`. We verify
 * it on the SERVER (verifyOtp) — which sets the session cookies and, unlike the
 * PKCE `?code=` flow, works regardless of which browser/origin the link is opened
 * in. Then we forward to `next` (the /reset page for recovery).
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/";

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(
            toSet: { name: string; value: string; options?: Record<string, unknown> }[]
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_or_expired_link`);
}
