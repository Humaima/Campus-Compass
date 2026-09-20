import { buildings } from "@/data/buildings";

type Props = {
  playerPercent: { x: number; y: number };
  destinationId: string | null;
};

// Day 14 — Step 14.6. A coarse overview, not a second detailed map: a dot
// per building, ● for the player, ▲ for the active destination — reusing
// the same x/y percent coordinates the full map already positions
// everything with (data/buildings.ts), just remapped onto a much smaller
// box. Just enough to orient by, nothing more.
export default function Minimap({ playerPercent, destinationId }: Props) {
  const destination = destinationId ? buildings.find((b) => b.id === destinationId) : null;

  return (
    <div className="absolute right-4 top-4 z-30 pixel-panel-sm p-1.5">
      <div className="relative w-24 h-16 sm:w-28 sm:h-20 bg-green/20 overflow-hidden">
        {buildings.map((building) => (
          building.id === destinationId ? null : (
            <span
              key={building.id}
              className="absolute w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy/50"
              style={{ left: `${building.x}%`, top: `${building.y}%` }}
            />
          )
        ))}

        {destination && (
          <span
            className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] leading-none text-gold"
            style={{ left: `${destination.x}%`, top: `${destination.y}%` }}
          >
            ▲
          </span>
        )}

        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] leading-none text-brick"
          style={{ left: `${playerPercent.x}%`, top: `${playerPercent.y}%` }}
        >
          ●
        </span>
      </div>
      <p className="mt-1 text-center font-display text-[7px] tracking-wide text-navy">MAP</p>
    </div>
  );
}
