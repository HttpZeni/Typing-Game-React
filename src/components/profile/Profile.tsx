import { useEffect, useRef, useState } from "react";
import Window from "../layout/Window";
import Button from "../ui/Button";
import OptionsButton from "../game/OptionsButton";
import Input from "../ui/Input";
import { Graph } from "../game/Graph";
import { FetchGameData, type Game } from "../../services/fetchData";
import DropDown from "../ui/DropDown";
import { logOut } from "../../services/supabaseData";
import { changeUsername, getUsername, getUserSettings, changeProfilePicture } from "../../services/supabaseData";
import { getLocalItem, removeLocalItem } from "../../storage/localStorage";
import { reloadWindowOpen } from "../game/Reload";
import FileUploader from "./FileUploader";

export default function Profile(){
    const [open, setOpen] = useState<boolean>(false);
    const [showSettingsWindow, setShowSettingsWindow] = useState<boolean>(false);
    const [changeCurrentUsername, setChangeCurrentUsername] = useState<boolean>(false);
    const [newUsername, setNewUsername] = useState<string>("");
    const game = useRef<Game>(FetchGameData(0));
    const [username, setUsername] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        let alive = true;
        getUsername().then((name) => {
            if (alive) setUsername(name);
        });
        getUserSettings()
            .then((settings) => {
                if (alive) setProfilePicture(settings.profilePicture ?? null);
            })
            .catch((error) => {
                console.log("Error loading user settings: ", error);
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
            .catch((error) => {
                console.log("Error updating profile picture: ", error);
            });
    }, [file])

    const handleClick = () => {
        setOpen(!open);
    }

    const handleLogOutBtn = async () => {
        await logOut();
        window.location.reload();
    }

    const handleInput = (value: string) => {
        setNewUsername(value);
    }

    const handleInputSubmit = async () => {
        await changeUsername(newUsername.trim());
        setChangeCurrentUsername(false);
        reloadWindowOpen();
    }

    const windowValue = (
        <div className="flex flex-row gap-x-10 h-full"> 
            <div className="w-1/4 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <div className="w-full aspect-square">
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
                            data={game.current.LineGraphDataSet.map((p) => ({ x: p.Seconds, y: p.WPM }))}
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
                <img src={profilePicture == null ? "https://i.pinimg.com/736x/8c/8f/aa/8c8faaee152db00384e06d3365cae0b9.jpg" : profilePicture} alt="Profile pic" className="rounded-full" />
            </button>

            <Window open={open} value={windowValue} width={60} height={70} className="motion-preset-blur-up-lg"/>
        </>
    )
}
