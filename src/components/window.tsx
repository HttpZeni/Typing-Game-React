import type { ReactNode, ComponentProps } from "react";

type props = {
  value: ReactNode
  width?: number | string
  height?: number | string
  bgClass?: string
  borderClass?: string
  open?: boolean
} & ComponentProps<"div">

export default function Window({value, width="fit", height="fit", bgClass="bg-card-bg", borderClass = "border-2 border-card-border", className, open = true}: props){
    if (!open) return null;

    return(
        <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div
            style={{width: `${typeof width === "string" ? width : `${width}%`}`, height: `${typeof height === "string" ? height : `${height}%`}`}}
            className={`relative overflow-visible z-10 w-fit h-fit p-10 rounded-lg ${bgClass} ${borderClass} ${className ?? ""}`}>
                {value}
            </div>
        </div>
    )
}
