"use client";

import Link from "next/link";
import { continueAsGuest } from "@/lib/auth-client";

export default function LandingCtas() {
  function useAsGuest() {
    continueAsGuest();
    window.location.href = "/dashboard";
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Link
        href="/login"
        className="rounded-xl bg-linkedin px-7 py-3 font-semibold text-white shadow-soft transition hover:bg-linkedin-dark"
      >
        Log in / Sign up
      </Link>
      <button
        onClick={useAsGuest}
        className="rounded-xl border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 shadow-sm transition hover:border-linkedin hover:text-linkedin"
      >
        Use without signing in
      </button>
    </div>
  );
}
