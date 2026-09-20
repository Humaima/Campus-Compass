import type { QueryRoute } from "./routeQuery";

export type RouteQueryTestCase = {
  query: string;
  expectedRoute: QueryRoute;
};

// Step 16's own examples of the structured-vs-RAG decision boundary, plus a
// few from Day 5's intentTestCases.ts that share a trigger word with a
// knowledge-base example ("need"/"documents", "orientation") to prove the
// router tells them apart by meaning, not just keyword overlap.
export const routeQueryTestCases: RouteQueryTestCase[] = [
  // Structured: LOCATION / ROUTE / DISTANCE / BUILDING / SERVICES / HOURS
  { query: "Where is the library?", expectedRoute: "structured" },
  { query: "Where is the cafeteria?", expectedRoute: "structured" },
  { query: "Take me to CS.", expectedRoute: "structured" },
  { query: "What buildings are nearby?", expectedRoute: "structured" },
  { query: "Where can I print?", expectedRoute: "structured" },
  { query: "I need help with registration.", expectedRoute: "structured" },
  { query: "Show me orientation quests.", expectedRoute: "structured" },

  // RAG: POLICIES / PROCEDURES / GUIDELINES / DOCUMENTATION / LONG-FORM INFORMATION
  { query: "What are the registration requirements?", expectedRoute: "knowledge" },
  { query: "What documents do I need?", expectedRoute: "knowledge" },
  { query: "What are the library rules?", expectedRoute: "knowledge" },
  { query: "How does course registration work?", expectedRoute: "knowledge" },
  { query: "What is the orientation procedure?", expectedRoute: "knowledge" },
];
