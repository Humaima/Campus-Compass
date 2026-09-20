type Props = {
  building: {
    name: string;
  } | null;
};

export default function InteractionPrompt({
  building,
}: Props) {

  if (!building) return null;

  return (
    <div className="
      absolute
      left-1/2
      top-4
      -translate-x-1/2
      z-30
      pixel-panel-sm
      text-ink
      px-4
      py-2
      font-bold
    ">
      🏫 {building.name}
      <span className="ml-3 text-gold" style={{ textShadow: "1px 1px 0 var(--color-navy)" }}>
        {/* "Press E" means nothing on a touchscreen — MobileControls'
            center ● button is the equivalent there. */}
        <span className="hidden md:inline">Press E</span>
        <span className="md:hidden">Tap ●</span>
      </span>
    </div>
  );
}