"use client";

import { useState } from "react";
import {
  continueAsGuest,
  forgotPassword,
  signIn,
  signUp,
} from "@/lib/auth-client";

type Mode = "login" | "signup" | "forgot";

export default function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const dest = next && next.startsWith("/") ? next : "/dashboard";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "login") {
        await signIn(username, password);
        window.location.href = dest;
      } else if (mode === "signup") {
        const { needsConfirm } = await signUp(username, email, password);
        if (needsConfirm) {
          setNotice("Account created! Check your email to confirm, then log in.");
          setMode("login");
        } else {
          window.location.href = dest;
        }
      } else {
        await forgotPassword(email);
        setNotice("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function guest() {
    continueAsGuest();
    window.location.href = dest;
  }

  const input =
    "w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-linkedin focus:outline-none focus:ring-1 focus:ring-linkedin";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-soft">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linkedin text-lg font-bold text-white">
            P
          </span>
          <span className="text-lg font-bold text-gray-900">PostPilot</span>
        </div>

        {mode !== "forgot" && (
          <div className="flex rounded-xl bg-gray-100 p-1 text-sm font-medium">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-1.5 ${mode === "login" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg py-1.5 ${mode === "signup" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              Sign up
            </button>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode !== "forgot" && (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoFocus
              className={input}
            />
          )}
          {(mode === "signup" || mode === "forgot") && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (for password reset)"
              className={input}
            />
          )}
          {mode !== "forgot" && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={input}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-linkedin px-4 py-2.5 font-semibold text-white transition hover:bg-linkedin-dark disabled:opacity-60"
          >
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Log in"
              : mode === "signup"
              ? "Create account"
              : "Send reset link"}
          </button>
        </form>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {notice && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {notice}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          {mode === "login" ? (
            <button onClick={() => setMode("forgot")} className="hover:text-linkedin">
              Forgot password?
            </button>
          ) : (
            <button onClick={() => setMode("login")} className="hover:text-linkedin">
              ← Back to log in
            </button>
          )}
          <button onClick={guest} className="font-medium text-linkedin hover:underline">
            Use without an account →
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-400">
          Guest mode works, but your data isn&apos;t saved after you close the app.
        </p>
      </div>
    </main>
  );
}
