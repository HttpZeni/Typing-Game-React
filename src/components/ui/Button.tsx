import type { ReactNode } from "react";

interface props{
    text?: string | ReactNode | Element,
    onClickFunction?: (index?: number) => void;
    pressed?: boolean;
    index?: number;
    tooltip?: string;
    disabled?: boolean
}

export default function Button({ text, onClickFunction, pressed = false, index, tooltip, disabled = false }: props) {
  const handleButton = () => {
    if (disabled) return;
    onClickFunction?.(index);
  };

  const pressedClasses = pressed
    ? "border-accent-primary text-accent-primary shadow-glow-purple bg-game-bg-light"
    : "border-card-border text-text-primary hover:border-accent-primary hover:text-accent-primary hover:shadow-glow-purple hover:bg-game-bg-light";

  return (
    <div className="relative group/button">
      <button
        disabled={disabled}
        aria-pressed={pressed}
        onClick={handleButton}
        className={`w-fit h-9 px-3 bg-card-bg rounded-lg border-2 font-display font-semibold transition-all duration-200 whitespace-nowrap 
        ${disabled 
          ? 'opacity-50 cursor-not-allowed border-card-border text-text-secondary bg-game-bg-dark' 
          : `active:scale-95 ${pressedClasses}`
        }`}
      >
        {text}
      </button>
            
      {tooltip && !disabled && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-card-bg border-2 border-accent-primary rounded-lg shadow-glow-purple opacity-0 invisible group-hover/button:opacity-100 group-hover/button:visible transition-all duration-300 delay-500 whitespace-nowrap pointer-events-none z-50">
          <span className="text-accent-primary text-sm font-display font-bold tracking-wide">
            {tooltip}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5">
            <div className="border-8 border-transparent border-t-accent-primary"></div>
          </div>
        </div>
      )}
    </div>
  )
}