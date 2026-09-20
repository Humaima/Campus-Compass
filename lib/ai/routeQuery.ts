import type { CampusIntent } from "./intentTypes";

export type QueryRoute = "structured" | "knowledge";

// Words that reliably signal the question is about a rule, requirement, or
// multi-step process — not a place. Checked first and wins outright, because
// these override an otherwise-structured-looking query: "What documents do I
// need?" contains "need" (normally a SEARCH_SERVICE trigger for a place like
// the ID office), but asking *what's required* is a knowledge-base question,
// not a location lookup.
// Maps to: POLICIES / PROCEDURES / GUIDELINES / DOCUMENTATION / LONG-FORM INFORMATION
const KNOWLEDGE_SIGNALS = [
  "requirement",
  "document",
  "rule",
  "polic",
  "procedure",
  "guideline",
  "how does",
  "process",
  "eligib",
  "deadline",
  "steps to",
];

// Phrases that name a location, a route, a distance, or ask about a
// building/service/hours directly — answerable from data/buildings.ts
// without touching the knowledge base.
// Maps to: LOCATION / ROUTE / DISTANCE / BUILDING / SERVICES / HOURS
const STRUCTURED_SIGNALS = [
  "where is",
  "where's",
  "where are",
  "where can i",
  "take me",
  "directions",
  "how do i get",
  "nearby",
  "near ",
  "close to",
  "distance",
  "hours",
  "open",
  "closes",
  "located",
  "help with",
  "need",
];

// Falls back to the Day 5 intent classification when no keyword decides it —
// e.g. "Show me orientation quests" has no signal phrase above, but is
// unambiguously a structured lookup (START_QUEST) rather than a knowledge
// question.
const STRUCTURED_INTENTS = new Set<CampusIntent["intent"]>([
  "SEARCH_BUILDING",
  "SEARCH_SERVICE",
  "GET_DIRECTIONS",
  "FIND_CATEGORY",
  "START_QUEST",
]);

// The architectural decision from Step 16: deterministic structured data for
// LOCATION/ROUTE/DISTANCE/BUILDING/SERVICES/HOURS, RAG for
// POLICIES/PROCEDURES/GUIDELINES/DOCUMENTATION/LONG-FORM INFORMATION.
export function routeQuery(query: string, intent: CampusIntent): QueryRoute {
  const text = query.toLowerCase();

  if (KNOWLEDGE_SIGNALS.some((phrase) => text.includes(phrase))) {
    return "knowledge";
  }

  if (STRUCTURED_SIGNALS.some((phrase) => text.includes(phrase))) {
    return "structured";
  }

  return STRUCTURED_INTENTS.has(intent.intent) ? "structured" : "knowledge";
}
