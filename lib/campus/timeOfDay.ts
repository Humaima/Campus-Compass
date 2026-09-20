export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

// `tint` is a subtle full-map overlay color (Step 14.4's "subtly change
// sky/background, lighting") — low alpha on purpose; this should read as
// mood lighting, not a filter slapped over the art. Afternoon gets none:
// it's the map's own baseline daylight, nothing to tint toward.
export const TIME_OF_DAY_META: Record<TimeOfDay, { label: string; icon: string; tint: string | null }> = {
  morning: { label: "Morning", icon: "☀️", tint: "rgba(255, 232, 189, 0.12)" },
  afternoon: { label: "Afternoon", icon: "🌤", tint: null },
  evening: { label: "Evening", icon: "🌙", tint: "rgba(216, 120, 90, 0.18)" },
  // Not in Day 14's three examples (8:30 AM / 2:30 PM / 8:30 PM), but
  // buildings are mostly closed by late night and "8:30 PM Evening"
  // calling 2 AM "Evening" too would read wrong — a fourth bucket for the
  // dead-of-night hours.
  night: { label: "Night", icon: "🌌", tint: "rgba(24, 24, 64, 0.35)" },
};

// Pure and testable on purpose — the map tint, the HUD clock, and the Home
// screen all need the same answer for "what time of day is it," so this is
// the one place that decides, not three separate hour-range checks.
export function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
