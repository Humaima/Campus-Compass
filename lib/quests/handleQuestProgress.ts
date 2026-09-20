import { quests, type Quest } from "@/data/quests";
import { stepSatisfiedBy, type QuestEvent } from "./questEvents";

export type QuestStepUpdate = {
  quest: Quest;
  newlyCompletedStepIds: string[];
  allStepsComplete: boolean;
};

// Quest progress is intentionally derived through campus events (a
// building visit, asking the guide a question), not tracked as a separate
// counter — only the student's currently active quest may advance, and
// only steps it hasn't already completed.
export function handleQuestProgress(
  event: QuestEvent,
  activeQuestId: string | null,
  completedQuestIds: string[],
  stepProgress: Record<string, string[]>
): QuestStepUpdate | null {
  if (!activeQuestId || completedQuestIds.includes(activeQuestId)) return null;

  const quest = quests.find((q) => q.id === activeQuestId);
  if (!quest) return null;

  const alreadyDone = new Set(stepProgress[activeQuestId] ?? []);
  const newlyCompletedStepIds = quest.steps
    .filter((step) => !alreadyDone.has(step.id) && stepSatisfiedBy(step, event))
    .map((step) => step.id);

  if (newlyCompletedStepIds.length === 0) return null;

  const allStepsComplete = quest.steps.every(
    (step) => alreadyDone.has(step.id) || newlyCompletedStepIds.includes(step.id)
  );

  return { quest, newlyCompletedStepIds, allStepsComplete };
}
