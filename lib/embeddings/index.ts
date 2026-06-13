// Local embeddings using all-MiniLM-L6-v2 via transformers.js.
// Runs entirely on-device — no API cost, no Gemini quota used.
// 384-dimensional, mean-pooled, L2-normalized vectors.

// transformers.js is ESM-only and heavy; import lazily so it never loads
// during the build's static analysis or in non-embedding code paths.
type FeatureExtractor = (
  text: string,
  opts: { pooling: "mean"; normalize: boolean }
) => Promise<{ data: Float32Array }>;

export const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
export const EMBEDDING_DIM = 384;

let extractorPromise: Promise<FeatureExtractor> | null = null;

async function getExtractor(): Promise<FeatureExtractor> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      // Cast: the pipeline's call signature is broader than we use.
      return (await pipeline(
        "feature-extraction",
        EMBEDDING_MODEL
      )) as unknown as FeatureExtractor;
    })();
  }
  return extractorPromise;
}

/** Embed a single string into a 384-dim unit vector. */
export async function embed(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

/** Embed many strings sequentially (the model isn't meaningfully batched here). */
export async function embedAll(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (const t of texts) out.push(await embed(t));
  return out;
}

/** Cosine similarity of two equal-length vectors. Inputs are already normalized,
 * so this is just the dot product — but we keep it general for safety. */
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
