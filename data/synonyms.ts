// Casual/alternate terms students might actually type, layered on top of
// each building's curated `keywords` in data/buildings.ts (see
// lib/ai/parseIntent.ts, which checks both). Deliberately non-overlapping
// with `keywords` — e.g. cafeteria's keywords already cover "food",
// "dining", "lunch", so this only adds what those don't: "eat", "hungry".
//
// Keyed by real building ids (library, admin, ...) — not the tutorial
// example's "student-services", which isn't a building in this project.
// "registration"/"enrollment" already live on "admin" (see buildings.ts),
// so that's where "enroll" and "course registration" belong too.
export const campusSynonyms: Record<string, string[]> = {
  library: ["reading", "textbooks", "borrow", "quiet place"],

  cafeteria: ["eat", "hungry", "meal", "breakfast", "dinner"],

  admin: ["enroll", "course registration", "sign up", "paperwork"],

  cs: ["software", "code", "developer", "tech"],

  science: ["experiments", "lab work"],

  arts: ["painting", "music", "theatre", "literature"],

  services: ["mental health", "talk to someone", "join a club", "performance"],

  innovation: ["business idea", "prototype", "hackathon"],

  sports: ["workout", "exercise", "play", "football", "basketball"],

  gate: ["enter campus", "leave campus"],
};
