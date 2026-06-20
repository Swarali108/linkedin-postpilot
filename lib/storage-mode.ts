// Client helper: are we a logged-in user (persist to server) or a guest
// (session-only)? Probes /api/me once and caches the result for the page life.

export type StorageMode = "user" | "guest";

let cached: StorageMode | null = null;

export async function getStorageMode(): Promise<StorageMode> {
  if (cached) return cached;
  try {
    const res = await fetch("/api/me");
    const data = await res.json();
    cached = data.mode === "user" ? "user" : "guest";
  } catch {
    cached = "guest";
  }
  return cached;
}
