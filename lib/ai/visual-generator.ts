import { generateJSON, Models } from "./llm";
import { brandProfileBlock } from "./personalization";
import type { BrandProfile, VisualCard } from "../types";

const SYSTEM = `You design the spec for a LinkedIn image card — a clean, modern graphic
that visually summarizes a post (think a polished "carousel cover" or quote card).
The card shows REAL TEXT, so distill the post into a punchy title plus either a
short list of points (each with one fitting emoji) or a single standout quote.

Guidelines:
- Title: 2-6 words, punchy, title-case. It's the headline of the image.
- Prefer layout "list" when the post has steps/items/takeaways; use "quote" when
  one line is the star.
- For "list": 3-6 points, each a few words (not full sentences), each with ONE
  relevant emoji icon.
- Pick an accent hex color that fits the topic's vibe (professional blues/teals
  for technical, warm tones for story/humor, etc.). Choose theme "dark" usually
  (LinkedIn graphics pop on dark), "light" only if it clearly fits.`;

function normalizeAccent(accent: string): string {
  const hex = accent?.trim();
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#0a66c2";
}

export async function generateVisualCard(
  topic: string,
  postBody: string,
  brandProfile?: BrandProfile
): Promise<VisualCard> {
  const prompt = `Design a LinkedIn image card for this post about "${topic}".
${brandProfileBlock(brandProfile)}
POST:
"""
${postBody.slice(0, 2000)}
"""

Return a JSON object with:
- "title": punchy 2-6 word headline
- "subtitle": optional one short line (or "")
- "layout": "list" or "quote"
- "points": (if list) 3-6 objects { "icon": one emoji, "text": few words }
- "quote": (if quote) one standout line from the post
- "accent": a hex color like "#0a66c2" matching the vibe
- "theme": "dark" or "light"

Return ONLY the JSON object.`;

  const card = await generateJSON<VisualCard>(prompt, SYSTEM, Models.visual);
  return {
    ...card,
    accent: normalizeAccent(card.accent),
    theme: card.theme === "light" ? "light" : "dark",
    points: card.points?.slice(0, 6),
  };
}
