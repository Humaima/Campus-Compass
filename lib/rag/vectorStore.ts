import { mkdir, readFile, writeFile } from "fs/promises";
import { createHash } from "crypto";
import path from "path";
import { loadDocuments } from "./loadDocuments";
import { chunkDocuments } from "./chunkDocuments";
import { embedTexts, EMBEDDING_MODEL } from "./embeddings";
import type { RetrievedChunk } from "./types";

interface StoredVector {
  chunk: RetrievedChunk;
  embedding: number[];
}

interface VectorStoreCache {
  hash: string;
  vectors: StoredVector[];
}

const CACHE_PATH = path.join(process.cwd(), ".cache", "vector-store.json");

// Fingerprints the chunk content plus the embedding model, so the cache
// auto-invalidates both when the knowledge base changes and when the
// embedding provider/model changes — switching providers must not silently
// reuse vectors from a different (and dimensionally incompatible) space.
function hashChunks(chunks: RetrievedChunk[]): string {
  const hash = createHash("sha256");
  hash.update(EMBEDDING_MODEL);
  for (const chunk of chunks) hash.update(chunk.content);
  return hash.digest("hex");
}

async function readCache(): Promise<VectorStoreCache | null> {
  try {
    const raw = await readFile(CACHE_PATH, "utf-8");
    return JSON.parse(raw) as VectorStoreCache;
  } catch {
    return null;
  }
}

async function writeCache(cache: VectorStoreCache): Promise<void> {
  try {
    await mkdir(path.dirname(CACHE_PATH), { recursive: true });
    await writeFile(CACHE_PATH, JSON.stringify(cache), "utf-8");
  } catch {
    // Caching is an optimization, not a requirement — a read-only
    // filesystem (e.g. some serverless deploys) shouldn't break retrieval.
  }
}

async function buildVectorStore(): Promise<StoredVector[]> {
  const documents = await loadDocuments();
  const chunks = chunkDocuments(documents);
  const hash = hashChunks(chunks);

  const cached = await readCache();
  if (cached && cached.hash === hash) {
    return cached.vectors;
  }

  const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));
  const vectors = chunks.map((chunk, index) => ({
    chunk,
    embedding: embeddings[index],
  }));

  await writeCache({ hash, vectors });
  return vectors;
}

// Local store: an in-memory cache per server process, backed by a disk
// cache keyed on a hash of the chunk content. A dev-server restart reuses
// the disk cache (no re-embedding, no re-hitting the embeddings API); editing
// knowledge/*.md changes the hash and triggers a rebuild automatically.
let store: Promise<StoredVector[]> | null = null;
function getVectorStore(): Promise<StoredVector[]> {
  store ??= buildVectorStore();
  return store;
}

function cosineSimilarity(a: number[], b: number[]): number {
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

export async function searchVectorStore(
  queryEmbedding: number[],
  topK: number
): Promise<RetrievedChunk[]> {
  const vectors = await getVectorStore();

  return vectors
    .map(
      ({ chunk, embedding }): RetrievedChunk => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, embedding),
      })
    )
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, topK);
}
