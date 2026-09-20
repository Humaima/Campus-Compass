export type QuestStepKind = "visit" | "depart" | "ask-guide";

export type QuestStep = {
  id: string;
  label: string;
  kind: QuestStepKind;
  // Required for "visit" (arrive here) and "depart" (leave here) steps —
  // omitted for "ask-guide", which isn't tied to any location.
  targetBuildingId?: string;
};

export type Quest = {
  id: string;
  icon: string;
  title: string;
  description: string;
  steps: QuestStep[];
  // The data/achievements.ts entry this quest's badge unlocks on full
  // completion — one specific achievement per quest, not a free-text
  // reward label (Day 12).
  achievementId: string;
};

// Day 12 — real orientation checklists, not five identical "visit X"
// one-liners. There's no literal "Quad" in this project's building data
// (data/buildings.ts), so Campus Explorer's big-open-landmark beat is
// played by the Sports Center instead — the closest thing on this campus
// to a place students naturally end up wandering to. A few steps are
// deliberately shared across quests (Student Services appears in both
// Academic Survival and First Week; "find your department" appears in
// both Academic Survival and First Week too) — that's realistic: real
// orientation checklists send you back to the same office for different
// reasons, and each quest tracks its own progress independently, so
// finishing one doesn't silently complete the other's matching step.
export const quests: Quest[] = [
  {
    id: "campus-explorer",
    icon: "🎒",
    title: "Campus Explorer",
    description: "Explore the Arcadia campus.",
    steps: [
      { id: "leave-gate", label: "Leave the Main Gate", kind: "depart", targetBuildingId: "gate" },
      { id: "visit-sports", label: "Visit the Sports Center", kind: "visit", targetBuildingId: "sports" },
      { id: "find-services", label: "Find the Student Center", kind: "visit", targetBuildingId: "services" },
      { id: "visit-library", label: "Visit the Library", kind: "visit", targetBuildingId: "library" },
    ],
    achievementId: "quest-campus-explorer",
  },

  {
    id: "academic-survival",
    icon: "📚",
    title: "Academic Survival",
    description: "Learn where students go for academic support.",
    steps: [
      { id: "find-services", label: "Find Student Services", kind: "visit", targetBuildingId: "services" },
      { id: "find-department", label: "Locate your department", kind: "visit", targetBuildingId: "cs" },
      { id: "find-library", label: "Find the Library", kind: "visit", targetBuildingId: "library" },
      { id: "ask-guide", label: "Ask the Campus Guide a question", kind: "ask-guide" },
    ],
    achievementId: "quest-ready-for-class",
  },

  {
    id: "first-week",
    icon: "🎓",
    title: "First Week",
    description: "Complete essential first-week activities.",
    steps: [
      { id: "find-registration", label: "Find registration information", kind: "visit", targetBuildingId: "admin" },
      { id: "find-cafeteria", label: "Locate the cafeteria", kind: "visit", targetBuildingId: "cafeteria" },
      { id: "find-department", label: "Find your department", kind: "visit", targetBuildingId: "cs" },
      { id: "visit-services", label: "Visit Student Services", kind: "visit", targetBuildingId: "services" },
    ],
    achievementId: "quest-first-week",
  },
];
