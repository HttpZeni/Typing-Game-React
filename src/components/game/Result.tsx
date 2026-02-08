import { StaticResultText } from "./StaticResultText";
import { Graph } from "./Graph";

import type { Game } from "../../services/fetchData";

interface props {
    setShowResults?: React.Dispatch<React.SetStateAction<boolean>>;
    game: Game;
}

export function Results({ game }: props) {

    return (
        <>
            <div className="w-full h-full bg-card-bg border border-card-border rounded-lg shadow-card flex flex-col">
                <div className="w-full h-28 border-b border-card-border flex flex-row items-center justify-around px-12">
                    <StaticResultText text={`${game.WPM}`} fontSize={42} infoText="WPM" color="text-accent-primary" />
                    <div className="h-16 w-px bg-card-border"></div>
                    <StaticResultText text={`${game.Accurancy}%`} fontSize={42} infoText="ACC" color="text-accent-success" />
                    <div className="h-16 w-px bg-card-border"></div>
                    <StaticResultText text={`${game.Errors}/${game.Character}`} fontSize={42} infoText="Errors" color="text-accent-error" />
                    <div className="h-16 w-px bg-card-border"></div>
                    <StaticResultText text={`${game.Seconds}'s`} fontSize={42} infoText="Time / Seconds" color="text-accent-secondary" />
                </div>
                
                <div className="flex-1 p-10">
                    <Graph
                        data={game.LineGraphDataSet.map((p) => ({ x: p.Seconds, y: p.WPM }))}
                        lineLabel="WPM"
                        xTitle="TIME (SECONDS)"
                        yTitle="WORDS PER MINUTE"
                    />
                </div>
            </div>
        </>
    );
}
