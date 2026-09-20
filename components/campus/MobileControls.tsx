"use client";

// PlayerController listens for real keydown/keyup events on window — these
// buttons dispatch the same events synthetically, so movement, collision,
// and everything else in PlayerController works identically for a tap as
// for a keypress, with zero changes needed there.
function dispatchKey(type: "keydown" | "keyup", key: string) {
  window.dispatchEvent(new KeyboardEvent(type, { key }));
}

function holdHandlers(key: string) {
  return {
    onPointerDown: () => dispatchKey("keydown", key),
    onPointerUp: () => dispatchKey("keyup", key),
    onPointerLeave: () => dispatchKey("keyup", key),
    onPointerCancel: () => dispatchKey("keyup", key),
  };
}

// Step 13.1 — the same hard-offset-shadow, press-to-flatten language as
// .pixel-button (app/globals.css), just sized for a compact d-pad button
// instead of a full text button.
const DPAD_BUTTON = "\
  flex items-center justify-center \
  w-11 h-11 \
  bg-parchment text-ink \
  border-[3px] border-navy \
  text-lg font-bold \
  shadow-[3px_3px_0_var(--color-ink)] \
  active:translate-x-[3px] active:translate-y-[3px] active:shadow-none \
  touch-none select-none cursor-pointer";

type Props = {
  onInteract: () => void;
  canInteract: boolean;
};

// Only shown on small/touch screens (md:hidden) — desktop already has
// ControlsHint pointing at WASD/arrow keys and E.
export default function MobileControls({ onInteract, canInteract }: Props) {
  return (
    <div className="absolute bottom-4 right-4 z-30 md:hidden">
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-36">
        <div />
        <button {...holdHandlers("w")} aria-label="Move up" className={DPAD_BUTTON}>▲</button>
        <div />

        <button {...holdHandlers("a")} aria-label="Move left" className={DPAD_BUTTON}>◀</button>

        {/* The center ● — the touch equivalent of pressing E, since "Press
            E" (InteractionPrompt.tsx) means nothing on a screen with no
            keyboard. Dimmed and inert until a building is actually nearby,
            the same gating CampusMap's E-key listener already applies. */}
        <button
          onClick={onInteract}
          disabled={!canInteract}
          aria-label="Interact"
          className={`${DPAD_BUTTON} rounded-full ${canInteract ? "!bg-gold animate-pulse" : "opacity-50 cursor-not-allowed"}`}
        >
          ●
        </button>

        <button {...holdHandlers("d")} aria-label="Move right" className={DPAD_BUTTON}>▶</button>

        <div />
        <button {...holdHandlers("s")} aria-label="Move down" className={DPAD_BUTTON}>▼</button>
        <div />
      </div>
    </div>
  );
}
