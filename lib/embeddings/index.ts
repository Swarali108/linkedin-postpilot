// Embeddings via the Gemini embedding API (text-embedding-004, 768-dim).
//
// Originally this used a local all-MiniLM-L6-v2 model (transformers.js), but that
// pulls in onnxruntime-node (a large native binding) which doesn't fit Vercel's
// serverless functions. The hosted embedding API keeps the bundle small and
// deploys cleanly, at a tiny per-call cost.

import { EMBEDDING_DIM, EMBEDDING_MODEL, embedText } from "../ai/gemini";

export { EMBEDDING_DIM, EMBEDDING_MODEL };

/** Embed a single string into a 768-dim vector. */
export async function embed(text: string): Promise<number[]> {
  return embedText(text);
}

/** Embed many strings sequentially. */
export async function embedAll(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (const t of texts) out.push(await embed(t));
  return out;
}

/** Cosine similarity of two equal-length vectors (used by the disk fallback). */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
