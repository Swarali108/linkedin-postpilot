import type { BrandProfile, Tone } from "../types";

/**
 * Brand profile persistence.
 *
 * Phase 2 stores the profile in the browser (localStorage) so the app is fully
 * usable with zero backend setup. The interface is intentionally small —
 * swapping to Supabase later means reimplementing only these three functions
 * (e.g. an authenticated fetch to /api/profile backed by the BrandProfiles table).
 */

const STORAGE_KEY = "postpilot.brandProfile";

export const EMPTY_PROFILE: BrandProfile = {
  name: "",
  headline: "",
  industry: "",
  interests: "",
  audience: "",
  defaultTone: "professional" as Tone,
  voiceNotes: "",
};

export function loadProfile(): BrandProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Partial<BrandProfile>) };
  } catch {
    return null;
  }
}

export function saveProfile(profile: BrandProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** True if the profile has enough filled in to meaningfully personalize output. */
export function hasUsefulProfile(p: BrandProfile | null): p is BrandProfile {
  return Boolean(p && (p.industry.trim() || p.voiceNotes.trim() || p.headline.trim()));
}
