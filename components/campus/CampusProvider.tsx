"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { initialPlayer, type PlayerState } from "@/data/player";
import type { CampusState } from "@/data/campusState";
import * as campusActions from "@/lib/campus/campusActions";
import { handleQuestProgress } from "@/lib/quests/handleQuestProgress";
import type { QuestEvent } from "@/lib/quests/questEvents";
import { loadCampusState, resetCampusState, saveCampusState } from "@/lib/campus/persistence";
import { quests } from "@/data/quests";
import { achievements as achievementCatalog, type Achievement } from "@/data/achievements";
import { executeCampusAction, type CampusAction } from "@/lib/campus/executeCampusAction";

// player is typed as the full PlayerState (x/y/currentLocation *and*
// completedQuests), not CampusState["player"]'s narrower shape — every
// existing consumer (CampusMap.tsx, data/player.ts itself) already treats
// player and its quest progress as one object, and splitting them here
// would mean reconstructing a full PlayerState on every read for no real
// benefit. completedQuests is still exposed at the top level too, matching
// CampusState, but as a read/write-through onto player.completedQuests —
// not independent state with its own source of truth to drift out of sync.
export type CampusContextValue = {
  player: PlayerState;
  setPlayer: Dispatch<SetStateAction<PlayerState>>;

  completedQuests: string[];
  // Day 12 — per-quest completed step ids, keyed by quest id. A quest
  // moves to `completedQuests` above only once every one of its steps
  // shows up here.
  questProgress: Record<string, string[]>;

  selectedBuilding: CampusState["selectedBuilding"];
  // Only for dismissal (Escape, the popup's ✕ button) — setting it to an
  // actual building should go through selectBuilding() below instead, so
  // that path always also runs quest-completion / route-arrival.
  closeSelectedBuilding: () => void;
  activeRoute: CampusState["activeRoute"];
  activeDestination: CampusState["activeDestination"];
  activeQuest: CampusState["activeQuest"];
  achievements: CampusState["achievements"];

  currentScreen: CampusState["currentScreen"];
  setCurrentScreen: Dispatch<SetStateAction<CampusState["currentScreen"]>>;

  // Step 5/6 — the same actions every caller uses, so a map click and an
  // AI Guide response can never diverge in what they actually do to
  // shared state. Each wraps a pure lib/campus/campusActions.ts function
  // (the decision of *what* should happen) with the setState calls that
  // *apply* it — components never call setSelectedBuilding etc. directly.
  selectBuilding: (buildingId: string) => void;
  startNavigation: (destinationId: string) => void;
  clearNavigation: () => void;
  startQuest: (questId: string) => void;
  completeDestination: (buildingId: string) => void;
  setAchievements: Dispatch<SetStateAction<CampusState["achievements"]>>;
  resetProgress: () => void;
  notification: string | null;
  dismissNotification: () => void;
  // Day 12 — the achievement-unlock toast queue (components/ui/AchievementToast.tsx).
  // A queue, not a single value, because more than one achievement can
  // unlock from the same event (e.g. finishing a quest's last step also
  // completes the quest, which can unlock its reward badge and
  // "orientation-complete" in the same beat) — shown one at a time rather
  // than dropped or merged.
  achievementToast: Achievement | null;
  dismissAchievementToast: () => void;
  guideQuestion: string | null;
  clearGuideQuestion: () => void;
  askAboutBuilding: (buildingId: string) => void;
  executeAction: (action: CampusAction) => boolean;
  // Day 12 — called once per question actually sent to the Campus Guide
  // (components/assistant/AssistantWindow.tsx), so "ask the guide a
  // question" quest steps and the Knowledge Seeker achievement advance the
  // same way regardless of what was asked or how it was answered.
  recordGuideQuestion: () => void;
};

const CampusContext = createContext<CampusContextValue | null>(null);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerState>(initialPlayer);
  const [selectedBuilding, setSelectedBuilding] = useState<CampusState["selectedBuilding"]>(null);
  const [activeRoute, setActiveRoute] = useState<CampusState["activeRoute"]>([]);
  const [activeDestination, setActiveDestination] = useState<CampusState["activeDestination"]>(null);
  const [activeQuest, setActiveQuest] = useState<CampusState["activeQuest"]>(null);
  const [achievements, setAchievements] = useState<CampusState["achievements"]>([]);
  const [questProgress, setQuestProgress] = useState<Record<string, string[]>>({});
  const [visitedBuildings, setVisitedBuildings] = useState<string[]>([]);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [currentScreen, setCurrentScreen] = useState<CampusState["currentScreen"]>("home");
  const [notification, setNotification] = useState<string | null>(null);
  const [guideQuestion, setGuideQuestion] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadCampusState();
    if (saved) {
      // Pre-existing bug fix: saved state only ever persisted x/y/
      // currentLocation/completedQuests (lib/campus/persistence.ts), never
      // direction/state — replacing the whole player object with just
      // those four fields silently dropped the other two to `undefined`
      // on every reload instead of falling back to initialPlayer's.
      setPlayer({ ...initialPlayer, x: saved.x, y: saved.y, currentLocation: saved.currentLocation, completedQuests: saved.completedQuests });
      setAchievements(saved.achievements);
      setQuestProgress(saved.questProgress ?? {});
      setVisitedBuildings(saved.visitedBuildings ?? []);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCampusState({ ...player, achievements, questProgress, visitedBuildings });
  }, [hydrated, player, achievements, questProgress, visitedBuildings]);

  function mergeCompletedQuests(newlyCompletedIds: string[]) {
    if (newlyCompletedIds.length === 0) return;
    setPlayer((previous) => ({
      ...previous,
      completedQuests: Array.from(new Set([...previous.completedQuests, ...newlyCompletedIds])),
    }));
  }

  // Unlocks every id in `ids` that isn't already owned — updates the
  // persisted unlocked-ids list and queues a celebratory toast per
  // *newly* unlocked achievement. Checked against the `achievements`
  // closure value, which is safe here the same way the rest of this file
  // already trusts closure state within one synchronous event handler
  // (see mergeCompletedQuests above).
  function unlockAchievements(ids: Set<string>) {
    const newIds = [...ids].filter((id) => !achievements.includes(id));
    if (newIds.length === 0) return;
    setAchievements((previous) => [...previous, ...newIds]);
    setAchievementQueue((previous) => [
      ...previous,
      ...newIds.map((id) => achievementCatalog.find((a) => a.id === id)).filter((a): a is Achievement => Boolean(a)),
    ]);
  }

  // Shared by every campus event that can move the active quest along — a
  // building arrival or a question asked of the Campus Guide. Mutates
  // `unlocked` in place so the caller can fold quest-completion
  // achievements (first-quest, orientation-complete, the quest's own
  // reward badge) in with whatever else it's already unlocking from the
  // same event, and flush them all through one unlockAchievements() call.
  function advanceActiveQuest(event: QuestEvent, unlocked: Set<string>) {
    const update = handleQuestProgress(event, activeQuest, player.completedQuests, questProgress);
    if (!update) return;

    setQuestProgress((previous) => ({
      ...previous,
      [update.quest.id]: [...(previous[update.quest.id] ?? []), ...update.newlyCompletedStepIds],
    }));

    if (!update.allStepsComplete) return;

    const completedIds = new Set([...player.completedQuests, update.quest.id]);
    mergeCompletedQuests([update.quest.id]);
    if (player.completedQuests.length === 0) unlocked.add("first-quest");
    unlocked.add(update.quest.achievementId);
    if (quests.every((quest) => completedIds.has(quest.id))) unlocked.add("orientation-complete");
    setNotification(`🎉 QUEST COMPLETE: ${update.quest.title}`);
    setActiveQuest(null);
  }

  // Shared by every path that counts as "arriving" at a building —
  // clicking it, pressing E next to it, or the AI Guide selecting it.
  // Quest completion and route-progress both happen the same way
  // regardless of which of those triggered it. Progress is derived from
  // player.currentLocation's position in activeRoute rather than tracked
  // as a separate counter, so the two can't drift out of sync with each
  // other — there's exactly one source of truth for "how far along."
  function applyArrival(buildingId: string) {
    const unlocked = new Set<string>();

    // First Steps / Campus Explorer read the *pre-update* visitedBuildings
    // snapshot — "does this arrival make five distinct locations" only
    // makes sense measured against what was true before this one landed.
    if (buildingId !== "gate" && !visitedBuildings.some((id) => id !== "gate")) unlocked.add("first-step");
    if (!visitedBuildings.includes(buildingId) && visitedBuildings.length + 1 >= 5) unlocked.add("campus-explorer");
    if (activeDestination === buildingId) unlocked.add("navigator");

    setVisitedBuildings((previous) => (previous.includes(buildingId) ? previous : [...previous, buildingId]));

    advanceActiveQuest({ kind: "visit", buildingId }, unlocked);
    unlockAchievements(unlocked);

    if (activeRoute.length === 0) return;
    const currentIndex = activeRoute.indexOf(player.currentLocation);
    const targetIndex = activeRoute.indexOf(buildingId);
    const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
    if (targetIndex !== -1 && targetIndex >= safeCurrentIndex) {
      setPlayer((previous) =>
        previous.currentLocation === buildingId
          ? previous
          : { ...previous, currentLocation: buildingId }
      );
    }
  }

  function recordGuideQuestion() {
    const unlocked = new Set<string>(["knowledge-seeker"]);
    advanceActiveQuest({ kind: "ask-guide" }, unlocked);
    unlockAchievements(unlocked);
  }

  function selectBuildingAction(buildingId: string) {
    const building = campusActions.selectBuilding(buildingId);
    if (!building) return;
    setSelectedBuilding((previous) => previous === building.id ? previous : building.id);
    applyArrival(building.id);
  }

  function startNavigationAction(destinationId: string) {
    const destination = campusActions.selectBuilding(destinationId);
    if (!destination) {
      setNotification("🤖 I couldn't identify that campus location.");
      return;
    }
    const { route } = campusActions.startNavigation(destinationId, player.currentLocation);
    if (route.length === 0) {
      setNotification("🧭 No route is available to that destination.");
      return;
    }
    setActiveDestination(destinationId);
    setActiveRoute(route);
    setNotification(`🧭 Navigation started: ${destination.name}`);
  }

  function clearNavigationAction() {
    const cleared = campusActions.clearNavigation();
    setActiveRoute(cleared.activeRoute);
    setActiveDestination(cleared.activeDestination);
  }

  function startQuestAction(questId: string) {
    const quest = campusActions.startQuest(questId);
    setActiveQuest(quest?.id ?? null);
    if (quest) setNotification(`🎒 QUEST STARTED: ${quest.title}`);
  }

  function resetProgress() {
    resetCampusState();
    setPlayer(initialPlayer);
    setAchievements([]);
    setQuestProgress({});
    setVisitedBuildings([]);
    setAchievementQueue([]);
    setActiveQuest(null);
    clearNavigationAction();
    setNotification("⚙️ Campus progress reset.");
  }

  function askAboutBuilding(buildingId: string) {
    const building = campusActions.selectBuilding(buildingId);
    if (!building) return;
    setGuideQuestion(`Tell me about the ${building.name}.`);
    setCurrentScreen("guide");
  }

  function executeAction(action: CampusAction) {
    const didExecute = executeCampusAction(action, {
      showBuilding: (buildingId) => {
        selectBuildingAction(buildingId);
        setCurrentScreen("map");
      },
      getDirections: (buildingId) => {
        selectBuildingAction(buildingId);
        startNavigationAction(buildingId);
        setCurrentScreen("map");
      },
      startQuest: (questId) => {
        startQuestAction(questId);
        setCurrentScreen("quests");
      },
    });
    if (!didExecute) setNotification("🤖 I couldn't identify that campus action.");
    return didExecute;
  }

  return (
    <CampusContext.Provider
      value={{
        player,
        setPlayer,
        completedQuests: player.completedQuests,
        questProgress,
        selectedBuilding,
        closeSelectedBuilding: () => setSelectedBuilding(null),
        activeRoute,
        activeDestination,
        activeQuest,
        achievements,
        currentScreen,
        setCurrentScreen,
        selectBuilding: selectBuildingAction,
        startNavigation: startNavigationAction,
        clearNavigation: clearNavigationAction,
        startQuest: startQuestAction,
        completeDestination: applyArrival,
        setAchievements,
        resetProgress,
        notification,
        dismissNotification: () => setNotification(null),
        achievementToast: achievementQueue[0] ?? null,
        dismissAchievementToast: () => setAchievementQueue((previous) => previous.slice(1)),
        guideQuestion,
        clearGuideQuestion: () => setGuideQuestion(null),
        askAboutBuilding,
        executeAction,
        recordGuideQuestion,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

// Throws instead of returning null — a component rendered outside
// CampusProvider should fail loudly right at the call site, not with a
// confusing "cannot read properties of null" somewhere deep in its logic.
export function useCampus(): CampusContextValue {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error("useCampus must be used within a CampusProvider");
  }
  return context;
}
