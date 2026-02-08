import type { ReactNode, ComponentProps } from "react";
import { useEffect, useState } from "react";

type props = {
  value: ReactNode
  width?: number | string
  height?: number | string
  bgClass?: string
  borderClass?: string
  open?: boolean
} & ComponentProps<"div">

export default function Window({value, width="fit", height="fit", bgClass="bg-card-bg", borderClass = "border-2 border-card-border", className, open = true}: props){
    const [isRendered, setIsRendered] = useState<boolean>(open);
    const [isClosing, setIsClosing] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            setIsRendered(true);
            setIsClosing(false);
            return;
        }

        if (isRendered) {
            setIsClosing(true);
        }
    }, [open, isRendered]);

    if (!isRendered) return null;

    return(
        <div
            className={`fixed inset-0 z-30 bg-black/20 backdrop-blur-sm flex items-center justify-center ${isClosing ? "animate-fade-out" : "animate-fade-in"}`}
            onAnimationEnd={() => {
                if (isClosing) {
                    setIsClosing(false);
                    setIsRendered(false);
                }
            }}
        >
            <div
            style={{width: `${typeof width === "string" ? width : `${width}%`}`, height: `${typeof height === "string" ? height : `${height}%`}`}}
            className={`relative z-10 w-fit h-fit p-10 rounded-lg ${bgClass} ${borderClass} ${className ?? ""} ${isClosing ? "animate-blur-down" : ""}`}>
                {value}
            </div>
        </div>
    )
}
