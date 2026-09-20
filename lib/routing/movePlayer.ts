import { checkCollision } from "./checkCollision";
import { CAMPUS_HEIGHT, CAMPUS_WIDTH, PLAYER_SIZE } from "@/data/campus";

type Position = {
  x: number;
  y: number;
};

export function movePlayer(
  position: Position,
  dx: number,
  dy: number
): Position {

  const clampX = (x: number) => Math.max(PLAYER_SIZE / 2, Math.min(CAMPUS_WIDTH - PLAYER_SIZE / 2, x));
  const clampY = (y: number) => Math.max(PLAYER_SIZE / 2, Math.min(CAMPUS_HEIGHT - PLAYER_SIZE / 2, y));

  // Resolve axes independently. A diagonal move into a wall can still move
  // along its open axis rather than freezing the player in place.
  const xCandidate = { x: clampX(position.x + dx), y: position.y };
  const afterX = checkCollision(xCandidate) ? position : xCandidate;
  const yCandidate = { x: afterX.x, y: clampY(afterX.y + dy) };
  return checkCollision(yCandidate) ? afterX : yCandidate;
}
