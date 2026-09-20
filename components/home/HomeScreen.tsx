"use client";

import { useState } from "react";
import PixelButton from "@/components/ui/PixelButton";
import Crest from "@/components/ui/Crest";
import HowToPlay from "./HowToPlay";
import CampusStatusWidget from "./CampusStatusWidget";
import { useCampusClock } from "@/lib/campus/useCampusClock";

type HomeScreenProps = {
  onStart: () => void;
};

export default function HomeScreen({
  onStart,
}: HomeScreenProps) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const { now } = useCampusClock();
  // "September 2026" — null until mounted (see useCampusClock), same
  // server/client-mismatch guard as the rest of the app's clock displays.
  const monthYear = now ? now.toLocaleDateString([], { month: "long", year: "numeric" }) : null;

  return (
    <main className="
      min-h-screen
      flex
      flex-col
      items-center
      justify-center
      bg-cream
      p-8
      gap-5
    ">

      <div className="pixel-panel max-w-sm w-full p-10 text-center text-ink">

        <Crest size="lg" className="mx-auto w-fit" />

        {/* Step 10.6 — academic header block: institution name, a rule,
            then the app's own tagline underneath it. */}
        <h1 className="font-display text-xl mt-6 tracking-wide">
          ARCADIA UNIVERSITY
        </h1>

        <div className="border-t-2 border-navy my-3" />

        <p className="font-display text-[10px] tracking-widest text-navy">
          CAMPUS COMPASS
        </p>

        <p className="mt-6 mb-8 text-lg">
          Your campus. Your quest. Your compass.
        </p>

        <div className="flex flex-col gap-3">
          <PixelButton onClick={onStart}>
            🗺 START EXPLORING
          </PixelButton>

          <PixelButton variant="cream" onClick={() => setShowHowToPlay(true)}>
            ❓ HOW TO PLAY
          </PixelButton>
        </div>

        {/* Day 14 — Step 14.1's footer: the real current month/year
            (matching the clock elsewhere in the app), not a hard-coded
            date. */}
        <p className="mt-8 text-xs text-navy font-display tracking-wide">
          {monthYear ?? " "}
        </p>
        <p className="text-xs text-navy/70 mt-1">
          Student Edition
        </p>

      </div>

      {/* Day 14 — Step 14.3, structured campus data, not the LLM. */}
      <div className="max-w-sm w-full">
        <CampusStatusWidget />
      </div>

      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}

    </main>
  );
}
