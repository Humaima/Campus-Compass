export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type Building = {
  id: string;
  name: string;
  // Lowercase (not "Academic") so the AI assistant (lib/ai) can match it
  // directly against parsed intents/keywords without normalizing case at
  // every comparison site. BuildingInfo re-capitalizes it for display.
  type: string;
  description: string;
  // x, y are percentages of the map image's box (0-100), marking this
  // building's actual position — measured against the real 1600x1000
  // Campus_Map.png, not an arbitrary click-zone offset. This is the single
  // source of truth for where a building sits: CampusMap.tsx centers both
  // the clickable zone and the player marker on this point, and it's the
  // coordinate movement will animate the player toward.
  x: number;
  y: number;
  // Logical coordinates are used for movement, collision and interaction.
  // x/y above remain only as the rendered-map anchor percentages.
  position: { x: number; y: number };
  size: { width: number; height: number };
  entrance: { x: number; y: number };
  // Per-weekday, "HH:MM-HH:MM"; a missing day means closed/not listed for
  // that day. Optional altogether, for a building with no tracked hours.
  // NOTE: only weekdays are populated below for any building — including
  // the gate, which in reality likely isn't closed on weekends. Extend
  // with saturday/sunday once real weekend hours are known.
  openingHours?: Partial<Record<Weekday, string>>;
  // Lowercase, same reasoning as `type` — matched against user queries by
  // the AI assistant. BuildingInfo re-capitalizes each one for display.
  services: string[];
  // Lowercase search terms the AI assistant matches free-text queries
  // against (e.g. "where can I print" -> "printing" -> this building).
  keywords: string[];
  // Ids of nearby buildings reachable by a campus walkway — an adjacency
  // list for a future "get directions" / pathfinding feature.
  connections: string[];
};

const buildingSeeds = [
  {
    id: "library",
    name: "Main Library",
    type: "academic",
    description:
      "The main academic library with study spaces, books, computers, and research resources.",
    x: 20.4,
    y: 15.5,
    openingHours: {
      monday: "08:00-22:00",
      tuesday: "08:00-22:00",
      wednesday: "08:00-22:00",
      thursday: "08:00-22:00",
      friday: "08:00-20:00",
    },
    services: ["books", "printing", "study rooms", "computers", "research assistance"],
    keywords: ["library", "books", "study", "printing", "print", "research", "computer"],
    connections: ["arts", "cs"],
  },

  {
    id: "cs",
    name: "CS and Engineering School",
    type: "academic",
    description: "Home of computer science/engineering classrooms and laboratories.",
    x: 64.5,
    y: 13,
    openingHours: {
      monday: "08:00-18:00",
      tuesday: "08:00-18:00",
      wednesday: "08:00-18:00",
      thursday: "08:00-18:00",
      friday: "08:00-18:00",
    },
    services: ["classrooms", "computer labs", "engineering workshops", "faculty offices"],
    keywords: ["computer science", "engineering", "cs", "programming", "labs", "coding"],
    connections: ["library", "science", "innovation"],
  },

  {
    id: "science",
    name: "Applied Sciences School",
    type: "academic",
    description: "Home of science classrooms and laboratories.",
    x: 89.3,
    y: 15.5,
    openingHours: {
      monday: "08:00-18:00",
      tuesday: "08:00-18:00",
      wednesday: "08:00-18:00",
      thursday: "08:00-18:00",
      friday: "08:00-18:00",
    },
    services: ["science labs", "classrooms", "research facilities", "faculty offices"],
    keywords: ["science", "labs", "research", "chemistry", "biology", "physics"],
    connections: ["cs", "innovation"],
  },

  {
    id: "arts",
    name: "Arts and Humanities School",
    type: "academic",
    description: "Home of arts and humanities classrooms and laboratories.",
    x: 29.7,
    y: 34.5,
    openingHours: {
      monday: "08:00-18:00",
      tuesday: "08:00-18:00",
      wednesday: "08:00-18:00",
      thursday: "08:00-18:00",
      friday: "08:00-18:00",
    },
    services: ["classrooms", "art studios", "lecture halls", "faculty offices"],
    keywords: ["arts", "humanities", "art studio", "lecture", "design", "history"],
    connections: ["library", "services"],
  },

  {
    id: "admin",
    name: "Administration",
    type: "administrative",
    description: "Home of university administrative offices and services.",
    x: 63.2,
    y: 84.5,
    openingHours: {
      monday: "09:00-17:00",
      tuesday: "09:00-17:00",
      wednesday: "09:00-17:00",
      thursday: "09:00-17:00",
      friday: "09:00-17:00",
    },
    services: ["admissions", "registrar", "student records", "financial aid"],
    keywords: ["admissions", "registrar", "records", "financial aid", "enrollment", "tuition", "registration", "student id"],
    connections: ["innovation", "sports", "gate"],
  },

  {
    id: "services",
    name: "Auditorium and Student Services",
    type: "student life",
    description:
      "Central hub for student activities, clubs, events, and student services, plus the campus auditorium.",
    x: 31.9,
    y: 84.5,
    openingHours: {
      monday: "09:00-20:00",
      tuesday: "09:00-20:00",
      wednesday: "09:00-20:00",
      thursday: "09:00-20:00",
      friday: "09:00-20:00",
    },
    services: ["auditorium", "clubs & events", "student counseling", "student services desk"],
    keywords: ["auditorium", "clubs", "events", "counseling", "student services", "help"],
    connections: ["arts", "cafeteria", "gate"],
  },

  {
    id: "innovation",
    name: "Innovation Center",
    type: "academic",
    description: "Center for innovation and entrepreneurship.",
    x: 73.8,
    y: 35.5,
    openingHours: {
      monday: "09:00-19:00",
      tuesday: "09:00-19:00",
      wednesday: "09:00-19:00",
      thursday: "09:00-19:00",
      friday: "09:00-19:00",
    },
    services: ["maker space", "startup incubator", "meeting rooms", "3d printing"],
    keywords: ["innovation", "startup", "maker space", "entrepreneurship", "3d printing"],
    connections: ["cs", "science", "admin"],
  },

  {
    id: "sports",
    name: "Sports Center",
    type: "recreation",
    description: "Facility for sports activities and events.",
    x: 87.8,
    y: 84.5,
    openingHours: {
      monday: "06:00-21:00",
      tuesday: "06:00-21:00",
      wednesday: "06:00-21:00",
      thursday: "06:00-21:00",
      friday: "06:00-21:00",
    },
    services: ["gymnasium", "tennis court", "soccer field", "locker rooms"],
    keywords: ["sports", "gym", "gymnasium", "tennis", "soccer", "fitness", "recreation"],
    connections: ["admin"],
  },

  {
    id: "gate",
    name: "Main Gate",
    type: "entrance",
    description: "Main entrance to the campus.",
    // Open 24 hours — see the Weekday note above re: weekends not modeled yet.
    openingHours: {
      monday: "00:00-23:59",
      tuesday: "00:00-23:59",
      wednesday: "00:00-23:59",
      thursday: "00:00-23:59",
      friday: "00:00-23:59",
    },
    x: 45.6,
    y: 95,
    services: ["security desk", "visitor check-in"],
    keywords: ["gate", "entrance", "security", "visitor", "check-in", "exit"],
    connections: ["services", "admin"],
  },

  {
    id: "cafeteria",
    name: "Cafe",
    type: "food",
    description: "Food court and student dining area.",
    x: 10,
    y: 65,
    openingHours: {
      monday: "07:00-21:00",
      tuesday: "07:00-21:00",
      wednesday: "07:00-21:00",
      thursday: "07:00-21:00",
      friday: "07:00-21:00",
    },
    services: ["food court", "coffee", "seating area", "takeaway"],
    keywords: ["cafeteria", "food", "coffee", "cafe", "dining", "lunch", "snacks"],
    connections: ["services"],
  },
];

// Building art and physics intentionally do not share a shape. A logical
// entrance below each visual anchor gives navigation an approachable target;
// collision walls live independently in data/collision.ts.
export const buildings: Building[] = buildingSeeds.map((building) => {
  const position = { x: building.x * 16, y: building.y * 10 };
  return {
    ...building,
    position,
    size: { width: 240, height: 180 },
    entrance: {
      x: position.x,
      y: building.id === "gate" ? position.y : Math.min(970, position.y + 120),
    },
  };
});
