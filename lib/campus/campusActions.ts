import { buildings, type Building } from "@/data/buildings";
import { quests, type Quest } from "@/data/quests";
import { findRoute } from "@/lib/routing/findRoute";
import { getQuestsForBuilding } from "@/lib/quests/getQuestsForBuilding";

// The single place every consumer of shared campus state — the map
// (click, E-press, walking a route), the AI Guide, search results —
// resolves a building or quest, or computes a route. Pure data in, data
// out: no React, no state setters, so "selected the library" always means
// the same lookup no matter who asked, and these are trivially usable
// from campusGuide.ts (server-side) exactly as easily as from a client
// component. Applying the result to actual state is CampusProvider's job
// (components/campus/CampusProvider.tsx) — these functions only compute
// what should happen.

export function selectBuilding(buildingId: string): Building | null {
  return buildings.find((b) => b.id === buildingId) ?? null;
}

export function startNavigation(
  destinationId: string,
  currentLocation: string
): { destinationId: string; route: string[] } {
  return { destinationId, route: findRoute(currentLocation, destinationId) };
}

export function clearNavigation(): { activeRoute: string[]; activeDestination: null } {
  return { activeRoute: [], activeDestination: null };
}

export function startQuest(questId: string): Quest | null {
  return quests.find((q) => q.id === questId) ?? null;
}

// Quests completed by directly finishing this one (given its own id) —
// distinct from completeDestination below, which discovers quests
// indirectly by which building was reached. Nothing in this project
// currently completes a quest except by visiting its target building, but
// the two are conceptually different triggers and shouldn't share a name.
export function completeQuest(questId: string): Quest | null {
  return quests.find((q) => q.id === questId) ?? null;
}

// Quests that arriving at this building completes — the map (click,
// E-press, walking a route) and the AI Guide's SHOW_BUILDING action all
// funnel through this, so "visited the library" completes the same
// quests regardless of how the player got there.
export function completeDestination(buildingId: string): Quest[] {
  return getQuestsForBuilding(buildingId);
}
