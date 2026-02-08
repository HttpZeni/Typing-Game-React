type infoPlaceOptions = "Top" | "Bottom";
interface Props {
    text: string
    infoText?: string
    fontSize?: number
    infoFontSize?: number
    infoPlace?: infoPlaceOptions
    color?: string
}

export function StaticResultText({ text, fontSize = 30, infoText, infoFontSize = 12, infoPlace = "Bottom", color = "text-text-primary" }: Props) {

    const textNode = (
        <p style={{ fontSize }} className={`${color} font-bold`}>
            {text}
        </p>
    );

    const infoNode = (
        <p style={{ fontSize: `${infoFontSize}px` }} className="text-text-secondary font-bold uppercase tracking-wider">
            {infoText}
        </p>
    );

    return (
        <div className="flex flex-col">
            {infoPlace == "Bottom" ? textNode : infoNode}
            {infoPlace == "Top" ? textNode : infoNode}
        </div>
    )
}