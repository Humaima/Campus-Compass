export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

// Day 12. Two kinds of achievement live here side by side:
//   - General ones, earned just by playing (exploring, asking the guide,
//     following a route) — not tied to any specific quest.
//   - Quest-reward badges, one per data/quests.ts quest, unlocked exactly
//     when that quest's `achievementId` is claimed on full completion.
export const achievements: Achievement[] = [
  { id: "first-step", title: "First Steps", description: "Explore the Arcadia campus.", icon: "👟" },
  { id: "campus-explorer", title: "Campus Explorer", description: "Visit five campus locations.", icon: "🧭" },
  { id: "knowledge-seeker", title: "Knowledge Seeker", description: "Ask the Campus Guide your first question.", icon: "📚" },
  { id: "navigator", title: "Navigator", description: "Successfully follow a campus route.", icon: "🗺" },

  { id: "first-quest", title: "First Quest", description: "Complete an orientation quest.", icon: "🏆" },
  { id: "orientation-complete", title: "Orientation Complete", description: "Complete every orientation quest.", icon: "🎉" },

  { id: "quest-campus-explorer", title: "Campus Explorer Badge", description: "Complete the Campus Explorer quest.", icon: "🎒" },
  { id: "quest-ready-for-class", title: "Ready for Class", description: "Complete the Academic Survival quest.", icon: "📖" },
  { id: "quest-first-week", title: "First Week Complete", description: "Complete the First Week quest.", icon: "🎓" },
];
