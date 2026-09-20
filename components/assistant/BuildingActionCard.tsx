import { buildings } from "@/data/buildings";
import { getBuildingIcon } from "@/lib/campus/buildingIcons";
import { getCampusZone } from "@/lib/campus/campusZone";
import PixelButton from "@/components/ui/PixelButton";

type Props = {
  buildingId: string;
  onView: (id: string) => void;
  onDirections: (id: string) => void;
};

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Step 11.3 — turns a SHOW_BUILDING / GET_DIRECTIONS action into a real
// campus-integrated result, not just a sentence with buttons bolted on.
// Both buttons are always offered together regardless of which action type
// triggered it: whether the student asked "where is X" or "take me to X",
// they equally likely want to either look at it or be guided there.
export default function BuildingActionCard({ buildingId, onView, onDirections }: Props) {
  const building = buildings.find((b) => b.id === buildingId);
  if (!building) return null;

  const tagline = building.services.slice(0, 2).map(capitalize).join(" & ") || capitalize(building.type);

  return (
    <div className="mt-3 border-2 border-navy bg-parchment">
      <div className="border-b-2 border-navy bg-gold px-3 py-2 font-display text-[11px] uppercase tracking-wide text-ink">
        {getBuildingIcon(building.id)} {building.name}
      </div>

      <div className="px-3 py-2 text-xs text-ink">
        <p>{tagline}</p>
        <p className="mt-2 opacity-70">📍 {getCampusZone(building)}</p>
      </div>

      <div className="flex gap-2 px-3 pb-3">
        <PixelButton variant="cream" className="!text-xs flex-1" onClick={() => onView(building.id)}>
          VIEW BUILDING
        </PixelButton>
        <PixelButton variant="green" className="!text-xs flex-1" onClick={() => onDirections(building.id)}>
          GUIDE ME HERE
        </PixelButton>
      </div>
    </div>
  );
}
