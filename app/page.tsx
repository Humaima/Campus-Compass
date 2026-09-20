"use client";

import { useEffect, useState } from "react";
import CampusMap from "@/components/campus/CampusMap";
import HomeScreen from "@/components/home/HomeScreen";
import HowToPlay from "@/components/home/HowToPlay";
import QuestPanel from "@/components/quests/QuestPanel";
import SearchPanel from "@/components/search/SearchPanel";
import AssistantWindow from "@/components/assistant/AssistantWindow";
import { CampusProvider, useCampus } from "@/components/campus/CampusProvider";
import NotificationToast from "@/components/ui/NotificationToast";
import AchievementToast from "@/components/ui/AchievementToast";
import SettingsPanel from "@/components/ui/SettingsPanel";
import NavButton from "@/components/ui/NavButton";
import Crest from "@/components/ui/Crest";
import { buildings } from "@/data/buildings";
import { quests } from "@/data/quests";
import { useCampusClock } from "@/lib/campus/useCampusClock";
import { TIME_OF_DAY_META } from "@/lib/campus/timeOfDay";

// The default export has to stay the page's own component per Next.js
// convention, but useCampus() only works inside CampusProvider's
// descendants — a component can't consume a context it renders itself. So
// Home just mounts the provider, and everything that used to live here
// (screen/player/quest state, the actual UI) moves into CampusApp below.
export default function Home() {
  return (
    <CampusProvider>
      <CampusApp />
    </CampusProvider>
  );
}

function CampusApp() {

  const { currentScreen, setCurrentScreen, activeQuest, questProgress, completedQuests, activeDestination, activeRoute, notification, dismissNotification, achievementToast, dismissAchievementToast, resetProgress, guideQuestion: contextualGuideQuestion, clearGuideQuestion, executeAction } =
    useCampus();
  const destination = activeDestination ? buildings.find((building) => building.id === activeDestination) : null;
  const activeQuestData = activeQuest ? quests.find((quest) => quest.id === activeQuest) : null;
  const activeQuestDoneSteps = activeQuestData ? new Set(questProgress[activeQuestData.id] ?? []) : null;

  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Day 14 — Step 14.4: the HUD clock, now also naming the time of day
  // (the same clock CampusMap's lighting tint and HomeScreen's footer
  // read, via the shared hook — see lib/campus/useCampusClock.ts).
  const { time: clock, timeOfDay } = useCampusClock();
  const timeOfDayMeta = timeOfDay ? TIME_OF_DAY_META[timeOfDay] : null;

  // Step 10.8 — M/G jump straight to the map / guide screens, matching the
  // controls panel's own listing (ControlsHint.tsx). Ignored while the
  // visitor is actually typing somewhere (chat input, search box) so the
  // letters "m" and "g" still work as ordinary text there.
  useEffect(() => {
    if (currentScreen === "home") return;

    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isTyping) return;

      const key = event.key.toLowerCase();
      if (key === "m") setCurrentScreen("map");
      else if (key === "g") setCurrentScreen("guide");
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [currentScreen, setCurrentScreen]);

  // Shared by SearchPanel and AssistantWindow — both let the user act on a
  // resolved building/quest the same way, whether they found it by typing
  // a search or asking the AI guide. Both now go through the exact same
  // CampusProvider actions a direct map click or E-press uses (Step 6):
  // there's no separate "request" mechanism to keep in sync with it
  // anymore — selecting/navigating updates shared state immediately, and
  // CampusMap just reads it once the screen switches there.
  function viewBuilding(buildingId: string) {
    executeAction({ type: "SHOW_BUILDING", target: buildingId });
  }

  function getDirectionsTo(buildingId: string) {
    // Matches the popup's own "GET DIRECTIONS" button (CampusMap.tsx):
    // selecting the building (so its popup is visible) and starting
    // navigation to it always happen together.
    executeAction({ type: "GET_DIRECTIONS", target: buildingId });
  }

  function startQuestAndShow(questId: string) {
    executeAction({ type: "START_QUEST", target: questId });
  }

  if (currentScreen === "home") {
    return (
      <HomeScreen
        onStart={() => setCurrentScreen("map")}
      />
    );
  }

  return (
    <main className="min-h-screen bg-cream">

      {/* TOP HUD */}

      <header className="
        h-16
        bg-navy
        border-b-4
        border-ink
        flex
        items-center
        justify-between
        px-6
        text-parchment
      ">

        <button
          onClick={() => setCurrentScreen("home")}
          className="flex items-center gap-3 font-display text-[10px] sm:text-xs tracking-wide cursor-pointer"
        >
          <Crest size="sm" />
          ARCADIA UNIVERSITY
        </button>

        <div className="hidden sm:block text-right text-xs font-pixel text-base leading-tight">
          <div className="text-gold font-display text-[9px] tracking-wide">
            {clock ?? "--:--"} {timeOfDayMeta ? `${timeOfDayMeta.icon} ${timeOfDayMeta.label.toUpperCase()}` : ""}
          </div>
          <div className="mt-1">
            {destination ? <><strong>🧭 TO: {destination.name.toUpperCase()}</strong><br />NEXT: {buildings.find((building) => building.id === activeRoute[1])?.name ?? "Destination"}</> : <span className="opacity-70">🧭 NO ACTIVE DESTINATION</span>}
          </div>
        </div>

      </header>


      {/* SCREEN CONTENT */}
      {/* pb-20 reserves room for the fixed bottom nav (h-16) plus a little
          breathing room, so content never ends up hidden underneath it. */}
      <section className="min-h-[calc(100vh-128px)] pb-20">

        {currentScreen === "map" && <CampusMap />}

        {currentScreen === "guide" && (
          <AssistantWindow onView={viewBuilding} onDirections={getDirectionsTo} onStartQuest={startQuestAndShow} initialQuestion={contextualGuideQuestion} onInitialQuestionHandled={clearGuideQuestion} />
        )}

        {currentScreen === "quests" && (
          <QuestPanel completedQuests={completedQuests} questProgress={questProgress} activeQuestId={activeQuest} onStartQuest={startQuestAndShow} onGuideTo={getDirectionsTo} />
        )}

        {currentScreen === "search" && (
          <SearchPanel onView={viewBuilding} onDirections={getDirectionsTo} onStartQuest={startQuestAndShow} />
        )}

      </section>

      {activeQuestData && activeQuestDoneSteps && (
        <aside className="fixed left-3 top-20 z-40 max-w-56 pixel-panel-sm p-3 text-xs text-ink">
          <p className="font-display text-[9px] tracking-wide text-navy">{activeQuestData.icon} CURRENT QUEST</p>
          <p className="mt-1 font-semibold">{activeQuestData.title}</p>
          <ul className="mt-1 space-y-0.5">
            {activeQuestData.steps.map((step) => (
              <li key={step.id} className={activeQuestDoneSteps.has(step.id) ? "line-through opacity-60" : ""}>
                {activeQuestDoneSteps.has(step.id) ? "☑" : "□"} {step.label}
              </li>
            ))}
          </ul>
        </aside>
      )}
      <NotificationToast message={notification} onDismiss={dismissNotification} />
      <AchievementToast achievement={achievementToast} onDone={dismissAchievementToast} />
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onHowToPlay={() => { setShowSettings(false); setShowHowToPlay(true); }}
          onReset={resetProgress}
        />
      )}
      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}


      {/* BOTTOM HUD */}
      {/* Step 13.2 — responsive nav: NavButton stacks icon-over-label on
          small/touch screens and sits icon-beside-label from md up.
          z-50: persistent app chrome must always paint above in-page
          content — CampusMap's own elements go up to z-40
          (DestinationReached), and without an explicit z-index here the
          nav had no defined stacking priority against them, letting
          things like the player sprite (z-20) render on top of it. */}
      <nav className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        h-16
        bg-navy
        border-t-4
        border-ink
        flex
        items-center
        justify-center
        gap-1
        sm:gap-2
        p-2
      ">

        <NavButton icon="🗺" label="MAP" active={currentScreen === "map"} onClick={() => setCurrentScreen("map")} />
        <NavButton icon="🤖" label="GUIDE" active={currentScreen === "guide"} onClick={() => setCurrentScreen("guide")} />
        <NavButton icon="🎒" label="QUESTS" active={currentScreen === "quests"} onClick={() => setCurrentScreen("quests")} />
        <NavButton icon="🔎" label="SEARCH" active={currentScreen === "search"} onClick={() => setCurrentScreen("search")} />
        <NavButton icon="⚙" label="SETTINGS" active={showSettings} onClick={() => setShowSettings(true)} />

      </nav>

    </main>
  );

}
