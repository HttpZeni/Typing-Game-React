import { useRef, useState } from "react";
import Window from "./window"
import Button from "./Button";
import { Graph } from "./Graph";
import { FetchGameData, type Game } from "../tools/fetchData";
import DropDown from "./DropDown";

export default function Profile(){
    const [open, setOpen] = useState<boolean>(false);
    const [game, setGame] = useState<Game>(() => FetchGameData(0));

    const handleClick = () => {
        setOpen(!open);
    }

    const windowValue = (
        <div className="flex flex-row gap-x-10 h-full"> 
            <div className="w-1/4 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <div className="w-full aspect-square">
                        <img 
                            src="src/assets/images/profile/pfp.jpg" 
                            alt="Profile pic" 
                            className="rounded-full w-full h-full object-cover border-4 border-card-border transition-all duration-700 hover:border-accent-primary hover:scale-105 active:duration-75 active:scale-100 shadow-2xl"/>
                    </div>
                    
                    <div className="group relative flex justify-center items-center p-5 overflow-hidden">
                        <h2 className="text-2xl text-text-primary font-mono font-extrabold tracking-widest transition-all duration-700 group-hover:-translate-x-8 group-hover:tracking-normal">
                            Username
                        </h2>
                        <div className="absolute right-5 opacity-0 translate-x-4 transition-all duration-700 group-hover:opacity-100 group-hover:-translate-x-7">
                            <Button text={"✎"}/>
                        </div>
                    </div>
                    
                    <ul className="list-none pl-0 space-y-2 text-lg text-text-primary font-mono font-extrabold">
                        <li className="flex items-center justify-between">
                            <span>Average Accuracy</span>
                            <span>0</span>
                        </li>
                        <div className="h-px w-full bg-white/80"/>
                        <li className="flex items-center justify-between">
                            <span>Average WPM</span>
                            <span>0</span>
                        </li>
                        <div className="h-px w-full bg-white/80"/>
                        <li className="flex items-center justify-between">
                            <span>Best WPM</span>
                            <span>0</span>
                        </li>
                        <div className="h-px w-full bg-white/80"/>
                        <li className="flex items-center justify-between">
                            <span>Error Hotspots</span>
                            <span>0</span>
                        </li>
                        <div className="h-px w-full bg-white/80"/>
                        <li className="flex items-center justify-between">
                            <span>Streaks</span>
                            <span>0</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="w-3/4 flex flex-col gap-5 min-h-0">
                <div className="flex-[3] flex flex-row gap-x-5 min-h-0">
                    <div className="w-4/6 h-full bg-game-bg-light rounded-md p-5">
                        <DropDown options={["1", "2", "3", "4", "5"]}/>
                        <Graph
                            data={game.LineGraphDataSet.map((p) => ({ x: p.Seconds, y: p.WPM }))}
                            lineLabel="WPM"
                            xTitle="TIME (SECONDS)"
                            yTitle="WORDS PER MINUTE"
                            className="border-none w-full h-[95%] shadow-none"/>
                    </div>
                    <div className="w-2/6 h-full bg-game-bg-light rounded-md">

                    </div>
                </div>
                <div className="flex-[2] bg-game-bg-light rounded-md min-h-0">

                </div>
            </div>
        </div>
    );

    return(
        <>
            <button onClick={handleClick} style={{ width: "15%" }}
                className="relative z-50 m-5 border-2 border-card-border rounded-full transition-all duration-150 hover:border-accent-primary active:scale-90">
                <img src="src/assets/images/profile/pfp.jpg" alt="Profile pic" className="rounded-full" />
            </button>

            <Window open={open} value={windowValue} width={60} height={70} className="motion-preset-blur-up-lg"/>
        </>
    )
}
