import type { Building } from "@/data/buildings";

// A coarse, human-readable zone label ("Northeast Campus") derived from a
// building's map position (data/buildings.ts x/y, 0-100 percent of the map).
// There's no authored "zone" data in this project — buildings only carry
// raw coordinates — so this buckets them the same way a student would
// describe "which part of campus": three bands each axis, collapsing the
// middle band on either axis out of the label rather than saying "Central
// North" or similar.
function verticalBand(y: number): "North" | "" | "South" {
  if (y < 45) return "North";
  if (y >= 75) return "South";
  return "";
}

function horizontalBand(x: number): "West" | "" | "East" {
  if (x < 35) return "West";
  if (x >= 65) return "East";
  return "";
}

export function getCampusZone(building: Pick<Building, "x" | "y">): string {
  const vertical = verticalBand(building.y);
  const horizontal = horizontalBand(building.x);
  const label = `${vertical}${horizontal}`;
  return `${label || "Central"} Campus`;
}
