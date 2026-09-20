"use client";

import { useEffect } from "react";
import type { Achievement } from "@/data/achievements";

type Props = { achievement: Achievement | null; onDone: () => void };

const DISPLAY_MS = 3200;

// Fixed offsets, not Math.random() — this renders the instant an
// achievement unlocks, so there's no per-mount randomness to keep stable;
// a hard-coded scatter is simpler and just as convincing.
const PARTICLES = [
  { x: -58, y: -14, delay: "0s" },
  { x: 54, y: -18, delay: "0.05s" },
  { x: -40, y: 20, delay: "0.1s" },
  { x: 44, y: 22, delay: "0.08s" },
  { x: 4, y: -30, delay: "0.12s" },
  { x: -6, y: 30, delay: "0.03s" },
];

// A short chiptune-style two-note chime via the Web Audio API — no binary
// asset to ship or source. Low gain and a square wave keep it in the
// pixel-game aesthetic without being loud; wrapped in try/catch because
// autoplay policies or an unsupported browser should just mean a silent
// (still-visible) toast, never a crash.
function playChime() {
  try {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    [523.25, 783.99].forEach((freq, i) => {
      const start = now + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.05, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });

    setTimeout(() => ctx.close(), 500);
  } catch {
    // No audio this time — the visual toast still lands.
  }
}

// Day 12 — the "you just unlocked something" moment. Deliberately its own
// component rather than a NotificationToast variant: that one is a quiet,
// dismiss-on-click status line, while this is a celebratory interruption
// that announces itself (chime + particles) and clears itself after a
// beat, with no action required from the student.
export default function AchievementToast({ achievement, onDone }: Props) {
  useEffect(() => {
    if (!achievement) return;
    playChime();
    const timer = setTimeout(onDone, DISPLAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievement]);

  if (!achievement) return null;

  return (
    <div
      key={achievement.id}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] pointer-events-none animate-achievement-pop"
    >
      <div className="relative pixel-panel bg-navy text-parchment px-6 py-4 text-center w-72">
        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="achievement-particle"
            style={{ "--px": `${particle.x}px`, "--py": `${particle.y}px`, animationDelay: particle.delay } as React.CSSProperties}
          />
        ))}

        <p className="font-display text-[10px] tracking-widest text-gold">🏆 ACHIEVEMENT UNLOCKED</p>
        <p className="mt-2 font-display text-xs">
          {achievement.icon} {achievement.title.toUpperCase()}
        </p>
        <p className="mt-2 text-sm opacity-90">{achievement.description}</p>
      </div>
    </div>
  );
}
