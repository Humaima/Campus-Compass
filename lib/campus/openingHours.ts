import type { Building, Weekday } from "@/data/buildings";

const WEEKDAYS: Weekday[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// Shared by BuildingInfo.tsx (popup display) and campusGuide.ts (the
// deterministic "is it open now?" check from Day 7 Step 12) — one place
// computing "today", so the two can't silently drift into checking
// different days.
export function getTodayHours(openingHours: Building["openingHours"]): string | null {
  if (!openingHours) return null;
  const today = WEEKDAYS[new Date().getDay()];
  return openingHours[today] ?? null;
}

// "HH:MM-HH:MM" against the current wall-clock time. Structured hours are
// authoritative (Step 20) — this is the deterministic check the LLM
// defers to rather than guessing from a document that might be stale.
export function isOpenNow(hoursRange: string | null): boolean {
  if (!hoursRange) return false;

  const [start, end] = hoursRange.split("-");
  const toMinutes = (hhmm: string) => {
    const [hours, minutes] = hhmm.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  return nowMinutes >= toMinutes(start) && nowMinutes <= toMinutes(end);
}
