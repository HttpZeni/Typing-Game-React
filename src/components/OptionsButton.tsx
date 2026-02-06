import { useState, type ReactElement } from "react";
import Button from "./Button";
import ButtonSelection from "./ButtonSelection";
import type DropDown from "./DropDown";

type optionValues = ReactElement<typeof Button> | ReactElement<typeof ButtonSelection> | ReactElement<typeof DropDown>;

interface props{
    text?: string,
    onClickFunction?: () => void;
    optionsValue?: optionValues[];
    tooltip?: string;
}

export default function OptionsButton({text, onClickFunction, optionsValue, tooltip}: props){
    const [pressed, setPressed] = useState<boolean>(false);

    const handeClick = () => {
        setPressed(!pressed);
        onClickFunction?.();
    }

    return(
        <div className="relative flex flex-col items-center group/options">
            {/* Options Menu */}
            <div
                className={`absolute bottom-full mb-3 w-fit h-fit p-2 bg-card-bg border-2 border-card-border rounded-xl shadow-card flex flex-row gap-2 backdrop-blur-sm transition-all duration-200 ${
                    pressed ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none" }`}>
                {optionsValue?.map((item, index) => (
                    <div key={index}>
                        {item}
                    </div>
                ))}
            </div>

            {tooltip && !pressed && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-card-bg border-2 border-accent-primary rounded-lg shadow-glow-purple opacity-0 invisible group-hover/options:opacity-100 group-hover/options:visible transition-all duration-300 delay-500 whitespace-nowrap pointer-events-none z-50">
                    <span className="text-accent-primary text-sm font-display font-bold tracking-wide">
                        {tooltip}
                    </span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5">
                        <div className="border-8 border-transparent border-t-accent-primary"></div>
                    </div>
                </div>
            )}

            {/* Button */}
            <button 
                onClick={handeClick} 
                className={`w-9 h-9 bg-card-bg rounded-lg border-2 transition-all duration-200 font-display font-semibold active:scale-95 ${ pressed 
                        ? 'border-accent-primary text-accent-primary shadow-glow-purple' 
                        : 'border-card-border text-text-primary hover:border-accent-primary hover:text-accent-primary hover:shadow-glow-purple'
                } ${pressed ? 'bg-game-bg-light' : 'hover:bg-game-bg-light'}`}
            >
                {text}
            </button>
        </div>
    )
}
