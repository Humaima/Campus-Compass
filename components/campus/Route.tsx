import { buildings } from "@/data/buildings";
type RouteProps = {
  route: string[];
};

export default function Route({
  route,
}: RouteProps) {

  if (route.length < 2) {
    return null;
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    >
      {route.slice(0, -1).map((location, index) => {

        const from = buildings.find((building) => building.id === location);
        const to = buildings.find((building) => building.id === route[index + 1]);
        if (!from || !to) return null;

        return (
          <line
            key={`${location}-${route[index + 1]}`}
            x1={`${from.x}%`}
            y1={`${from.y}%`}
            x2={`${to.x}%`}
            y2={`${to.y}%`}
            stroke="#D4A84F"
            strokeWidth="1.2%"
            strokeDasharray="8 5"
          />
        );
      })}
    </svg>
  );
}
