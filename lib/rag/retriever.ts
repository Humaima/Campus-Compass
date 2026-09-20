import { embedText } from "./embeddings";
import { searchVectorStore } from "./vectorStore";
import type { RetrievedChunk } from "./types";

const DEFAULT_TOP_K = 3;

export async function retrieve(
  query: string,
  topK: number = DEFAULT_TOP_K
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(query);
  return searchVectorStore(queryEmbedding, topK);
}
