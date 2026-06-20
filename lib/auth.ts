// Stateless auth token, edge-safe (Web Crypto only — no Node Buffer), so it can
// run in both middleware (edge) and API routes (node).
//
// The cookie value is an HMAC-SHA256 of a fixed message keyed by APP_PASSWORD.
// It can't be forged without the password, and it carries no secret itself.

export const COOKIE_NAME = "pp_auth";
const MESSAGE = "postpilot-auth-v1";

const enc = new TextEncoder();

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Derive the auth-cookie token from the password. */
export async function authToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(MESSAGE));
  return toBase64Url(sig);
}

/** Constant-time-ish string compare (avoids early-exit timing leaks). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
