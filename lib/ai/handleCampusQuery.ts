"use server";

import { buildings, type Building } from "@/data/buildings";
import { searchCampus } from "@/lib/search/searchCampus";
import { queryKnowledgeBase } from "@/lib/rag/queryKnowledgeBase";
import { classifyIntent } from "./classifyIntent";
import { parseIntent } from "./parseIntent";
import { routeQuery } from "./routeQuery";
import type { CampusIntent } from "./intentTypes";
import type { RetrievedChunk } from "@/lib/rag/types";

export type CampusQuery = string | CampusIntent;

export type CampusSearchOutcome = {
  source: "campus";
  intent: CampusIntent;
  results: Building[];
  primaryResult: Building | null;
};

export type KnowledgeOutcome = {
  source: "knowledge";
  intent: CampusIntent;
  found: boolean;
  chunks: RetrievedChunk[];
};

export type CampusQueryResult = CampusSearchOutcome | KnowledgeOutcome;

function searchCampusStructured(intent: CampusIntent): CampusSearchOutcome {
  // The classifier owns the action. The keyword parser is only a local,
  // deterministic entity resolver, so an information request such as
  // "Tell me about the library" keeps ASK_INFORMATION while resolving library.
  const resolvedTarget = intent.target ?? parseIntent(intent.query).target;
  const target = resolvedTarget ? buildings.find((building) => building.id === resolvedTarget) : undefined;
  const ranked = searchCampus(intent.category ?? resolvedTarget ?? intent.query).map((result) => result.building);
  const results = target ? [target, ...ranked.filter((building) => building.id !== target.id)] : ranked;
  return { source: "campus", intent, results, primaryResult: results[0] ?? null };
}

async function searchKnowledgeBase(intent: CampusIntent): Promise<KnowledgeOutcome> {
  const { found, chunks } = await queryKnowledgeBase(intent.query);
  return { source: "knowledge", intent, found, chunks };
}

// The shared entry point for natural language, Quick Mode, and RAG. It
// resolves a location or a knowledge-base answer only; the map's
// deterministic engine builds routes.
export async function handleCampusQuery(input: CampusQuery): Promise<CampusQueryResult> {
  const intent = typeof input === "string" ? classifyIntent(input) : input;
  const route = routeQuery(intent.query, intent);
  return route === "knowledge" ? searchKnowledgeBase(intent) : searchCampusStructured(intent);
}
