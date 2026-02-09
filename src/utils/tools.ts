import { FetchGameSettingsData, FetchSettingsData, UpdateGameSettingsData } from "../services/fetchData";
import { get_text } from "../services/fetchText";
import type { Round } from "../services/supabaseData";

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

export function GetAllThemes(): Array<string>{
    const classNames = new Array<string>;

    for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
            rules = sheet.cssRules;
        } catch {
            continue;
        }

        for (const rule of Array.from(rules)){
            if (rule instanceof CSSStyleRule) {
                const selectors = rule.selectorText.split(",");
                for (const sel of selectors) {
                    const trimmed = sel.trim();
                    if (trimmed.startsWith(".theme")) {
                        classNames.push(trimmed.slice(1));
                    }
                }
            }
        }
    }
    return classNames;
}

function average(arr: number[]){
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function CalculateAverageAcc(ListOfGames: Round[] | undefined): number | undefined{
    if (ListOfGames === undefined) return undefined;
    const accArr: number[] = [];
    for (const game of ListOfGames){
        accArr.push(game.accuracy);     
    }
    return average(accArr);
}

export function CalculateAverageWPM(ListOfGames: Round[] | undefined): number | undefined{
    if (ListOfGames === undefined) return undefined;
    const wpmArr: number[] = [];
    for (const game of ListOfGames){
        wpmArr.push(game.wpm);     
    }
    return average(wpmArr);
}

export function CalculateBestWPM(ListOfGames: Round[] | undefined): number[] | undefined{
    if (ListOfGames === undefined) return undefined;
    const wpmTimeArr = [];
    for (const game of ListOfGames){
        wpmTimeArr.push([game.wpm, game.time, game.errorLetters.length]);     
    }
    let bestTry = 0;
    let bestTryWpmTime = [0, 0];
    for (const round of wpmTimeArr){
        const average = (round[0] / round[1]) - round[2];
        if (average > bestTry){
            bestTry = average
            bestTryWpmTime = round;
        }
    }
    return bestTryWpmTime;
}

export function CalculateErrorHotspots(ListOfGames: Round[] | undefined): Record<string, number> | undefined {
  if (!ListOfGames || ListOfGames.length === 0) return undefined;

  const map: Record<string, number> = {};
  for (const round of ListOfGames) {
    for (const letter of round.errorLetters) {
      map[letter] = (map[letter] ?? 0) + 1;
    }
  }

  let bestKey = "";
  let bestVal = 0;
  for (const key in map) {
    const val = map[key];
    if (val > bestVal) {
      bestVal = val;
      bestKey = key;
    }
  }

  return { [bestKey]: bestVal };
}

export function CalculateStreak(ListOfGames: Round[] | undefined): number{
    if (ListOfGames === undefined) return 0;
    return ListOfGames.length + 1;
}
