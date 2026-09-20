import type { PlayerState } from "@/data/player";

export type SavedCampusState = Pick<PlayerState, "x" | "y" | "currentLocation" | "completedQuests"> & {
  achievements: string[];
  // Day 12 — per-quest completed step ids (keyed by quest id), and every
  // building ever visited (for the "visit five locations" achievement).
  // Both default to empty when absent, so state saved before Day 12 still
  // loads cleanly.
  questProgress: Record<string, string[]>;
  visitedBuildings: string[];
};

const STORAGE_KEY = "campus-compass-state";

export function saveCampusState(state: SavedCampusState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadCampusState(): SavedCampusState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as SavedCampusState : null;
  } catch {
    return null;
  }
}

export function resetCampusState() {
  localStorage.removeItem(STORAGE_KEY);
}
