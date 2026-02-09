import Button from "../ui/Button"
import OptionsButton from "../game/OptionsButton"
import ButtonSelection from "../ui/ButtonSelection"
import { FetchSettingsData, UpdateGameSettingsData, UpdateSettingsData } from "../../services/fetchData"
import type { TextLength } from "../../services/fetchData";
import { UpdateText, UpdateTimer } from "../../utils/tools";
import DropDown from "../ui/DropDown";
import { getAllTitle, getTextByTitle } from "../../services/fetchText";
import { useEffect, useState } from "react";
import { GetAllThemes } from "../../utils/tools";
import { setLocalItem, getLocalItem } from "../../storage/localStorage";
import { reload } from "../game/Reload";
import { useGameStore } from "../../state";

export default function Toolbar(){
    const { bumpTextVersion } = useGameStore();
    const [themes, setThemes] = useState<string[]>();

    useEffect(() => {
        setThemes(GetAllThemes());
        if (getLocalItem("theme") === undefined){
            setLocalItem("theme", "theme-earthy-earth");
        }
        if (getLocalItem("theme-index") ===  ""){
            setLocalItem("theme-index", "0");
        }
        
        console.log(`Theme: ${getLocalItem("theme")}\nTheme-Index: ${getLocalItem("theme-index")}`)
    }, [])

    useEffect(() => {
        console.log("Themes: ", themes);
    }, [themes])

    const handleThemeBtn = (theme: string, themeIndex: string) => {
        setLocalItem("theme", theme);
        setLocalItem("theme-index", themeIndex);
        reload();
    }

    const UpdateTextData = (length: TextLength) => {
        UpdateSettingsData(0, { Text: { Length: length}});
        UpdateText();
        bumpTextVersion();
    }

    const UpdateTimeData = (time: number) => {
        UpdateTimer(time);
    }

    const handleTextDropDown = (value: string) => {
        const allTitle = getAllTitle();
        if (!value || allTitle.length === 0) return;
        const currentTitle = value;
        const length = FetchSettingsData(0).Text.Length;
        const randomTitle = allTitle[Math.floor(Math.random() * allTitle.length)];
        const title = currentTitle === "Random" ? randomTitle : currentTitle;
        const selection = getTextByTitle(title, length);
        const text: string = selection?.text ?? "Something went wrong! Text not found!";
        UpdateGameSettingsData(0, { CurrentTitle: title });
        UpdateGameSettingsData(0, { CurrentText: text });
    }

    return(
        <>
            <div className="w-full h-14 bg-card-bg border-2 border-card-border rounded-xl shadow-card flex flex-row items-center gap-3 px-2 backdrop-blur-sm">
                <OptionsButton text="☰" tooltip="Text options" 
                optionsValue={[<ButtonSelection children={[<Button index={0} text="Short" onClickFunction={() => UpdateTextData("short")}/>, 
                <Button index={1} text="Middle" onClickFunction={() => UpdateTextData("medium")}/>, 
                <Button index={2} text="Long" onClickFunction={() => UpdateTextData("long")}/>,
                <DropDown label="" options={["Random", ...getAllTitle()]} onChange={handleTextDropDown}/>]} defaultSelect={0}/>]}/>
                
                <OptionsButton text="⏱" tooltip="Timer options" 
                optionsValue={[<ButtonSelection children={[<Button index={0} text="15's" onClickFunction={() => UpdateTimeData(15)} tooltip="Set a timer too 15 seconds."/>, 
                <Button index={1} text="30's" onClickFunction={() => UpdateTimeData(30)} tooltip="Set a timer too 30 seconds."/>, 
                <Button index={2} text="60's" onClickFunction={() => UpdateTimeData(60)} tooltip="Set a timer too 60 seconds."/>, 
                <Button index={3} text="∞" onClickFunction={() => UpdateTimeData(-1)} tooltip="Set a timer that runs until u finished typing."/> ]}defaultSelect={3}/>]}/>

                <OptionsButton text="⏹" tooltip="Theme" itemsPerRow={themes !== undefined ? Math.floor(themes.length / 2) : 10}
                optionsValue={[
                    <ButtonSelection children={themes !== undefined ? themes.map((theme, index) => (
                        <Button key={index} text="" className={` h-10 ${theme} text-accent-primary`} onClickFunction={() => handleThemeBtn(theme, `${index}`)}/>
                    ))
                    :
                    [<Button/>, <Button/>]
                } defaultSelect={parseInt(getLocalItem("theme-index"))}/>
                ]}/>
            </div>
        </>
    )   
}
