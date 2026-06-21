import { GoogleGenAI } from "@google/genai";

/**
 * Gemini is used ONLY for embeddings now (text generation moved to OpenRouter —
 * see ./llm.ts). The brand-memory vector store is 768-dim, so we keep
 * gemini-embedding-001 (cheap, separate quota) to avoid re-embedding everything.
 */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === "your_gemini_api_key_here") {
  console.warn(
    "[gemini] GEMINI_API_KEY is not set. Embeddings (brand memory / RAG) need it."
  );
}

// gemini-embedding-001 defaults to 3072-dim; we truncate to 768 to keep the
// pgvector column compact.
export const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
export const EMBEDDING_DIM = 768;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is missing (needed for embeddings). Get one at https://aistudio.google.com/apikey"
    );
  }
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransient(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b(429|503)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand/i.test(
    msg
  );
}

/** Embed text into a 768-dim unit vector via the Gemini embedding API. */
export async function embedText(text: string): Promise<number[]> {
  const ai = getClient();
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: { outputDimensionality: EMBEDDING_DIM },
      });
      const values = response.embeddings?.[0]?.values;
      if (!values || values.length === 0) {
        throw new Error("Gemini returned an empty embedding.");
      }
      // Truncated (<3072) vectors aren't normalized; L2-normalize for cosine.
      const norm = Math.sqrt(values.reduce((s, v) => s + v * v, 0));
      return norm > 0 ? values.map((v) => v / norm) : values;
    } catch (err) {
      if (attempt < maxAttempts && isTransient(err)) {
        await sleep(500 * 2 ** (attempt - 1));
        continue;
      }
      throw err;
    }
  }
  throw new Error("unreachable");
}
