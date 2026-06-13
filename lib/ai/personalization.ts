import type { BrandProfile } from "../types";

/**
 * Render a brand profile into a prompt block the LLM can use to personalize
 * output. Returns an empty string when there's nothing useful to inject.
 */
export function brandProfileBlock(profile?: BrandProfile): string {
  if (!profile) return "";

  const lines: string[] = [];
  if (profile.name) lines.push(`- Name: ${profile.name}`);
  if (profile.headline) lines.push(`- Role/headline: ${profile.headline}`);
  if (profile.industry) lines.push(`- Industry: ${profile.industry}`);
  if (profile.interests) lines.push(`- Posts about: ${profile.interests}`);
  if (profile.audience) lines.push(`- Audience: ${profile.audience}`);
  if (profile.voiceNotes) lines.push(`- Voice & style: ${profile.voiceNotes}`);

  if (lines.length === 0) return "";

  return `\nWrite as THIS person. Match their voice, expertise, and perspective:
${lines.join("\n")}\n`;
}
