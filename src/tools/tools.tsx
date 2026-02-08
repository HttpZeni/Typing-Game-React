import { FetchGameSettingsData, FetchSettingsData, UpdateGameSettingsData } from "./fetchData";
import { get_text } from "./fetchText";

export function isValidEmail(email: string): boolean {
    for (let i = 0; i < email.length; i++){
        if (email[i] === '@') return true;
    }
    return false;
}

export function UpdateText(){
    const selection = get_text(FetchSettingsData(0).Text.Length);
    UpdateGameSettingsData(0, { CurrentText: selection.text, CurrentTitle: selection.title });

    console.log(`Text: ${FetchGameSettingsData(0).CurrentText}`);
}

export function UpdateTimer(time: number){
    UpdateGameSettingsData(0, { Timer: time});

    console.log(`Timer: ${FetchGameSettingsData(0).Timer}`);
}

export function GenerateRandomId(): number{
    const length: number = Math.round(Math.random() * 15) + 5;
    let number: string = ""
    for (let i = 0; i < length; i++){
        number += Math.floor(Math.random() * 10);
    }
    return parseInt(number);
}