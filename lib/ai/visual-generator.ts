import { Type } from "@google/genai";
import { generateJSON } from "./gemini";
import type { VisualPrompt } from "../types";

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
    style: { type: Type.STRING },
    dimensions: { type: Type.STRING },
  },
  required: ["prompt", "style", "dimensions"],
};

const SYSTEM = `You write image-generation prompts for LinkedIn post visuals.
Visuals should be clean, modern, professional, and not cluttered with text.`;

export async function generateVisualPrompt(
  topic: string,
  postBody: string
): Promise<VisualPrompt> {
  const prompt = `Create an AI image-generation prompt for a LinkedIn visual that
matches a post about "${topic}".

POST (for context):
"""
${postBody.slice(0, 1200)}
"""

Return a JSON object with exactly these fields:
- "prompt": a detailed image prompt (1-2 sentences) — dark modern background, minimalist illustration, professional, no embedded text
- "style": a short style label (e.g. "minimalist tech", "editorial flat illustration")
- "dimensions": recommended LinkedIn dimensions (e.g. "1200x1200 (square)")

Return ONLY the JSON object.`;

  return generateJSON<VisualPrompt>(prompt, SYSTEM, SCHEMA);
}
