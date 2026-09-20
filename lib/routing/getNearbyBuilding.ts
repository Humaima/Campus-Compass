import { buildings } from "@/data/buildings";

export function getNearbyBuilding(
  x: number,
  y: number,
  radius = 6
) {
  return (
    buildings.find((building) => {

      const distance = Math.sqrt(
        Math.pow(building.x - x, 2) +
        Math.pow(building.y - y, 2)
      );

      return distance <= radius;

    }) ?? null
  );
}