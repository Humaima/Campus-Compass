import PixelButton from "@/components/ui/PixelButton";

type Props = { onClose: () => void };

const CONTROLS = [
  { keys: "WASD / ARROWS", description: "Move around campus" },
  { keys: "E", description: "Interact with buildings" },
];

const SCREENS = [
  { icon: "🗺", label: "MAP", description: "Explore the campus" },
  { icon: "🤖", label: "GUIDE", description: "Ask your AI Campus Guide" },
  { icon: "🎒", label: "QUESTS", description: "Complete orientation activities" },
];

// Day 14 — Step 14.2. Shared between HomeScreen's "HOW TO PLAY" button and
// the in-app Settings panel, so the same explanation is available before
// you start and any time you need a reminder, rather than two copies that
// could drift apart.
export default function HowToPlay({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm pixel-panel text-ink"
      >
        <div className="bg-navy text-parchment border-b-4 border-navy p-4 font-display text-xs flex items-center justify-between">
          <span>🎮 HOW TO PLAY</span>
          <button onClick={onClose} aria-label="Close" className="cursor-pointer hover:text-gold">✕</button>
        </div>

        <div className="p-5 text-sm space-y-4">

          <div className="space-y-2">
            {CONTROLS.map((control) => (
              <div key={control.keys} className="flex items-baseline gap-2">
                <span className="font-bold shrink-0">{control.keys}</span>
                <span>{control.description}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-navy" />

          <div className="space-y-2">
            {SCREENS.map((screen) => (
              <div key={screen.label} className="flex items-baseline gap-2">
                <span className="font-bold shrink-0">{screen.icon} {screen.label}</span>
                <span>{screen.description}</span>
              </div>
            ))}
          </div>

          <PixelButton className="w-full" onClick={onClose}>GOT IT</PixelButton>

        </div>
      </div>
    </div>
  );
}
