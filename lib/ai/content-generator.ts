import { generateText, Models } from "./llm";
import { brandProfileBlock } from "./personalization";
import type { GenerationInput, Hook } from "../types";

const SYSTEM = `You are an expert LinkedIn ghostwriter. You write posts that feel human,
specific, and valuable — never corporate or AI-sounding. Follow these rules:
- Open with the provided hook verbatim as the first line.
- Use short lines and generous line breaks (LinkedIn rewards whitespace).
- ABSOLUTELY NO markdown. Never use asterisks (* or **) for bold/italics, no #
  headings, no markdown lists. Write plain text only.
- For lists, start lines with a relevant emoji or a "•" bullet — never "* " or "- ".
- Sprinkle in a few tasteful, relevant emojis to add warmth and visual rhythm
  (section markers, point accents) — but don't overdo it (roughly 1 per few lines).
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

  const raw = await generateText(prompt, SYSTEM, Models.writer);
  return stripMarkdown(raw);
}

// Safety net: LinkedIn doesn't render markdown, and the model occasionally slips
// in bold/italic asterisks or "* " bullets despite instructions. Clean them up.
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1") // **bold** -> bold
    .replace(/\*(?!\s)(.+?)(?<!\s)\*/g, "$1") // *italic* -> italic
    .replace(/^\s{0,3}[*-]\s+/gm, "• ") // "* item" / "- item" -> "• item"
    .replace(/^#{1,6}\s+/gm, "") // markdown headings
    .replace(/\*\*/g, "") // any stray leftovers
    .trim();
}
