import { useLayoutEffect, useMemo, useRef, useState, type ReactElement, type ComponentProps, isValidElement, cloneElement } from "react";
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
    const [menuReady, setMenuReady] = useState<boolean>(false);
    const [menuStyle, setMenuStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    
    const handeClick = () => {
        setPressed(!pressed);
        onClickFunction?.();
    }
    
    const itemsPerRowSafe = typeof itemsPerRow === "number" && itemsPerRow > 0 ? Math.floor(itemsPerRow) : undefined;
    
    const isButtonSelection = (
        element: ReactElement
    ): element is ReactElement<ComponentProps<typeof ButtonSelection>> =>
        isValidElement(element) && element.type === ButtonSelection;

    useLayoutEffect(() => {
        if (!pressed) {
            setMenuReady(false);
            return;
        }

        const button = buttonRef.current;
        const menu = menuRef.current;
        if (!button || !menu) return;

        const buttonRect = button.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();

        let top = buttonRect.top - menuRect.height - 12;
        let left = buttonRect.left + buttonRect.width / 2 - menuRect.width / 2;

        if (top < 8) {
            top = buttonRect.bottom + 12;
        }

        left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));

        setMenuStyle({ top, left });
        setMenuReady(true);
    }, [pressed, itemsPerRowSafe, optionsValue?.length]);

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
                    style={{ position: "fixed", top: menuStyle.top, left: menuStyle.left }}
                    className={`z-[5000] w-fit h-fit p-2 bg-card-bg border-2 border-card-border rounded-xl shadow-card backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out origin-bottom ${
                        menuReady ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                    }`}
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
                        className={`w-9 h-9 bg-card-bg rounded-lg border-2 transition-all duration-200 font-display font-semibold active:scale-95 ${ 
                            pressed 
                                ? 'border-accent-primary text-accent-primary shadow-glow-purple' 
                                : 'border-card-border text-text-primary hover:border-accent-primary hover:text-accent-primary hover:shadow-glow-purple'
                        } ${pressed ? 'bg-game-bg-light' : 'hover:bg-game-bg-light'}`}
                    >
                        {text}
                    </button>
                </Tooltip>
            </div>
        </ClickOuside>
    )
}
