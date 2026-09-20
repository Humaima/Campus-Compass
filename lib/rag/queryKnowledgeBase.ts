import { retrieve } from "./retriever";
import { CONFIDENCE_THRESHOLD } from "./confidenceThreshold";
import type { RetrievedChunk } from "./types";

export type KnowledgeBaseResult = {
  found: boolean;
  chunks: RetrievedChunk[];
};

// The only entry point the rest of the app should call. It hides everything
// underneath — loading, chunking, embeddings, the vector store, and the
// confidence check — behind a single question-in, ranked-chunks-out
// interface. `found: false` means nothing cleared the confidence bar, so the
// caller should show a "couldn't find that" message rather than presenting a
// low-confidence chunk as if it were a real answer. `chunks` is still
// returned either way so a dev-only view (e.g. RagDebugPanel) can show what
// almost matched.
export async function queryKnowledgeBase(query: string): Promise<KnowledgeBaseResult> {
  const chunks = await retrieve(query);
  const topScore = chunks[0]?.score ?? 0;

  return { found: topScore >= CONFIDENCE_THRESHOLD, chunks };
}
