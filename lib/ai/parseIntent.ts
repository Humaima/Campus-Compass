import { buildings, type Building } from "@/data/buildings";
import { campusSynonyms } from "@/data/synonyms";
import type { CampusIntent } from "./intentTypes";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-word/phrase matching — a plain .includes() would let "cs" match
// inside "physics" or "basics", and would need "print" to somehow appear
// literally inside "printing" (it doesn't; it's the other way around).
function includesPhrase(text: string, phrase: string): boolean {
  return new RegExp(`\\b${escapeRegex(phrase)}\\b`, "i").test(text);
}

// Scans every building's keywords (not just its name/id) so this works for
// both "where is the library" (name) and "where can I print" (a keyword
// belonging to the library, not mentioned by name at all). Also checks
// data/synonyms.ts for casual terms students might use that the curated
// keyword list doesn't cover — "hungry" or "eat" for the cafeteria, not
// just "food"/"lunch".
function findBuildingMatch(text: string): { building: Building; keyword: string } | null {
  for (const building of buildings) {
    const terms = [building.name, ...building.keywords, ...(campusSynonyms[building.id] ?? [])];
    for (const keyword of terms) {
      if (includesPhrase(text, keyword)) {
        return { building, keyword };
      }
    }
  }
  return null;
}

// Checked in this order because phrasing can override what would otherwise
// look like a building-name match — "take me to the cafeteria" names a
// building, but the verb makes it a directions request, not a "where is"
// lookup.
const DIRECTIONS_PHRASES = ["take me to", "directions to", "navigate to", "how do i get to"];
const QUEST_PHRASES = ["quest", "quests", "orientation"];
const SERVICE_PHRASES = ["where can i", "help with", "i need help", "get a", "get my"];
const BUILDING_PHRASES = ["where is", "where's", "where are"];

// A simple rule-based baseline — no LLM involved. Kept deliberately small
// and easy to reason about, so lib/ai/testIntentPipeline.ts can compare its
// accuracy against an LLM-based classifier later and get an actual answer,
// not a guess.
export function parseIntent(query: string): CampusIntent {
  const text = query.toLowerCase();

  if (DIRECTIONS_PHRASES.some((phrase) => includesPhrase(text, phrase))) {
    const match = findBuildingMatch(text);
    return { intent: "GET_DIRECTIONS", query, target: match?.building.id };
  }

  if (QUEST_PHRASES.some((phrase) => includesPhrase(text, phrase))) {
    return { intent: "START_QUEST", query };
  }

  if (SERVICE_PHRASES.some((phrase) => includesPhrase(text, phrase))) {
    const match = findBuildingMatch(text);
    return {
      intent: "SEARCH_SERVICE",
      query,
      target: match?.building.id,
      category: match?.keyword,
    };
  }

  if (BUILDING_PHRASES.some((phrase) => includesPhrase(text, phrase))) {
    const match = findBuildingMatch(text);
    if (match) {
      return { intent: "SEARCH_BUILDING", query, target: match.building.id };
    }
  }

  // No trigger phrase, but a bare building name/keyword is still worth
  // resolving (e.g. just "library") rather than giving up immediately.
  const fallbackMatch = findBuildingMatch(text);
  if (fallbackMatch) {
    return { intent: "SEARCH_BUILDING", query, target: fallbackMatch.building.id };
  }

  return { intent: "UNKNOWN", query };
}
