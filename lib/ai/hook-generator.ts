import { Type } from "@google/genai";
import { generateJSON } from "./gemini";
import { brandProfileBlock } from "./personalization";
import type { Hook, GenerationInput } from "../types";

const SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING },
      style: {
        type: Type.STRING,
        enum: ["curiosity", "contrarian", "story", "educational"],
      },
    },
    required: ["text", "style"],
  },
};

const SYSTEM = `You are a viral LinkedIn copywriter. Hooks are the first 1-2 lines of a
post — they must stop the scroll. Great hooks are concrete, create curiosity or
tension, and never use hashtags or emojis in the first line. Keep each hook under
~20 words.`;

export async function generateHooks(
  input: GenerationInput,
  memoryBlock = ""
): Promise<Hook[]> {
  const prompt = `Write 5 scroll-stopping LinkedIn hooks for a post about: "${input.topic}".
Tone: ${input.tone}. Goal: ${input.goal}.
${input.audience ? `Audience: ${input.audience}.` : ""}
${brandProfileBlock(input.brandProfile)}${memoryBlock}
Give a variety of styles: "curiosity", "contrarian", "story", "educational".

Return a JSON array of objects with exactly these fields:
- "text": the hook line(s)
- "style": one of "curiosity" | "contrarian" | "story" | "educational"

Return ONLY the JSON array.`;

  return generateJSON<Hook[]>(prompt, SYSTEM, SCHEMA);
}
