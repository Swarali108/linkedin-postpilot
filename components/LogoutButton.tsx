"use client";

import { signOut } from "@/lib/auth-client";

export default function LogoutButton({ className = "" }: { className?: string }) {
  async function logout() {
    try {
      await signOut();
    } finally {
      window.location.href = "/login";
    }
  }
  return (
    <button
      onClick={logout}
      className={`text-sm text-gray-400 hover:text-linkedin ${className}`}
    >
      Log out
    </button>
  );
}
