"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { setNewPassword, updateUsername } from "@/lib/auth-client";

export default function ResetForm() {
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false); // recovery session established
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The email link drops a recovery token in the URL; the Supabase client picks
  // it up and fires PASSWORD_RECOVERY (or a session already exists).
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
        setChecking(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await setNewPassword(password);
      if (username.trim()) await updateUsername(username);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-linkedin focus:outline-none focus:ring-1 focus:ring-linkedin";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-soft">
        <h1 className="text-xl font-semibold text-gray-900">Reset your account</h1>

        {checking ? (
          <p className="text-sm text-gray-500">Verifying your reset link…</p>
        ) : !ready ? (
          <>
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
              This reset link is invalid or has expired. Request a new one from the
              login page.
            </p>
            <a
              href="/login"
              className="block rounded-xl border border-gray-300 px-4 py-2.5 text-center font-semibold text-gray-700 hover:border-linkedin hover:text-linkedin"
            >
              Back to log in
            </a>
          </>
        ) : done ? (
          <>
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Updated! Log in with your new details.
            </p>
            <a
              href="/login"
              className="block rounded-xl bg-linkedin px-4 py-2.5 text-center font-semibold text-white hover:bg-linkedin-dark"
            >
              Go to log in
            </a>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoFocus
              className={input}
            />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="New username (optional)"
              className={input}
            />
            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full rounded-xl bg-linkedin px-4 py-2.5 font-semibold text-white transition hover:bg-linkedin-dark disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update account"}
            </button>
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <p className="text-center text-[11px] text-gray-400">
              Leave username blank to keep your current one.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
