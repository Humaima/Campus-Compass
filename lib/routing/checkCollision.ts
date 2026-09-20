import { collisionZones } from "@/data/collision";
import { PLAYER_SIZE } from "@/data/campus";

type Position = {
  x: number;
  y: number;
};

export function checkCollision(
  position: Position
): boolean {

  return collisionZones.some((zone) => {

    const playerLeft =
      position.x - PLAYER_SIZE / 2;

    const playerRight =
      position.x + PLAYER_SIZE / 2;

    const playerTop =
      position.y - PLAYER_SIZE / 2;

    const playerBottom =
      position.y + PLAYER_SIZE / 2;

    const zoneRight =
      zone.x + zone.width;

    const zoneBottom =
      zone.y + zone.height;

    return (
      playerRight > zone.x &&
      playerLeft < zoneRight &&
      playerBottom > zone.y &&
      playerTop < zoneBottom
    );
  });
}
