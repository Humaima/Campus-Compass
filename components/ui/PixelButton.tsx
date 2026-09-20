type Variant = "gold" | "green" | "brick" | "navy" | "cream";

type PixelButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

const VARIANT_CLASS: Record<Variant, string> = {
  gold: "",
  green: "pixel-button--green",
  brick: "pixel-button--brick",
  navy: "pixel-button--navy",
  cream: "pixel-button--cream",
};

export default function PixelButton({
  children,
  onClick,
  variant = "gold",
  type,
  disabled,
  className = "",
}: PixelButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`pixel-button ${VARIANT_CLASS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
