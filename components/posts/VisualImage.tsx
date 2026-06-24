"use client";

import { useMemo, useState } from "react";
import type { VisualCard } from "@/lib/types";

/**
 * Post visual. Default is an instant template-rendered card (/api/visual-image).
 * A button generates a richer, AI-designed infographic via OpenRouter
 * (/api/visual-ai) on demand — only spending credits when the user asks.
 */

// Unicode-safe base64 (emoji-friendly), matching the route decoder.
function encodeSpec(card: VisualCard): string {
  const bytes = new TextEncoder().encode(JSON.stringify(card));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export default function VisualImage({ visual }: { visual: VisualCard }) {
  const cardUrl = useMemo(
    () => `/api/visual-image?spec=${encodeURIComponent(encodeSpec(visual))}`,
    [visual]
  );

  const [aiImage, setAiImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shown = aiImage ?? cardUrl;

  async function generateAi() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/visual-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visual }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed.");
      setAiImage(data.image as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Visual
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={generateAi}
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Designing…" : aiImage ? "↻ Regenerate AI" : "✨ Generate AI image"}
          </button>
          <a
            href={shown}
            download="postpilot-visual.png"
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
          >
            Download
          </a>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-gray-100">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm font-medium text-gray-600 backdrop-blur-sm">
            Designing your image… (~10–20s)
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shown} alt={visual.title} className="aspect-square w-full object-cover" />
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}
      <p className="mt-2 text-xs text-gray-400">
        {aiImage
          ? "AI-designed infographic (OpenRouter)"
          : `Template card · tap “Generate AI image” for a designed version`}
        {aiImage && (
          <button
            onClick={() => setAiImage(null)}
            className="ml-2 text-linkedin hover:underline"
          >
            use simple card
          </button>
        )}
      </p>
    </section>
  );
}
