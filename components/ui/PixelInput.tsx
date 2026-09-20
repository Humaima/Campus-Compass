type PixelInputProps = {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function PixelInput({
  value,
  onChange,
  placeholder,
  disabled,
}: PixelInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full
        border-4
        border-navy
        p-3
        font-pixel
        text-lg
        placeholder:text-navy/50
        ${disabled ? "bg-cream text-navy/50" : "bg-parchment text-navy"}
      `}
    />
  );
}
