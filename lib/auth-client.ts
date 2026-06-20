import { createBrowserSupabase } from "./supabase/browser";

/** Client-side auth flows (run in the browser via the anon Supabase client). */

const GUEST_COOKIE = "pp_guest";

export async function signUp(
  username: string,
  email: string,
  password: string
): Promise<{ needsConfirm: boolean }> {
  const supabase = createBrowserSupabase();
  const uname = username.trim().toLowerCase();
  if (!/^[a-z0-9_.-]{3,30}$/.test(uname)) {
    throw new Error("Username must be 3–30 chars (letters, numbers, _ . -).");
  }
  const { data: taken } = await supabase.rpc("username_taken", { uname });
  if (taken) throw new Error("That username is already taken.");

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { username: uname },
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
    },
  });
  if (error) throw new Error(error.message);
  // If email confirmation is on, there's no session yet.
  return { needsConfirm: !data.session };
}

export async function signIn(username: string, password: string): Promise<void> {
  const supabase = createBrowserSupabase();
  const { data: email, error: rpcErr } = await supabase.rpc("email_for_username", {
    uname: username.trim().toLowerCase(),
  });
  if (rpcErr) throw new Error(rpcErr.message);
  if (!email) throw new Error("No account with that username.");
  const { error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password,
  });
  if (error) throw new Error(error.message);
  clearGuest();
}

export async function signOut(): Promise<void> {
  const supabase = createBrowserSupabase();
  await supabase.auth.signOut();
  clearGuest();
}

export async function forgotPassword(email: string): Promise<void> {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo:
      typeof window !== "undefined" ? `${window.location.origin}/reset` : undefined,
  });
  if (error) throw new Error(error.message);
}

export async function setNewPassword(password: string): Promise<void> {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export function continueAsGuest(): void {
  document.cookie = `${GUEST_COOKIE}=1; path=/; max-age=${60 * 60 * 24}; samesite=lax`;
}

export function clearGuest(): void {
  document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

/** True if the current browser session is in guest mode. */
export function isGuest(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c === `${GUEST_COOKIE}=1`);
}
