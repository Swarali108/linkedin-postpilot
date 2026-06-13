import { Type } from "@google/genai";
import { generateJSON } from "./gemini";
import type { TopicSuggestion } from "../types";

const SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      angle: { type: Type.STRING },
      category: {
        type: Type.STRING,
        enum: ["trending", "personalized", "story", "learning"],
      },
    },
    required: ["title", "angle", "category"],
  },
};

const SYSTEM = `You are a LinkedIn content strategist. You generate sharp, specific,
non-generic content topics that working professionals can post about to grow a
personal brand. Avoid clichés and vague self-help platitudes.`;

export async function generateTopics(params: {
  industry: string;
  interests?: string;
  audience?: string;
}): Promise<TopicSuggestion[]> {
  const { industry, interests, audience } = params;

  const prompt = `Generate 8 LinkedIn post topic ideas for someone in: ${industry}.
${interests ? `Their interests: ${interests}.` : ""}
${audience ? `Their target audience: ${audience}.` : ""}

Cover a mix of these categories: "trending", "personalized", "story", "learning".

Return a JSON array of objects with exactly these fields:
- "title": a concrete, specific post topic (max ~12 words)
- "angle": one sentence on the unique angle or takeaway
- "category": one of "trending" | "personalized" | "story" | "learning"

Return ONLY the JSON array.`;

  return generateJSON<TopicSuggestion[]>(prompt, SYSTEM, SCHEMA);
}
