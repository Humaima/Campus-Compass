import { buildings } from "@/data/buildings";

export function searchCampus(query: string) {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return buildings
    .map((building) => {
      let score = 0;

      if (building.name.toLowerCase().includes(normalizedQuery)) {
        score += 10;
      }

      building.keywords?.forEach((keyword) => {
        if (keyword.toLowerCase().includes(normalizedQuery)) {
          score += 5;
        }
      });

      building.services?.forEach((service) => {
        if (service.toLowerCase().includes(normalizedQuery)) {
          score += 5;
        }
      });

      terms.forEach((term) => {
        if ([building.name, ...building.keywords, ...building.services].join(" ").toLowerCase().includes(term)) score += 1;
      });

      return {
        building,
        score
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}
