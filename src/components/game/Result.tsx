import { StaticResultText } from "./StaticResultText";
import { Graph } from "./Graph";
import { useGameStore } from "../../state";

export function Results() {
    const { game, stats } = useGameStore();
    const lastRound = stats?.rounds?.length ? stats.rounds[stats.rounds.length - 1] : null;
    const wpm = lastRound?.wpm ?? game.WPM;
    const accuracy = lastRound?.accuracy ?? game.Accurancy;
    const errors = lastRound?.errorLetters?.length ?? game.Errors;
    const time = lastRound?.time ?? game.Seconds;

    return (
        <>
            <div className="w-full h-full bg-card-bg border border-card-border rounded-lg shadow-card flex flex-col">
                <div className="w-full h-28 border-b border-card-border flex flex-row items-center justify-around px-12">
                    <StaticResultText text={`${wpm}`} fontSize={42} infoText="WPM" color="text-accent-primary" />
                    <div className="h-16 w-px bg-card-border"></div>
                    <StaticResultText text={`${accuracy}%`} fontSize={42} infoText="ACC" color="text-accent-success" />
                    <div className="h-16 w-px bg-card-border"></div>
                    <StaticResultText text={`${errors}`} fontSize={42} infoText="Errors" color="text-accent-error" />
                    <div className="h-16 w-px bg-card-border"></div>
                    <StaticResultText text={`${time}'s`} fontSize={42} infoText="Time / Seconds" color="text-accent-secondary" />
                </div>
                
                <div className="flex-1 p-10">
                    <Graph
                        data={game.LineGraphDataSet}
                        xKey="Seconds"
                        series={[{ key: "WPM", label: "WPM", fill: true }]}
                        xTitle="TIME (SECONDS)"
                        yTitle="WORDS PER MINUTE"
                        tooltipValueSuffix="WPM"
                        className="border-none shadow-none"
                    />
                </div>
            </div>
        </>
    );
}
