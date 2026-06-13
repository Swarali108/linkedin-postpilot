import { GoogleGenAI, type Schema } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === "your_gemini_api_key_here") {
  // Don't throw at import time during build; throw lazily when actually used.
  console.warn(
    "[gemini] GEMINI_API_KEY is not set. Add it to .env.local to enable generation."
  );
}

// flash-lite has a far more generous free-tier daily quota (1,500 vs 20 RPD).
export const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

// Embedding model. gemini-embedding-001 defaults to 3072-dim; we truncate to 768
// via outputDimensionality to keep the pgvector column compact.
export const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
export const EMBEDDING_DIM = 768;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is missing. Get one at https://aistudio.google.com/apikey and add it to .env.local"
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Gemini occasionally returns 429 (rate limit) or 503 (overloaded). These are transient. */
function isTransient(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b(429|503)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand/i.test(
    msg
  );
}

type GenConfig = Parameters<GoogleGenAI["models"]["generateContent"]>[0]["config"];

/** Call the model, retrying transient errors with exponential backoff. */
async function callModel(prompt: string, config: GenConfig): Promise<string> {
  const ai = getClient();
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config,
      });
      return (response.text ?? "").trim();
    } catch (err) {
      if (attempt < maxAttempts && isTransient(err)) {
        await sleep(500 * 2 ** (attempt - 1)); // 0.5s, 1s, 2s
        continue;
      }
      throw err;
    }
  }
  throw new Error("unreachable");
}

/**
 * Generate plain text from a prompt.
 */
export async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  return callModel(prompt, systemInstruction ? { systemInstruction } : undefined);
}

/**
 * Embed text into a vector via the Gemini embedding API (768-dim).
 * Retries transient errors with backoff, matching callModel.
 */
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
      // gemini-embedding-001 truncated below 3072 dims isn't normalized; L2-normalize
      // so cosine similarity (and pgvector cosine ops) behave correctly.
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

function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

/**
 * Generate JSON from a prompt and parse it.
 *
 * When a `responseSchema` is supplied, the model is constrained to emit JSON
 * matching that schema — this is the most reliable mode and avoids the stray-text
 * glitches that occasionally corrupt free-form JSON. If parsing still fails
 * (rare model hiccup), we retry once before giving up.
 */
export async function generateJSON<T>(
  prompt: string,
  systemInstruction?: string,
  responseSchema?: Schema
): Promise<T> {
  const config = {
    responseMimeType: "application/json",
    ...(responseSchema ? { responseSchema } : {}),
    ...(systemInstruction ? { systemInstruction } : {}),
  };

  // callModel handles transient (429/503) retries; this loop handles the rarer
  // case of a successful response whose body still fails to parse as JSON.
  let lastRaw = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    lastRaw = await callModel(prompt, config);
    try {
      return parseJSON<T>(lastRaw);
    } catch {
      // fall through to retry
    }
  }

  throw new Error(`Failed to parse model JSON output: ${lastRaw.slice(0, 500)}`);
}
