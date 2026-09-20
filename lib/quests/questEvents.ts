import type { QuestStep } from "@/data/quests";

export type QuestEvent = { kind: "visit"; buildingId: string } | { kind: "ask-guide" };

// Whether a single quest step counts as done given one campus event. A
// "depart" step (e.g. "Leave the Main Gate") is satisfied by visiting any
// OTHER building — there's no separate "player walked away" event, so
// arriving anywhere else counts as having left.
export function stepSatisfiedBy(step: QuestStep, event: QuestEvent): boolean {
  if (step.kind === "ask-guide") return event.kind === "ask-guide";
  if (event.kind !== "visit") return false;
  if (step.kind === "visit") return step.targetBuildingId === event.buildingId;
  return step.targetBuildingId !== event.buildingId; // "depart"
}
