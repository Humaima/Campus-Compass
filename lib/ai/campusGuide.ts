"use server";

import { buildings, type Building } from "@/data/buildings";
import { quests } from "@/data/quests";
import { queryKnowledgeBase } from "@/lib/rag/queryKnowledgeBase";
import { formatContext } from "@/lib/rag/formatContext";
import { getTodayHours, isOpenNow } from "@/lib/campus/openingHours";
import { getConfidenceTier, type ConfidenceTier } from "@/lib/rag/confidenceThreshold";
import { classifyIntent } from "./classifyIntent";
import { parseIntent } from "./parseIntent";
import { generateCampusAnswer } from "./generateCampusAnswer";
import { trimHistory } from "./conversationTypes";
import type { ChatMessage } from "./conversationTypes";
import type { CampusIntent } from "./intentTypes";
import type { CampusGuideResponse } from "./responseTypes";
import type { RetrievedChunk } from "@/lib/rag/types";
import { buildCampusContext, type CampusContextInput } from "./buildCampusContext";

// Step 22 — never expose a raw query, LLM error, or RAG failure to the
// student.
const EMPTY_QUERY_RESPONSE: CampusGuideResponse = {
  answer: "Ask me about buildings, services, registration, orientation, or navigation!",
  sources: [],
  action: { type: "NONE" },
};

const ERROR_RESPONSE: CampusGuideResponse = {
  answer:
    "I couldn't process that request right now. Try asking about a campus building, service, or university procedure.",
  sources: [],
  action: { type: "NONE" },
};

// Step 19 — never invent an answer when retrieval found nothing.
const NOT_FOUND_RESPONSE: CampusGuideResponse = {
  answer: `I couldn't find that information in the Arcadia University knowledge base.

I can help with:
• Campus locations
• Student services
• Registration
• Library
• Orientation
• Campus facilities`,
  sources: [],
  action: { type: "NONE" },
};

// Step 12 — "is it open now?" / "what are its hours?". Recognizing this
// shape of question and resolving "it" both happen deterministically
// (below), not via an LLM round-trip: for a fixed, small set of known
// buildings, a keyword/history scan is exactly as reliable as an LLM call
// here, without the latency or cost. The LLM is reserved for genuinely
// open-ended language understanding elsewhere in this pipeline.
const HOURS_PATTERN = /\b(hours?|open now|is it open|what time)\b/i;
const ANAPHORA_PATTERN = /\b(it|its|it's|there)\b/i;

// Uses parseIntent's strict, whole-word building matcher — not
// searchCampus, whose substring scoring gives every building a nonzero
// score from short filler words ("a", "i") and would silently pick
// whichever building happens to sort first among noise.
function findMostRecentBuildingMention(history: ChatMessage[]): string | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const match = parseIntent(history[i].content).target;
    if (match) return match;
  }
  return undefined;
}

// Step 9's routing needs a target (which building?), not just an intent
// type. The classifier resolves one directly for some phrasings; the
// keyword/synonym matcher (parseIntent.ts, already used the same way by
// handleCampusQuery.ts) catches more; a follow-up ("its hours") falls back
// to whatever building was most recently mentioned in the conversation.
function resolveTarget(intent: CampusIntent, query: string, history: ChatMessage[]): string | undefined {
  if (intent.target) return intent.target;

  const parsed = parseIntent(query).target;
  if (parsed) return parsed;

  if (ANAPHORA_PATTERN.test(query)) return findMostRecentBuildingMention(history);

  return undefined;
}

function answerHoursQuestion(buildingId: string): CampusGuideResponse {
  const building = buildings.find((b) => b.id === buildingId)!;
  const hours = getTodayHours(building.openingHours);

  const answer = !hours
    ? `${building.name} doesn't have listed hours for today.`
    : isOpenNow(hours)
      ? `Yes, ${building.name} is open right now — today's hours are ${hours}.`
      : `${building.name} is closed right now — today's hours are ${hours}.`;

  return { answer, sources: [], action: { type: "SHOW_BUILDING", target: building.id }, confidence: 1 };
}

// Step 8/9 — SEARCH_BUILDING and GET_DIRECTIONS are fully answerable from
// data/buildings.ts. No RAG, no LLM call: asking a model to "infer" a
// location we already have on file would only add latency, cost, and a
// hallucination risk for zero benefit.
function answerBuildingLookup(target?: string): CampusGuideResponse {
  const building = target ? buildings.find((b) => b.id === target) : undefined;
  if (!building) {
    return {
      answer: "I couldn't match that to a specific campus building. Try naming a building or service.",
      sources: [],
      action: { type: "NONE" },
    };
  }

  return {
    answer: `Here's ${building.name}. ${building.description}`,
    sources: [],
    action: { type: "SHOW_BUILDING", target: building.id },
    confidence: 1,
  };
}

// Step 13 — the AI never computes a route. It only names the destination;
// findRoute() runs client-side once the UI receives this action.
function answerDirections(target?: string): CampusGuideResponse {
  const building = target ? buildings.find((b) => b.id === target) : undefined;
  if (!building) {
    return {
      answer: "I couldn't figure out which building you want directions to. Try naming one.",
      sources: [],
      action: { type: "NONE" },
    };
  }

  return {
    answer: `I'll help you get to ${building.name}.`,
    sources: [],
    action: { type: "GET_DIRECTIONS", target: building.id },
    confidence: 1,
  };
}

// Step 15 — deterministic quest lookup, no LLM. Only ever proposes a real
// quest id from data/quests.ts; there's no single catch-all "orientation"
// quest in this project's data, so a request that doesn't match one of the
// real per-orientation-theme quests falls through to NONE rather than
// inventing one. Day 12 — a quest no longer has one fixed target building,
// so `target` now matches against any of the quest's "visit"/"depart"
// steps, not a single field.
function answerStartQuest(query: string, target?: string): CampusGuideResponse {
  const lowerQuery = query.toLowerCase();
  const quest =
    (target && quests.find((q) => q.steps.some((step) => step.targetBuildingId === target))) ??
    quests.find((q) => lowerQuery.includes(q.title.toLowerCase()));

  if (!quest) {
    return {
      answer: "I couldn't find a matching quest — check the Quests tab to see what's available.",
      sources: [],
      action: { type: "NONE" },
    };
  }

  return {
    answer: `Let's start "${quest.title}" — ${quest.description}`,
    sources: [],
    action: { type: "START_QUEST", target: quest.id },
  };
}

// Step 9 — SEARCH_SERVICE combines structured facts with RAG, so the LLM
// answers from the building's real services/hours plus whatever the
// knowledge base adds, instead of guessing at either.
function buildStructuredContext(building?: Building): string {
  if (!building) return "";
  return `STRUCTURED CAMPUS DATA
Name: ${building.name}
Type: ${building.type}
Description: ${building.description}
Services: ${building.services.join(", ")}
Today's hours: ${getTodayHours(building.openingHours) ?? "not listed"}`;
}

// Step 20 — the LLM interprets, this verifies. Two checks: every cited
// source must trace back to a chunk the model actually received (not one
// it's recalling or inventing), and any proposed action.target must be a
// real building/quest id — never trusted blindly from model output, the
// same way handleCampusQuery.ts never trusts an LLM-invented building id.
function validateResponse(response: CampusGuideResponse, chunks: RetrievedChunk[]): CampusGuideResponse {
  const knownSources = new Set(chunks.map((chunk) => chunk.metadata.source));
  const sources = response.sources.filter((source) => knownSources.has(source.source));

  if (!response.action || response.action.type === "NONE") {
    return { ...response, sources };
  }

  const { type, target } = response.action;
  const targetIsValid =
    type === "START_QUEST" ? quests.some((q) => q.id === target) : buildings.some((b) => b.id === target);

  return { ...response, sources, action: targetIsValid ? response.action : { type: "NONE" } };
}

// Step 11.4 — confidence-aware behavior. `confidence` is always the
// deterministic score this function computed (retrieval's top-chunk score,
// or 1 for a purely structured-data answer) — never the LLM's own
// self-reported number, the same "don't trust the model's account of its
// own certainty" reasoning validateResponse already applies to sources and
// action targets. `tier` steers how the model phrases the answer (see
// generateCampusAnswer's CONFIDENCE_GUIDANCE); "none" never reaches here —
// that's the NOT_FOUND_RESPONSE fast path above.
// A purely structured-data answer (building resolved, RAG contributed
// nothing) is grounded fact, not a similarity-scored guess — it gets the
// same "high" tier deterministic lookups elsewhere (answerHoursQuestion)
// already claim. Otherwise the tier follows the top chunk's retrieval
// score, the same number queryKnowledgeBase used to decide `found`.
function resolveConfidence(ragContext: string, topScore: number | undefined) {
  if (!ragContext) return { tier: "high" as ConfidenceTier, confidence: 1 };
  const tier = getConfidenceTier(topScore);
  return { tier, confidence: topScore ?? 0 };
}

async function generateFromContext(
  question: string,
  history: ChatMessage[],
  context: string,
  chunks: RetrievedChunk[],
  tier: ConfidenceTier,
  confidence: number
): Promise<CampusGuideResponse> {
  const response = await generateCampusAnswer({
    question,
    context,
    history,
    confidenceTier: tier === "none" ? undefined : tier,
  });
  return { ...validateResponse(response, chunks), confidence };
}

// The central Day 7 orchestration function. Routes by intent (Step 9)
// rather than sending every request through the same expensive
// RAG+LLM pipeline (Step 8): structured-data intents are answered directly
// from data/buildings.ts and data/quests.ts, and only SEARCH_SERVICE /
// ASK_INFORMATION ever reach the knowledge base or the model.
export async function campusGuide(query: string, history: ChatMessage[] = [], campusState?: CampusContextInput): Promise<CampusGuideResponse> {
  try {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return EMPTY_QUERY_RESPONSE;

    const recentHistory = trimHistory(history);
    const appContext = campusState ? buildCampusContext(campusState) : "";
    if (/what should i do next/i.test(trimmedQuery) && campusState?.activeQuest) {
      const quest = quests.find((item) => item.id === campusState.activeQuest);
      const doneStepIds = new Set(campusState.activeQuestStepsCompleted ?? []);
      const nextStep = quest?.steps.find((step) => !doneStepIds.has(step.id));

      if (quest && nextStep) {
        if (nextStep.kind === "ask-guide") {
          // They're already doing it — asking "what's next" is itself a
          // question to the guide, so this step is about to complete on
          // its own via recordGuideQuestion() (AssistantWindow.tsx).
          return {
            answer: `Your current orientation task is ${quest.title}. Next up: ${nextStep.label} — you're already doing that right now!`,
            sources: [], action: { type: "NONE" }, confidence: 1,
          };
        }

        const targetBuilding = nextStep.targetBuildingId ? buildings.find((b) => b.id === nextStep.targetBuildingId) : undefined;
        return {
          answer: nextStep.kind === "depart"
            ? `Your current orientation task is ${quest.title}. Next up: ${nextStep.label} — head out from the Main Gate to get started.`
            : `Your current orientation task is ${quest.title}. Next up: ${nextStep.label}${targetBuilding ? ` at ${targetBuilding.name}` : ""}.`,
          sources: [],
          action: nextStep.kind === "visit" && targetBuilding ? { type: "GET_DIRECTIONS", target: targetBuilding.id } : { type: "NONE" },
          confidence: 1,
        };
      }
    }
    const intent = classifyIntent(trimmedQuery);
    const target = resolveTarget(intent, trimmedQuery, recentHistory);

    if (target && HOURS_PATTERN.test(trimmedQuery)) {
      return answerHoursQuestion(target);
    }

    switch (intent.intent) {
      case "SEARCH_BUILDING":
        return answerBuildingLookup(target);

      case "GET_DIRECTIONS":
        return answerDirections(target);

      case "START_QUEST":
        return answerStartQuest(trimmedQuery, target);

      case "SEARCH_SERVICE": {
        // Only `target` counts as a confidently-resolved building — it
        // only ever comes from strict phrase matching (resolveTarget
        // above). Falling back to an unfiltered searchCampus() lookup here
        // previously let irrelevant queries ("driver's license") pick up
        // an unrelated building's data purely from short-word noise,
        // bypassing the empty-context fast path below and wasting an LLM
        // call on a question the knowledge base has nothing about.
        const building = target ? buildings.find((b) => b.id === target) : undefined;
        const structuredContext = buildStructuredContext(building);
        const knowledge = await queryKnowledgeBase(trimmedQuery);
        const ragContext = knowledge.found ? formatContext(knowledge.chunks) : "";

        if (!structuredContext && !ragContext) return NOT_FOUND_RESPONSE;

        const context = [appContext, structuredContext, ragContext].filter(Boolean).join("\n\n---\n\n");
        const { tier, confidence } = resolveConfidence(ragContext, knowledge.chunks[0]?.score);
        // Must be awaited here, not just returned: a bare `return promise`
        // inside a try block resolves the async function with that promise
        // directly, without routing its eventual rejection back through
        // this try/catch — the exact case Step 22 exists for (an LLM call
        // failing) would then propagate as a raw uncaught error instead of
        // ERROR_RESPONSE.
        return await generateFromContext(trimmedQuery, recentHistory, context, knowledge.found ? knowledge.chunks : [], tier, confidence);
      }

      // ASK_INFORMATION, FIND_CATEGORY, UNKNOWN: same structured-data +
      // RAG combination as SEARCH_SERVICE — `target` may already name a
      // real building (e.g. "tell me about the Applied Sciences School"),
      // and that structured data shouldn't be skipped just because RAG
      // has nothing on it.
      default: {
        const building = target ? buildings.find((b) => b.id === target) : undefined;
        const structuredContext = buildStructuredContext(building);
        const knowledge = await queryKnowledgeBase(trimmedQuery);
        const ragContext = knowledge.found ? formatContext(knowledge.chunks) : "";

        if (!structuredContext && !ragContext) return NOT_FOUND_RESPONSE;

        const context = [appContext, structuredContext, ragContext].filter(Boolean).join("\n\n---\n\n");
        const { tier, confidence } = resolveConfidence(ragContext, knowledge.chunks[0]?.score);
        return await generateFromContext(trimmedQuery, recentHistory, context, knowledge.found ? knowledge.chunks : [], tier, confidence);
      }
    }
  } catch {
    return ERROR_RESPONSE;
  }
}
