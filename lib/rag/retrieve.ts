import { searchMemories } from "../memory/store";
import type { MemoryHit } from "../types";

/** Below this cosine similarity, a memory is too unrelated to be useful as a style
 * example. Tuned for gemini-embedding-001, whose similarity scale runs high
 * (unrelated pairs ~0.45-0.5, clearly-related ~0.7+). Lower this if you switch
 * to a model with a wider similarity spread. */
const MIN_SIMILARITY = 0.6;

export interface RagContext {
  hits: MemoryHit[];
  /** A prompt block of the user's relevant past writing, or "" if nothing relevant. */
  block: string;
}

/**
 * Retrieve the user's most relevant past posts for a topic and turn them into a
 * prompt block the writer can imitate for voice/style. (Phase 4 — RAG.)
 */
export async function retrieveContext(
  topic: string,
  userId = "local",
  k = 3
): Promise<RagContext> {
  const hits = (await searchMemories(topic, k, userId)).filter(
    (h) => h.similarity >= MIN_SIMILARITY
  );

  if (hits.length === 0) return { hits: [], block: "" };

  const examples = hits
    .map(
      (h, i) =>
        `Example ${i + 1} (similarity ${h.similarity.toFixed(2)}):\n"""\n${h.text.slice(0, 1200)}\n"""`
    )
    .join("\n\n");

  const block = `\nHere are the user's own past posts that are most relevant to this topic.
Study them and MATCH their voice, rhythm, vocabulary, and formatting — but write
something new. Do not copy them verbatim.

${examples}\n`;

  return { hits, block };
}
