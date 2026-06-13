import { Type } from "@google/genai";
import { generateJSON } from "./gemini";
import type { DimensionScore, PostEvaluation, ScoreDimension } from "../types";

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    dimensions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dimension: {
            type: Type.STRING,
            enum: [
              "hook",
              "readability",
              "authority",
              "virality",
              "cta",
              "formatting",
            ],
          },
          score: { type: Type.NUMBER },
          reason: { type: Type.STRING },
        },
        required: ["dimension", "score", "reason"],
      },
    },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["dimensions", "suggestions"],
};

const SYSTEM = `You are a brutally honest LinkedIn engagement analyst. You score posts
on objective, measurable qualities. You are not a cheerleader — most posts are a 60-75.
Reserve 90+ for posts that are genuinely exceptional. Always justify each score in one
short, specific sentence.`;

// Weighting reflects what actually drives LinkedIn reach.
const WEIGHTS: Record<ScoreDimension, number> = {
  hook: 0.3,
  virality: 0.2,
  readability: 0.15,
  cta: 0.15,
  authority: 0.1,
  formatting: 0.1,
};

interface RawEval {
  dimensions: DimensionScore[];
  suggestions: string[];
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export async function evaluatePost(postBody: string): Promise<PostEvaluation> {
  const prompt = `Evaluate this LinkedIn post.

POST:
"""
${postBody.slice(0, 3000)}
"""

Score these six dimensions from 0-100:
- "hook": does the first line stop the scroll?
- "readability": short lines, whitespace, easy skim?
- "authority": does it sound credible and experienced?
- "virality": shareability / comment-bait / emotional pull
- "cta": is there a clear call-to-action that invites engagement?
- "formatting": LinkedIn-native formatting (no markdown, good line breaks)

Return a JSON object with exactly:
- "dimensions": array of { "dimension", "score", "reason" } for all six dimensions above
- "suggestions": array of 2-4 concrete, specific improvements

Return ONLY the JSON object.`;

  const raw = await generateJSON<RawEval>(prompt, SYSTEM, SCHEMA);

  // Normalize + compute the weighted overall score ourselves (don't trust the model's math).
  const dimensions = raw.dimensions.map((d) => ({
    ...d,
    score: clamp(d.score),
  }));

  const overall = clamp(
    dimensions.reduce(
      (sum, d) => sum + d.score * (WEIGHTS[d.dimension] ?? 0),
      0
    )
  );

  return { overall, dimensions, suggestions: raw.suggestions ?? [] };
}
