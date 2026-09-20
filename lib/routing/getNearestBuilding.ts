import { buildings } from "@/data/buildings";

export function getNearestBuilding(
  x: number,
  y: number
) {
  let nearest = null;
  let shortestDistance = Infinity;

  for (const building of buildings) {

    const distance = Math.sqrt(
      Math.pow(building.x - x, 2) +
      Math.pow(building.y - y, 2)
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearest = building;
    }
  }

  return nearest;
}