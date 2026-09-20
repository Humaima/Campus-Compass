import { buildings } from "@/data/buildings";
import { getTodayHours } from "@/lib/campus/openingHours";
import { getBuildingIcon } from "@/lib/campus/buildingIcons";
import PixelButton from "@/components/ui/PixelButton";

type Building = (typeof buildings)[number];

type Props = {
  building: Building;
  currentRoute: string[] | null;
  onClose: () => void;
  onGetDirections: () => void;
  onAskGuide?: () => void;
};

export default function BuildingInfo({
  building,
  currentRoute,
  onClose,
  onGetDirections,
  onAskGuide,
}: Props) {
  const todayHours = getTodayHours(building.openingHours);

  return (
    <div
      className="font-pixel text-base absolute right-4 top-4 z-30 w-64 text-ink pixel-panel p-3"
    >

      <div className="flex justify-between items-start gap-2">

        <h2 className="text-base font-bold uppercase tracking-wide leading-snug">
          {getBuildingIcon(building.id)} {building.name}
        </h2>

        <button
          onClick={onClose}
          aria-label="Close popup"
          className="shrink-0 font-bold text-base leading-none cursor-pointer hover:text-brick"
        >
          ✕
        </button>

      </div>

      <div className="border-t-2 border-navy my-2" />

      <p className="text-xs leading-snug">
        {building.description}
      </p>

      <div className="mt-2 text-xs flex flex-wrap gap-x-3 gap-y-1">
        <span className="capitalize">📍 <strong>{building.type}</strong></span>
        <span>🕐 <strong>{todayHours ?? "Closed today"}</strong></span>
      </div>

      {building.services && building.services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {building.services.map((service) => (
            <span
              key={service}
              className="capitalize bg-gold border border-navy text-[10px] font-semibold px-1.5 py-0.5 text-ink"
            >
              {service}
            </span>
          ))}
        </div>
      )}

      {currentRoute && (
        <div className="mt-2 text-xs">
          <p className="font-semibold">
            {currentRoute.length > 0 ? "Route" : "No route found"}
          </p>
          {currentRoute.length > 0 && (
            <p className="mt-1">
              {currentRoute
                .map((id) => buildings.find((b) => b.id === id)?.name ?? id)
                .join(" → ")}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-1.5">

        <PixelButton variant="green" className="w-full !py-1 !text-xs" onClick={onGetDirections}>
          🧭 GET DIRECTIONS
        </PixelButton>

        <PixelButton variant="navy" className="w-full !py-1 !text-xs" onClick={onAskGuide}>
          🤖 ASK CAMPUS GUIDE
        </PixelButton>

      </div>

    </div>
  );
}
