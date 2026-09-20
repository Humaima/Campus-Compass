"use client";

import { useState } from "react";
import { buildings } from "@/data/buildings";
import PixelInput from "@/components/ui/PixelInput";

// Kept as the public search-panel entry point while the interactive AI UI
// lives beside it for a focused client component boundary.
export { default } from "./AISearchPanel";

function LegacySearchPanel() {
  const [query, setQuery] = useState("");

  const results = buildings.filter((building) =>
    building.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-4 text-black">
        🔎 Search Campus
      </h2>

      <PixelInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search buildings..."
      />

      <div className="mt-4 space-y-2">

        {results.map((building) => (
          <div
            key={building.id}
            className="
              border-4
              border-black
              bg-[#fff8e7]
              text-black
              p-3
            "
          >
            <strong>{building.name}</strong>

            <p className="text-sm">
              {building.description}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}
