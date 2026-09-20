// Split out from queryKnowledgeBase.ts so client components (e.g.
// RagDebugPanel) can read the threshold without pulling in the fs/embeddings
// chain that queryKnowledgeBase.ts depends on.
//
// Below this cosine similarity, the top chunk is treated as unreliable
// rather than presented as an answer.
//
// Tuned against the full 21-query set in retrievalTestCases.ts, run for
// real via testRetrievalPipeline.ts on gemini-embedding-001:
//   on-topic scores:     0.58 – 0.72
//   out-of-scope scores: 0.59 and 0.68
// The two ranges overlap — one out-of-scope question ("Does Arcadia have a
// study abroad program in Japan?") scored 0.68, right inside the on-topic
// range, because it shares vocabulary with academic-departments.md without
// that document actually answering it. No single threshold separates these
// groups cleanly; 0.60 is the best cutoff on this data (18/19 on-topic
// correctly pass, 1/2 out-of-scope correctly rejected — ~90% overall vs.
// 67% at the old placeholder of 0.65). Re-run testRetrievalPipeline.ts and
// adjust if the knowledge base or embedding model changes; closing the
// remaining gap needs a relevance check beyond pure similarity (e.g. an
// LLM judging the retrieved chunk), which is Day 7's job, not this one.
export const CONFIDENCE_THRESHOLD = 0.6;

// Day 11 — subdividing the pass bar above into "how much should the
// assistant commit to this answer" tiers, not just pass/fail. Anchored to
// the same empirical range documented above (on-topic 0.58-0.72,
// out-of-scope up to 0.68): MEDIUM starts partway through that band rather
// than at CONFIDENCE_THRESHOLD itself, so a score that barely cleared the
// pass bar — indistinguishable from the out-of-scope outlier at 0.68 — is
// still treated as LOW rather than presented with full confidence. HIGH
// starts near the top of the documented on-topic range. Heuristic
// subdivisions of a bar that's already close reading on a small eval set;
// revisit alongside CONFIDENCE_THRESHOLD if the knowledge base or embedding
// model changes.
export const MEDIUM_CONFIDENCE_THRESHOLD = 0.65;
export const HIGH_CONFIDENCE_THRESHOLD = 0.7;

export type ConfidenceTier = "none" | "low" | "medium" | "high";

// `score` is the top retrieved chunk's cosine similarity — undefined/0 (no
// chunks, or nothing scored) is always "none", matching queryKnowledgeBase's
// own `found` check.
export function getConfidenceTier(score: number | undefined): ConfidenceTier {
  const value = score ?? 0;
  if (value < CONFIDENCE_THRESHOLD) return "none";
  if (value < MEDIUM_CONFIDENCE_THRESHOLD) return "low";
  if (value < HIGH_CONFIDENCE_THRESHOLD) return "medium";
  return "high";
}
