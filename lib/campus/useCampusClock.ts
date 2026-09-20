"use client";

import { useEffect, useState } from "react";
import { getTimeOfDay, type TimeOfDay } from "./timeOfDay";

export type CampusClock = {
  // Formatted "HH:MM" (24h), or null before the first client-side tick.
  time: string | null;
  timeOfDay: TimeOfDay | null;
  // The underlying Date, for callers that need more than the HH:MM/tier
  // above (e.g. HomeScreen's "September 2026" footer).
  now: Date | null;
};

// Shared by the HUD header, the map's lighting tint, the Home screen, and
// the Campus Status widget — one ticking clock, not four independent
// setInterval calls disagreeing by a few seconds. Starts null and fills in
// after mount (not read during render) so the server-rendered markup and
// the client's first render always match — the server has no way to know
// the visitor's clock in advance (same reasoning as the original Step 10.5
// clock this replaces).
export function useCampusClock(): CampusClock {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    function tick() {
      setNow(new Date());
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return { time: null, timeOfDay: null, now: null };

  return {
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
    timeOfDay: getTimeOfDay(now),
    now,
  };
}
