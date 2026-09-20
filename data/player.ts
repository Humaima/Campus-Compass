import { buildings } from "./buildings";

export type PlayerState = {
  x: number;
  y: number;
  currentLocation: string;
  completedQuests: string[];
  direction: "up" | "down" | "left" | "right";
  state: "idle" | "walking";
};

// Player position has two parts:
//
//   position → x / y            (exact spot on the map, for rendering/movement)
//   location → currentLocation  (which building that spot belongs to, a building id)
//
// currentLocation starts at the gate; x/y are read from that building's own
// coordinates in data/buildings.ts, so the two can never drift out of sync.
// Later, movement can update x/y as the player walks, and set currentLocation
// once they arrive at a new building.
const START_LOCATION = "gate";
const startBuilding = buildings.find((b) => b.id === START_LOCATION)!;

export const initialPlayer: PlayerState = {
  x: startBuilding.entrance.x,
  y: startBuilding.entrance.y,
  currentLocation: START_LOCATION,
  completedQuests: [],
  direction: "up",
  state: "idle",
};
