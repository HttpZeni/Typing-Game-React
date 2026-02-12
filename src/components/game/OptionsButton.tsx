import { useMemo, useRef, useState, type ReactElement, type ComponentProps, isValidElement, cloneElement } from "react";
import { createPortal } from "react-dom";
import ButtonSelection from "../ui/ButtonSelection";
import Tooltip from "../ui/Tooltip";
import ClickOuside from "../../utils/ClickOutside";

interface props{
    text?: string,
    onClickFunction?: () => void;
    optionsValue?: ReactElement[];
    tooltip?: string;
    itemsPerRow?: number;
}

export default function OptionsButton({text, onClickFunction, optionsValue, tooltip, itemsPerRow}: props){
    const [pressed, setPressed] = useState<boolean>(false);
    const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    
    const handeClick = () => {
        if (!pressed && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            setMenuPos({
                top: buttonRect.top - 12,
                left: buttonRect.left + buttonRect.width / 2,
            });
        }
        setPressed(!pressed);
        onClickFunction?.();
    }
    
    const itemsPerRowSafe = typeof itemsPerRow === "number" && itemsPerRow > 0 ? Math.floor(itemsPerRow) : undefined;
    
    const isButtonSelection = (
        element: ReactElement
    ): element is ReactElement<ComponentProps<typeof ButtonSelection>> =>
        isValidElement(element) && element.type === ButtonSelection;

    const portalRoot = useMemo(() => {
        if (typeof document === "undefined") return null;
        return document.getElementById("portal-root") ?? document.body;
    }, []);

    return(
        <ClickOuside  setIsOpen={setPressed} target={containerRef} ignore={[menuRef]}>
            <div ref={containerRef} className="relative z-50 flex flex-col items-center group/options">
                {pressed && portalRoot && createPortal(
                    <div
                        ref={menuRef}
                        style={{ position: "fixed", top: menuPos.top, left: menuPos.left, transform: "translate(-50%, -100%)" }}
                        className="z-[9999] w-fit h-fit p-2 bg-card-bg border-2 border-card-border rounded-xl shadow-card backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out origin-bottom opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    >
                            <div className="flex flex-col gap-2">
                                {optionsValue?.map((item, index) => {
                                    if (isButtonSelection(item) && itemsPerRowSafe) {
                                        return cloneElement(item, { 
                                            key: index,
                                            itemsPerRow: itemsPerRowSafe 
                                        });
                                    }
                                    return <div key={index}>{item}</div>;
                                })}
                            </div>
                        </div>,
                        portalRoot
                )}
                <Tooltip content={tooltip ?? ""} disabled={!tooltip || pressed}>
                    <button
                        ref={buttonRef}
                        onClick={handeClick} 
                        className={`w-9 h-9 bg-card-bg rounded-lg border-2 font-display font-semibold active:scale-95 transition-all duration-200 ${ 
                            pressed 
                                ? 'border-accent-primary text-accent-primary shadow-glow-purple -rotate-90' 
                                : 'border-card-border text-text-primary hover:border-accent-primary hover:text-accent-primary hover:shadow-glow-purple rotate-0'
                        } ${pressed ? 'bg-game-bg-light' : 'hover:bg-game-bg-light'}`}
                    >
                        {text}
                    </button>
                </Tooltip>
            </div>
        </ClickOuside>
    )
}
