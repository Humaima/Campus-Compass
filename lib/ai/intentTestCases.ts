import type { IntentType } from "./intentTypes";

export type IntentTestCase = {
  query: string;
  expectedIntent: IntentType;
  // Optional: which building the match should resolve to. Used below to
  // prove a synonym actually points at the right building, not just that
  // some intent came back.
  expectedTarget?: string;
};

// A small rule-based baseline. Once an LLM-based intent classifier exists,
// running this exact same list through it and comparing accuracy against
// the rule-based numbers gives Campus Compass an actual engineering story
// ("rule-based vs LLM"), instead of just swapping one classifier for
// another with no way to tell whether it's actually better.
export const intentTestCases: IntentTestCase[] = [
  { query: "Where is the library?", expectedIntent: "SEARCH_BUILDING" },
  { query: "Where is the CS building?", expectedIntent: "SEARCH_BUILDING" },
  { query: "Where can I print?", expectedIntent: "SEARCH_SERVICE" },
  { query: "Where can I study?", expectedIntent: "SEARCH_SERVICE" },
  { query: "I need help with registration.", expectedIntent: "SEARCH_SERVICE" },
  { query: "Where can I get a student ID?", expectedIntent: "SEARCH_SERVICE" },
  { query: "Take me to the cafeteria.", expectedIntent: "GET_DIRECTIONS" },
  { query: "Show me orientation quests.", expectedIntent: "START_QUEST" },

  // Step 8 — synonym coverage. Neither "hungry" nor "enroll" appears in
  // cafeteria's/admin's curated `keywords`; these only resolve correctly
  // because of data/synonyms.ts.
  { query: "Where can I go if I'm hungry?", expectedIntent: "SEARCH_SERVICE", expectedTarget: "cafeteria" },
  { query: "Where can I enroll?", expectedIntent: "SEARCH_SERVICE", expectedTarget: "admin" },
];
