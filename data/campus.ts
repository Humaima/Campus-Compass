export const CAMPUS_WIDTH = 1600;
export const CAMPUS_HEIGHT = 1000;
export const PLAYER_SIZE = 32;
export const PLAYER_SPEED = 340;
export const INTERACTION_DISTANCE = 56;

// Flavor-only scale for the HUD's "distance to destination" readout. The
// campus has no real-world dimensions, so pixel space is treated as if the
// mapped area were roughly 480m across end to end — plausible for a small
// university campus, and enough to make the readout feel grounded.
export const CAMPUS_WIDTH_METERS = 480;
export const METERS_PER_PIXEL = CAMPUS_WIDTH_METERS / CAMPUS_WIDTH;

export function toCampusPoint(xPercent: number, yPercent: number) {
  return { x: (xPercent / 100) * CAMPUS_WIDTH, y: (yPercent / 100) * CAMPUS_HEIGHT };
}

export function toMapPercent(x: number, y: number) {
  return { x: (x / CAMPUS_WIDTH) * 100, y: (y / CAMPUS_HEIGHT) * 100 };
}
