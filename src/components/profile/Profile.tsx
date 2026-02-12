import { useEffect, useMemo, useState } from "react";
import Window from "../layout/Window";
import Button from "../ui/Button";
import OptionsButton from "../game/OptionsButton";
import Input from "../ui/Input";
import { Graph } from "../game/Graph";
import DropDown from "../ui/DropDown";
import { logOut } from "../../services/supabaseData";
import { changeUsername, getUsername, getUserSettings, changeProfilePicture } from "../../services/supabaseData";
import { getLocalItem, removeLocalItem } from "../../storage/localStorage";
import { reloadWindowOpen } from "../game/Reload";
import FileUploader from "./FileUploader";
import { useGameStore } from "../../state";
import { CalculateAverageAcc, CalculateAverageWPM, CalculateBestWPM, CalculateErrorHotspots, CalculateOverallRating, CalculateStreak, SortRoundsArrayByCreated } from "../../utils/tools";
import Tooltip from "../ui/Tooltip";
import MatchHistory from "./MatchHistory";
import { forwardRef } from "react";

const Profile = forwardRef<HTMLDivElement, {}>(function Profile(_, ref) {
    const [showSettingsWindow, setShowSettingsWindow] = useState<boolean>(false);
    const [changeCurrentUsername, setChangeCurrentUsername] = useState<boolean>(false);
    const [newUsername, setNewUsername] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const { isUserWindowOpen: open, setIsUserWindowOpen: setOpen, stats, loadStats } = useGameStore();
    const [currentGraph, setCurrentGraph] = useState<string>("WpmGraph");

    const userStats = useMemo(() => {
        const rounds = SortRoundsArrayByCreated(stats?.rounds ?? []);
        const hotspot = CalculateErrorHotspots(rounds);
        return {
            "Overall Rating": CalculateOverallRating(rounds),
            "Average Acc": CalculateAverageAcc(rounds),
            "Average WPM": CalculateAverageWPM(rounds),
            "Best WPM": CalculateBestWPM(rounds)?.[0] ?? 0,
            "Best Time": CalculateBestWPM(rounds)?.[1] ?? 0,
            "Error Hotspots": Object.keys(hotspot ?? {})[0] ?? "",
            "Streaks": CalculateStreak(rounds)
        };
    }, [stats]);

    useEffect(() => {
        let alive = true;
        getUsername().then((name) => {
            if (alive) setUsername(name);
        });
        getUserSettings()
            .then((settings) => {
                if (alive) setProfilePicture(settings.profilePicture ?? null);
            })
            .catch(() => {
                // TODO: handle user settings load error.
            });
        if (getLocalItem("open-profile-on-load") === "true") {
            setOpen(true);
            removeLocalItem("open-profile-on-load");
        }
        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        if (file === null) return;
        changeProfilePicture(file)
            .then((url) => {
                if (url) setProfilePicture(url);
            })
            .catch(() => {
                // TODO: handle profile picture update error.
            });
    }, [file])

    useEffect(() => {
        if (!open) return;
        loadStats();
    }, [open, loadStats]);

    const handleClick = () => {
        setOpen(!open);
    }

    const handleLogOutBtn = async () => {
        const result = await logOut();
        if (result?.status === "error") {
            // TODO: handle logout error.
        }
    }

    const handleInput = (value: string) => {
        setNewUsername(value);
    }

    const handleInputSubmit = async () => {
        await changeUsername(newUsername.trim());
        setChangeCurrentUsername(false);
        reloadWindowOpen();
    }

    const rounds = SortRoundsArrayByCreated(stats?.rounds ?? []).map((r) => ({ ...r, errorCount: r.errorLetters.length }));

    const WpmGraph = (
        <Graph
            data={rounds}
            xKey={(_, i) => `Round ${i + 1}`}
            series={[{ key: "wpm", label: "WPM", fill: true }]}
            xTitle="Rounds"
            yTitle="WPM"
            height="95%"
            width="100%"
            tooltipValueSuffix="WPM"
            className="border-none shadow-none"
        />
    );

    const AccGraph = (
        <Graph
            data={rounds}
            xKey={(_, i) => `Round ${i + 1}`}
            series={[{ key: "accuracy", label: "Accuracy", fill: true }]}
            xTitle="Rounds"
            yTitle="Accuracy"
            height="95%"
            width="100%"
            tooltipValueSuffix="%"
            className="border-none shadow-none"
        />
    );

    const TimeGraph = (
        <Graph
            data={rounds}
            xKey={(_, i) => `Round ${i + 1}`}
            series={[{ key: "time", label: "Time", fill: true }]}
            xTitle="Rounds"
            yTitle="Time"
            height="95%"
            width="100%"
            tooltipValueSuffix="'s'"
            className="border-none shadow-none"
        />
    );

    const ErrorLettersGraph = (
        <Graph
            data={rounds}
            xKey={(_, i) => `Round ${i + 1}`}
            series={[{ key: `errorCount`, label: "ErrorLetters", fill: true }]}
            xTitle="Rounds"
            yTitle="Errors"
            height="95%"
            width="100%"
            tooltipValueSuffix="Error's"
            className="border-none shadow-none"
        />
    );

    const handleGraphDropDown = (graph: string) => {
        setCurrentGraph(graph);
        // TODO: remove or replace debug output for graph change.
    }

    const windowValue = (
        <div ref={ref ? ref : undefined} className="flex flex-row gap-x-10 h-full"> 
            <div className="w-1/4 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <div className="w-full aspect-square relative overflow-visible">
                        <div className="absolute z-50 -m-5">
                            <OptionsButton tooltip="Settings" onClickFunction={() => setShowSettingsWindow(!showSettingsWindow)} text="⚙︎" optionsValue={[
                                <Button text="Log Out" onClickFunction={handleLogOutBtn}/>
                            ]}/>
                        </div>
                        <div className="relative group">
                            <img 
                                src={profilePicture == null ? "https://i.pinimg.com/736x/8c/8f/aa/8c8faaee152db00384e06d3365cae0b9.jpg" : profilePicture} 
                                alt="Profile pic" 
                                className="rounded-full w-full h-full object-cover border-4 border-card-border transition-all duration-700 group-hover:scale-105 shadow-2xl"/>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                                <FileUploader text="✎" setFile={setFile}/>
                            </div>
                        </div>
                    </div>
                    
                    <div className="group relative flex justify-center items-center p-5 overflow-hidden">
                        {changeCurrentUsername ?  
                        <Input value={newUsername} onSubmit={handleInputSubmit} onChange={handleInput}/>
                        : 
                        <h2 className="text-2xl text-text-primary font-mono font-extrabold tracking-widest transition-all duration-700 group-hover:-translate-x-8 group-hover:tracking-normal">
                            {username}
                        </h2>
                        }

                        <div className="absolute right-5 opacity-0 translate-x-4 transition-all duration-700 group-hover:opacity-100 group-hover:-translate-x-7">
                            {changeCurrentUsername ? null : <Button onClickFunction={() => setChangeCurrentUsername(true)} text={"✎"}/>}
                        </div>
                    </div>
                    
                    <ul className="list-none pl-0 space-y-2 text-lg text-text-primary font-mono font-extrabold">
                        <li className="flex items-center justify-between">
                            <Tooltip content="Overall rating from speed, accuracy and error rate.">
                                <span className="cursor-default">Overall Rating</span>
                            </Tooltip>
                            <span>{userStats["Overall Rating"] !== undefined ? userStats["Overall Rating"] : 0} / 10</span>
                        </li>
                        <div className="h-px w-full bg-white/80"/>
                        <li className="flex items-center justify-between">
                            <Tooltip content="The average accuracy this player has.">
                                <span className="cursor-default">Average Accuracy</span>
                            </Tooltip>
                            <span>{userStats["Average Acc"] !== undefined ? Math.round(userStats["Average Acc"] * 100) / 100 : 0}%</span>
                        </li>
                        <div className="h-px w-full bg-white/80"/>
                        <li className="flex items-center justify-between">
                            <Tooltip content="The average words per minute this player has.">
                                <span className="cursor-default">Average WPM</span>
                            </Tooltip>
                            <span>{userStats["Average WPM"] !== undefined ? Math.round(userStats["Average WPM"] * 100) / 100 : 0}</span>
                        </li>
                        <div className="h-px w-full bg-white/80"/>
                        <li className="flex items-center justify-between">
                            <Tooltip content="The best WPM this player had.">
                                <span className="cursor-default">Best WPM</span>
                            </Tooltip>
                            <Tooltip content={`This player got ${userStats["Best WPM"]} WPM in ${userStats["Best Time"]} seconds!`}>
                                <span>{userStats["Best WPM"]}</span>
                            </Tooltip>
                        </li>
                        <div className="h-px w-full bg-white/80"/>
                        <li className="flex items-center justify-between">
                            <Tooltip content="The letter the player misstypes the most.">
                                <span className="cursor-default">Error Hotspots</span>
                            </Tooltip>
                            <span>{userStats["Error Hotspots"]}</span>
                        </li>
                        <div className="h-px w-full bg-white/80"/>
                        <li className="flex items-center justify-between">
                            <Tooltip content="How many plays this payer has.">
                                <span className="cursor-default">Streak</span>
                            </Tooltip>
                            <span>{userStats["Streaks"]}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="w-3/4 flex flex-col gap-5 min-h-0">
                <div className="flex-[3] flex flex-row gap-x-5 min-h-0">
                    <div className="w-full h-full bg-game-bg-light rounded-md p-5 pl-0">
                        <div className="w-fit h-fit flex items-center justify-center ml-5">
                            <DropDown options={["WpmGraph" ,"AccGraph", "TimeGraph", "ErrorLettersGraph"]} value={currentGraph} onChange={(value) => handleGraphDropDown(value)}/>
                        </div>
                            {currentGraph === "WpmGraph" && WpmGraph}
                            {currentGraph === "AccGraph" && AccGraph}
                            {currentGraph === "TimeGraph" && TimeGraph}
                            {currentGraph === "ErrorLettersGraph" && ErrorLettersGraph}
                    </div>
                </div>
                <div className="flex-[2] bg-game-bg-light rounded-md min-h-0">
                    <MatchHistory rounds={SortRoundsArrayByCreated(stats?.rounds ?? [])}/>
                </div>
            </div>
        </div>
    );

    return(
        <>
            <button onClick={handleClick} style={{ width: "15%" }}
                className="relative z-50 m-5 border-2 border-card-border rounded-full transition-all duration-150 hover:border-accent-primary active:scale-90">
                <img src={profilePicture == null ? "https://i.pinimg.com/736x/8c/8f/aa/8c8faaee152db00384e06d3365cae0b9.jpg" : profilePicture} alt="Profile pic" className="rounded-full" />
            </button>

            <Window open={open} value={windowValue} width={65} height={70} className="motion-preset-blur-up-lg"/>
        </>
    )
});

export default Profile;
