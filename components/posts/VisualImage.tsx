"use client";

import { useMemo } from "react";
import type { VisualCard } from "@/lib/types";

/**
 * Renders the post's visual as a designed LinkedIn image card. The card spec is
 * encoded into the /api/visual-image URL, which renders it to a real PNG (crisp
 * text + on-brand colors) via Next.js ImageResponse — no AI image model needed.
 */

// Unicode-safe base64 (emoji-friendly), matching the route decoder.
function encodeSpec(card: VisualCard): string {
  const bytes = new TextEncoder().encode(JSON.stringify(card));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export default function VisualImage({ visual }: { visual: VisualCard }) {
  const url = useMemo(
    () => `/api/visual-image?spec=${encodeURIComponent(encodeSpec(visual))}`,
    [visual]
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Visual
        </h2>
        <a
          href={url}
          download="postpilot-visual.png"
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
        >
          Download
        </a>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={visual.title} className="aspect-square w-full" />
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Rendered card · {visual.layout} · accent {visual.accent}
      </p>
    </section>
  );
}
