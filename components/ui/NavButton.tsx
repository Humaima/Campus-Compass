type Props = {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
};

// Step 13.2 — one nav item, two layouts of the same data. Below `md`
// (touch-sized screens), icon on top and a tiny label underneath reads
// better at nav-bar width than five "🗺 MAP"-style inline pairs, which
// either wrap or get squeezed unreadably small; at `md` and up there's
// room for the icon and label to just sit side by side.
export default function NavButton({ icon, label, active, onClick }: Props) {
  const color = active ? "text-gold" : "text-parchment hover:text-gold";

  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2.5 md:px-4 py-1.5 md:py-2 font-display text-[9px] tracking-wide cursor-pointer ${color}`}
    >
      <span className="text-base md:text-xs leading-none">{icon}</span>
      <span className="text-[7px] md:text-[9px] leading-none">{label}</span>
    </button>
  );
}
