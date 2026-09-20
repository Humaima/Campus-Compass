// Hidden on small/touch screens — MobileControls appears there instead, and
// WASD/arrow-key instructions don't mean anything on a touchscreen.
export default function ControlsHint() {
  return (
    <div className="
      hidden
      md:block
      absolute
      left-4
      bottom-4
      z-30
      w-44
      pixel-panel-sm
      text-ink
      text-sm
    ">
      <p className="px-3 pt-2 font-display text-[9px] tracking-wide text-navy">🎮 CONTROLS</p>
      <div className="px-3 pb-2 pt-1 space-y-0.5">
        <p><span className="font-bold">WASD / ARROWS</span> Move</p>
        <p><span className="font-bold">E</span> Interact</p>
        <p><span className="font-bold">M</span> Map</p>
        <p><span className="font-bold">G</span> Guide</p>
      </div>
    </div>
  );
}
