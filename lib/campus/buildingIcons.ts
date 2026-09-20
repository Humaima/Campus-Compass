// Shared between BuildingInfo (the map popup) and the AI Guide's action
// cards, so a building only ever has one emoji defined in one place.
export const BUILDING_ICONS: Record<string, string> = {
  library: "📚",
  cs: "💻",
  science: "🔬",
  arts: "🎨",
  admin: "🏛️",
  services: "🎭",
  innovation: "💡",
  sports: "⚽",
  gate: "🚪",
  cafeteria: "🍔",
};

export function getBuildingIcon(buildingId: string): string {
  return BUILDING_ICONS[buildingId] ?? "🏫";
}
