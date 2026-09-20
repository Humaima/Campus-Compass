// Step 10.8 — small always-on HUD readout: where the player is standing,
// and (when navigating) where they're headed and how far that is.
type Props = {
  currentBuildingName: string | null;
  destination: { name: string; distanceMeters: number } | null;
};

export default function LocationHUD({ currentBuildingName, destination }: Props) {
  return (
    <div className="
      hidden
      md:block
      absolute
      left-4
      top-4
      z-30
      w-52
      pixel-panel-sm
      text-ink
      text-sm
    ">

      <div className="px-3 py-2">
        <p className="font-display text-[9px] tracking-wide text-navy">🧭 CURRENT LOCATION</p>
        <p className="mt-1 font-bold truncate">{currentBuildingName ?? "Unknown"}</p>
      </div>

      {destination && (
        <>
          <div className="border-t-2 border-navy" />
          <div className="px-3 py-2">
            <p className="font-display text-[9px] tracking-wide text-navy">🎯 DESTINATION</p>
            <p className="mt-1 font-bold truncate">{destination.name}</p>
            <p className="mt-1 text-xs">Distance: {Math.round(destination.distanceMeters)}m</p>
          </div>
        </>
      )}

    </div>
  );
}
