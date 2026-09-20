"use client";

import { buildings } from "@/data/buildings";
import { getTodayHours, isOpenNow } from "@/lib/campus/openingHours";
import { useCampusClock } from "@/lib/campus/useCampusClock";

const STATUS_BUILDINGS = [
  { id: "library", icon: "📚", label: "Library" },
  { id: "cafeteria", icon: "🍴", label: "Cafeteria" },
  { id: "sports", icon: "🏀", label: "Sports Center" },
];

// Day 14 — Step 14.3. Every line here is read from data/buildings.ts's
// real opening-hours data via lib/campus/openingHours.ts — the same
// deterministic check campusGuide.ts's "is it open now?" answer already
// trusts (Step 20: structured data overrides anything the LLM might
// guess). Never the LLM, never a hand-set flag.
export default function CampusStatusWidget() {
  // The tick itself is the point here (re-render every 30s so "Open"
  // flips to "Closed" without a page reload) — isOpenNow/getTodayHours
  // read the real clock themselves on every call, this just triggers the
  // re-render that lets them run again.
  const { time } = useCampusClock();
  if (!time) return null;

  const rows = STATUS_BUILDINGS.map((entry) => {
    const building = buildings.find((b) => b.id === entry.id);
    return { ...entry, open: building ? isOpenNow(getTodayHours(building.openingHours)) : false };
  });
  const campusOpen = rows.some((row) => row.open);

  return (
    <div className="pixel-panel-sm text-ink text-sm w-full">
      <p className="px-3 pt-2 font-display text-[9px] tracking-wide text-navy">🏫 CAMPUS STATUS</p>
      <div className="px-3 pb-2 pt-1 space-y-0.5">
        <p className="font-bold">{campusOpen ? "🟢" : "🔴"} Campus {campusOpen ? "Open" : "Closed"}</p>
        {rows.map((row) => (
          <p key={row.id}>{row.icon} {row.label} {row.open ? "Open" : "Closed"}</p>
        ))}
      </div>
    </div>
  );
}
