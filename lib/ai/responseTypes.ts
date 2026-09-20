// What the Campus Guide LLM (Day 7) returns, once it's wired up — see
// lib/ai/prompts.ts for the rules it must follow to produce one of these.
// Structured so the frontend can act on an answer (show a building, offer
// directions), not just display text.
export interface CampusGuideResponse {
  answer: string;

  // A citation per factual claim — title/source only (not the full
  // RetrievedChunk), since this is what gets shown to the student, not
  // fed back into retrieval. Matches CAMPUS_GUIDE_SYSTEM_PROMPT's "never
  // fabricate a source" rule: every entry here must trace back to a real
  // retrieved chunk's metadata.
  sources: {
    title: string;
    source: string;
  }[];

  // Optional: the LLM can request the app do something (per "trigger
  // campus actions" in its allowed responsibilities), but it only names
  // the action — it doesn't compute a route or coordinates itself. `target`
  // is a building id from data/buildings.ts, resolved by the app the same
  // way handleCampusQuery.ts already resolves one, not invented by the LLM.
  action?: {
    type:
      | "NONE"
      | "SHOW_BUILDING"
      | "GET_DIRECTIONS"
      | "START_QUEST";

    target?: string;
  };

  // The retrieval confidence backing this answer (see
  // lib/rag/confidenceThreshold.ts) — lets the frontend show a low-
  // confidence answer differently, or decline to show one at all.
  confidence?: number;
}
