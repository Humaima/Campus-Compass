export type CampusContextInput = {
  currentLocation: string;
  selectedBuilding: string | null;
  activeDestination: string | null;
  activeQuest: string | null;
  completedQuests: string[];
  // Day 12 — completed step ids for the active quest (empty/omitted if no
  // quest is active). Lets campusGuide.ts's "what should I do next"
  // handling name the actual next step, not just the quest's title.
  activeQuestStepsCompleted?: string[];
};

export function buildCampusContext(state: CampusContextInput): string {
  return `CURRENT CAMPUS STATE
Current player location: ${state.currentLocation}
Selected building: ${state.selectedBuilding ?? "None"}
Active destination: ${state.activeDestination ?? "None"}
Active quest: ${state.activeQuest ?? "None"}
Active quest progress: ${state.activeQuest ? `${state.activeQuestStepsCompleted?.length ?? 0} step(s) completed` : "N/A"}
Completed quests: ${state.completedQuests.join(", ") || "None"}`;
}
