import { generateText } from "./gemini";
import { brandProfileBlock } from "./personalization";
import type { GenerationInput, Hook } from "../types";

const SYSTEM = `You are an expert LinkedIn ghostwriter. You write posts that feel human,
specific, and valuable — never corporate or AI-sounding. Follow these rules:
- Open with the provided hook verbatim as the first line.
- Use short lines and generous line breaks (LinkedIn rewards whitespace).
- No markdown headings, no asterisks for bold, no numbered markdown lists — use
  plain text and simple bullet characters (•) if needed.
- Keep it under ~250 words unless it's a carousel script.
- End with a clear, natural call-to-action that invites comments.
- Do NOT include hashtags (those are added separately).`;

const POST_TYPE_GUIDANCE: Record<GenerationInput["postType"], string> = {
  educational:
    "Teach one concrete thing. Use a simple framework or 3-5 takeaways.",
  story:
    "Tell a short first-person story with a turning point and a lesson.",
  opinion:
    "Take a clear, slightly contrarian stance and back it with reasoning.",
  carousel:
    "Write a carousel SCRIPT: a title slide, then 6-8 slides each labeled 'Slide N:' with 1-2 punchy lines, then a final CTA slide.",
  "personal-insight":
    "Share a reflective personal realization and what changed because of it.",
};

export async function generatePost(
  input: GenerationInput,
  hook: Hook,
  memoryBlock = ""
): Promise<string> {
  const prompt = `Write a complete LinkedIn ${input.postType} post.

Topic: ${input.topic}
Tone: ${input.tone}
Goal: ${input.goal}
${input.audience ? `Audience: ${input.audience}` : ""}
${input.context ? `Extra context to include: ${input.context}` : ""}
${brandProfileBlock(input.brandProfile)}${memoryBlock}
Use this exact hook as the first line:
"${hook.text}"

Post-type guidance: ${POST_TYPE_GUIDANCE[input.postType]}

Return ONLY the post text, ready to paste into LinkedIn.`;

  return generateText(prompt, SYSTEM);
}
