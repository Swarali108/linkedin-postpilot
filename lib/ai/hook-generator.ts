import { generateJSON, Models } from "./llm";
import { brandProfileBlock } from "./personalization";
import type { Hook, GenerationInput } from "../types";

const SYSTEM = `You are a world-class LinkedIn hook writer. The hook is the first 1-2
lines — the ONLY thing that decides whether someone stops scrolling. Write hooks
that are impossible to scroll past.

Rules for catchy hooks:
- Open with tension, a bold claim, a surprising number, or a pattern interrupt.
- Be specific and concrete — name the thing, the stakes, the outcome.
- Create an open loop / curiosity gap the reader MUST resolve by reading on.
- Short, punchy lines. Prefer ~6-14 words. Cut every filler word.
- Sound human and a little edgy — never corporate, never "In today's world…".
- No hashtags, no emojis, no quotation marks in the hook.

Examples of the energy to match:
- "Most RAG demos are lying to you."
- "I deleted 4,000 lines of code. Our app got faster."
- "Nobody tells you the LLM is the easy part."`;

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

  return generateJSON<Hook[]>(prompt, SYSTEM, Models.hook);
}
