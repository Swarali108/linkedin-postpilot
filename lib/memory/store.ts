import { promises as fs } from "fs";
import path from "path";
import { cosineSimilarity, embed } from "../embeddings";
import type { MemoryHit, MemoryRecord, MemoryType } from "../types";

/**
 * Disk-backed vector store for brand memory (Phase 3).
 *
 * Records are persisted as JSON at data/memory.json and held in an in-memory
 * cache for fast cosine search. This is a lightweight stand-in for ChromaDB —
 * the public functions below mirror what a Chroma collection offers (add /
 * query / list / delete), so swapping in a real Chroma server later is contained.
 *
 * Note: a local JSON file persists in local dev but NOT on serverless hosts
 * (Vercel's filesystem is ephemeral). For production, back this with Supabase
 * pgvector or a hosted Chroma instance.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "memory.json");

let cache: MemoryRecord[] | null = null;

async function load(): Promise<MemoryRecord[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    cache = JSON.parse(raw) as MemoryRecord[];
  } catch {
    cache = [];
  }
  return cache;
}

async function persist(records: MemoryRecord[]): Promise<void> {
  cache = records;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(records, null, 2), "utf-8");
}

function makeId(): string {
  // Date.now()/Math.random() are fine in app runtime (not in workflow scripts).
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Embed and store a piece of the user's writing. */
export async function addMemory(
  text: string,
  type: MemoryType,
  userId = "local"
): Promise<MemoryRecord> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Cannot store empty memory.");

  const records = await load();
  const embedding = await embed(trimmed);
  const record: MemoryRecord = {
    id: makeId(),
    userId,
    text: trimmed,
    type,
    embedding,
    createdAt: new Date().toISOString(),
  };
  await persist([record, ...records]);
  return record;
}

/** All memories for a user, newest first, without embeddings. */
export async function listMemories(userId = "local"): Promise<MemoryHit[]> {
  const records = await load();
  return records
    .filter((r) => r.userId === userId)
    .map(({ id, text, type, createdAt }) => ({
      id,
      text,
      type,
      createdAt,
      similarity: 1,
    }));
}

/** Semantic search: embed the query and return the top-k most similar memories. */
export async function searchMemories(
  query: string,
  k = 3,
  userId = "local"
): Promise<MemoryHit[]> {
  const records = (await load()).filter((r) => r.userId === userId);
  if (records.length === 0) return [];

  const queryEmbedding = await embed(query);
  return records
    .map((r) => ({
      id: r.id,
      text: r.text,
      type: r.type,
      createdAt: r.createdAt,
      similarity: cosineSimilarity(queryEmbedding, r.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}

export async function deleteMemory(id: string): Promise<void> {
  const records = await load();
  await persist(records.filter((r) => r.id !== id));
}

export async function clearMemories(userId = "local"): Promise<void> {
  const records = await load();
  await persist(records.filter((r) => r.userId !== userId));
}
