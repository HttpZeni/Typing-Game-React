
interface Props {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  defaultValue?: string;
  type?: "text" | "number" | "email" | "password" | "file";
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  onSubmit,
  defaultValue,
  type = "text",
  disabled = false,
  className,
  containerClassName,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
      onSubmit?.();
    }
  };

  return (
    <label className={`flex flex-col gap-1 w-full ${containerClassName ?? ""}`}>
      {label && (
        <span className="text-text-secondary text-xs font-display font-semibold uppercase tracking-wide">
          {label}
        </span>
      )}
      <input
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`bg-card-bg border-2 border-card-border rounded-lg h-10 px-4 transition-all duration-200 hover:border-accent-warning focus:border-accent-primary focus:shadow-glow-purple text-text-primary font-display font-semibold placeholder:text-text-secondary placeholder:opacity-50 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ""}`}
      />
    </label>
  );
}
