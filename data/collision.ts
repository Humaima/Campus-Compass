import { CAMPUS_HEIGHT, CAMPUS_WIDTH } from "./campus";

export type CollisionZone = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

// x, y, width, height are percentages of the map image's box, matching the
// same footprint as each building's clickable zone — measured against the
// actual 1600x1000 Campus_Map.png (visually verified with the red rgba
// overlay trick before committing these numbers).
const collisionZonePercentages = [
  {
    id: "library",
    x: 11.9,
    y: 6,
    width: 16.9,
    height: 19,
  },

  {
    id: "cs",
    x: 56.3,
    y: 2,
    width: 16.3,
    height: 22,
  },

  {
    id: "science",
    x: 78.75,
    y: 6,
    width: 21,
    height: 19,
  },

  {
    id: "arts",
    x: 18.1,
    y: 26,
    width: 23.1,
    height: 17,
  },

  {
    id: "admin",
    x: 54.4,
    y: 74,
    width: 17.5,
    height: 21,
  },

  {
    id: "services",
    x: 22.5,
    y: 74,
    width: 18.75,
    height: 21,
  },

  {
    id: "innovation",
    x: 66.25,
    y: 25,
    width: 15,
    height: 21,
  },

  {
    id: "sports",
    x: 75.6,
    y: 74,
    width: 24.4,
    height: 21,
  },

  // No "gate" zone on purpose: the player spawns there, and a gate is
  // something you walk through, not a solid obstacle. It stays fully
  // clickable/interactive — this list only affects movement blocking.

  {
    id: "cafeteria",
    x: 1.25,
    y: 56,
    width: 17.5,
    height: 18,
  },
];

export const collisionZones: CollisionZone[] = collisionZonePercentages.map((zone) => ({
  ...zone,
  id: `${zone.id}-wall`,
  x: (zone.x / 100) * CAMPUS_WIDTH,
  y: (zone.y / 100) * CAMPUS_HEIGHT,
  width: (zone.width / 100) * CAMPUS_WIDTH,
  height: (zone.height / 100) * CAMPUS_HEIGHT,
}));
