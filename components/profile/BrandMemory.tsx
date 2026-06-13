"use client";

import { useEffect, useState } from "react";
import type { MemoryHit } from "@/lib/types";

export default function BrandMemory() {
  const [memories, setMemories] = useState<MemoryHit[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/memory");
      const data = await res.json();
      if (res.ok) setMemories(data.memories as MemoryHit[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addPost(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setText("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/memory?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setMemories((m) => m.filter((x) => x.id !== id));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={addPost}
        className="h-fit space-y-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-semibold text-gray-900">Add a past post</h2>
        <p className="text-sm text-gray-600">
          Paste posts you&apos;ve written before. PostPilot embeds them and recalls
          the most relevant ones when you generate — so new posts sound like you.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Paste a LinkedIn post you wrote…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-linkedin focus:outline-none focus:ring-1 focus:ring-linkedin"
        />
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="rounded-lg bg-linkedin px-5 py-2.5 font-semibold text-white transition hover:bg-linkedin-dark disabled:opacity-60"
        >
          {saving ? "Embedding…" : "Save to memory"}
        </button>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-900">
          Stored memories{" "}
          <span className="text-sm font-normal text-gray-400">
            ({memories.length})
          </span>
        </h2>
        {loading && <p className="text-gray-400">Loading…</p>}
        {!loading && memories.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-400">
            No memories yet. Add a past post to start building your voice.
          </p>
        )}
        {memories.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                {m.type === "generated" ? "generated" : "past post"}
              </span>
              <button
                onClick={() => remove(m.id)}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Delete
              </button>
            </div>
            <p className="line-clamp-4 whitespace-pre-wrap text-sm text-gray-700">
              {m.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
