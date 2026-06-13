import type { HistoryEntry } from "../types";

/**
 * Generation history (Phase 7). Stored in the browser so it works with no
 * backend; mirrors the GenerationHistory table from the design doc and could be
 * swapped for a Supabase-backed store later.
 */

const STORAGE_KEY = "postpilot.history";
const MAX_ENTRIES = 100;

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function listHistory(): HistoryEntry[] {
  return read();
}

export function addHistory(entry: HistoryEntry): void {
  write([entry, ...read().filter((e) => e.id !== entry.id)]);
}

/** Update the score of an existing entry once evaluation completes. */
export function setHistoryScore(id: string, score: number): void {
  write(read().map((e) => (e.id === id ? { ...e, score } : e)));
}

export function deleteHistory(id: string): void {
  write(read().filter((e) => e.id !== id));
}

export function clearHistory(): void {
  write([]);
}

export interface HistoryStats {
  total: number;
  scored: number;
  averageScore: number | null;
  bestScore: number | null;
}

export function historyStats(): HistoryStats {
  const entries = read();
  const scores = entries
    .map((e) => e.score)
    .filter((s): s is number => typeof s === "number");
  return {
    total: entries.length,
    scored: scores.length,
    averageScore: scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null,
    bestScore: scores.length ? Math.max(...scores) : null,
  };
}
