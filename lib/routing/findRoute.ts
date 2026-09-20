import { buildings } from "@/data/buildings";

// Adjacency comes straight from each building's own `connections` list —
// the single source of truth for the campus graph (see data/buildings.ts).
// A previous data/routes.ts duplicated this same graph under a different,
// stale set of ids and was removed rather than kept in sync by hand.
const buildingsById = new Map(buildings.map((building) => [building.id, building]));

// BFS: the campus graph is small and every connection costs the same
// (one walkway hop), so there's no need for a weighted search like Dijkstra.
export function findRoute(
  start: string,
  destination: string
): string[] {

  if (start === destination) {
    return [start];
  }

  const queue: string[][] = [[start]];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {

    const path = queue.shift()!;
    const current = path[path.length - 1];

    const neighbors = buildingsById.get(current)?.connections ?? [];

    for (const neighbor of neighbors) {

      if (visited.has(neighbor)) {
        continue;
      }

      const newPath = [...path, neighbor];

      if (neighbor === destination) {
        return newPath;
      }

      visited.add(neighbor);
      queue.push(newPath);
    }
  }

  return [];
}
