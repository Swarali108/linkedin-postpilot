"use client";

import { useState } from "react";
import { setNewPassword } from "@/lib/auth-client";

export default function ResetForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // The reset link from the email establishes a temporary session; updating
      // the user's password here finalizes the reset.
      await setNewPassword(password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Reset failed. Open the link from your email again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-soft">
        <h1 className="text-xl font-semibold text-gray-900">Set a new password</h1>
        {done ? (
          <>
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Password updated. You can now log in.
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
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-linkedin focus:outline-none focus:ring-1 focus:ring-linkedin"
            />
            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full rounded-xl bg-linkedin px-4 py-2.5 font-semibold text-white transition hover:bg-linkedin-dark disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
