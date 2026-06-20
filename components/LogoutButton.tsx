"use client";

export default function LogoutButton({
  className = "",
}: {
  className?: string;
}) {
  async function logout() {
    await fetch("/api/auth?action=logout", { method: "POST" });
    window.location.href = "/login";
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
