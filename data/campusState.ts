// The conceptual source of truth for the whole app. Right now this state
// is scattered across several useState calls that don't know about each
// other:
//   - app/page.tsx:        screen, player (PlayerState), mapRequest, activeQuestId
//   - CampusMap.tsx:        selectedBuilding, activeRoute, arrivedBuilding
//   - data/player.ts:       PlayerState.completedQuests
// This file only defines the shape — it doesn't move any state yet. That's
// a deliberate, separate step: consolidating five independent useState
// calls into one is a real refactor with its own risk, not something to
// do silently while "just defining a type."
//
// Not everything belongs here, though. CampusState holds only what's
// actually shared across screens/components — state something else needs
// to read, not just where it happens to be used. Everything below stays
// local, as a `useState` inside the one component that owns it, and none
// of it belongs in this interface:
//   - Search input          → AISearchPanel.tsx's `query`
//   - Chat input             → AssistantWindow.tsx's `input`
//   - Is assistant loading   → AssistantWindow.tsx's `loading`
//   - Temporary error message → AISearchPanel.tsx's and AssistantWindow.tsx's
//                                own `error` (each owns its own — a search
//                                error and a chat error are unrelated, so
//                                there's no shared field to merge them into)
//   - Building popup animation → no such state exists yet; if one gets
//                                built, it lives in BuildingInfo.tsx, not here
//   - Mobile button pressed state → MobileControls.tsx doesn't even hold
//                                this as state today — it's CSS's `active:`
//                                pseudo-class, which is the more local than
//                                local answer: not worth a re-render at all
// The test isn't "is this UI state" vs "is this data" — activeRoute is UI
// state too, but the map, the route overlay, and a future AI response all
// need to read it. A loading spinner or an input's draft text, by
// contrast, has exactly one reader: the component rendering it.
export interface CampusState {
  // player.x/y/currentLocation mirror data/player.ts's PlayerState, minus
  // completedQuests — that's promoted to a top-level field below, since
  // quest progress isn't really a property of the player's position.
  player: {
    x: number;
    y: number;
    currentLocation: string;
  };

  // A building id, not the full Building object CampusMap.tsx's
  // `selectedBuilding` currently stores — keeps this state serializable
  // and consistent with activeDestination/activeQuest below, which are
  // also ids, not the records they point to.
  selectedBuilding: string | null;

  // The building ids making up the current route, e.g. from findRoute().
  // Note: CampusMap.tsx's actual activeRoute today also tracks a
  // `progress` index into this path (how far the player has walked it) —
  // deliberately left out here since this step only defines the shape the
  // tutorial asked for; whether progress becomes its own field or gets
  // derived from player.currentLocation is a decision for the step that
  // actually migrates CampusMap's state into this shape.
  activeRoute: string[];

  // The final building id activeRoute is headed to — today this is
  // implicit (the last entry of CampusMap's route path, or
  // `arrivedBuilding.id` once reached); this makes it an explicit,
  // queryable field instead.
  activeDestination: string | null;

  // The quest id currently highlighted, mirroring app/page.tsx's
  // activeQuestId.
  activeQuest: string | null;

  // Mirrors PlayerState.completedQuests today; promoted out of `player`
  // since quest state and player position are conceptually independent.
  completedQuests: string[];

  // Day 12 — unlocked data/achievements.ts ids. Distinct from
  // completedQuests: some achievements are quest-reward badges (one per
  // quest, via that quest's `achievementId`), others unlock from general
  // play (exploring, asking the guide) with no quest behind them at all.
  achievements: string[];

  // Not named in Step 2's global list, but it qualifies by the same test:
  // every screen component and the bottom nav all need to read (or set)
  // which screen is active, exactly the "more than one reader" bar the
  // rest of this interface is held to — and app/page.tsx already lifts it
  // above every screen today, which is what "global" means in practice.
  // Mirrors app/page.tsx's local `Screen` union exactly. Duplicated here
  // rather than imported, since page.tsx isn't being changed by this step
  // — once state actually migrates here, one of the two should re-export
  // the other instead of maintaining the same five strings twice.
  currentScreen:
    | "home"
    | "map"
    | "guide"
    | "quests"
    | "search";
}
