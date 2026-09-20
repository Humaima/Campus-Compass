import PixelButton from "@/components/ui/PixelButton";

type Props = {
  onClose: () => void;
  onHowToPlay: () => void;
  onReset: () => void;
};

// Day 13 — Step 13.2's "SETTINGS" nav item. Houses what used to be a bare
// "⚙ RESET" text button in the nav bar itself, plus a reminder link back
// to How to Play — small, but it's the one place in the running app (not
// just the landing screen) a student can re-check the controls.
export default function SettingsPanel({ onClose, onHowToPlay, onReset }: Props) {
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
          <span>⚙ SETTINGS</span>
          <button onClick={onClose} aria-label="Close" className="cursor-pointer hover:text-gold">✕</button>
        </div>

        <div className="p-5 text-sm space-y-3">

          <PixelButton variant="cream" className="w-full" onClick={onHowToPlay}>
            ❓ HOW TO PLAY
          </PixelButton>

          <PixelButton
            variant="brick"
            className="w-full"
            onClick={() => {
              if (window.confirm("Reset completed quests, achievements, and player progress?")) onReset();
            }}
          >
            🗑 RESET PROGRESS
          </PixelButton>

          <p className="text-xs text-navy/70 text-center pt-2">Campus Compass • Student Edition</p>

        </div>
      </div>
    </div>
  );
}
