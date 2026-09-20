import { quests, type Quest } from "@/data/quests";

// Replaces the old single-target checkQuestCompletion.ts now that a quest
// can reference a building through any of several steps, not just one
// fixed targetBuildingId. Used for "is this arrival relevant to any
// quest" displays (DestinationReached.tsx) — actual step completion is
// lib/quests/handleQuestProgress.ts's job, not this lookup's.
export function getQuestsForBuilding(buildingId: string): Quest[] {
  return quests.filter((quest) => quest.steps.some((step) => step.targetBuildingId === buildingId));
}
