import type { Building } from "@/data/buildings";

export default function DestinationMarker({ building }: { building: Building }) {
  return (
    <div
      className="absolute z-20 -translate-x-1/2 -translate-y-full pointer-events-none text-center animate-pulse"
      style={{ left: `${building.x}%`, top: `${building.y}%` }}
      aria-label={`Destination: ${building.name}`}
    >
      <div className="border-2 border-navy bg-gold text-ink px-2 py-1 text-[10px] font-bold shadow-[2px_2px_0_var(--color-ink)]">
        🧭 DESTINATION<br />{building.name}
      </div>
      <div className="text-lg leading-none">↓</div>
    </div>
  );
}
