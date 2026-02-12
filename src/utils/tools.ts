import { FetchSettingsData, UpdateGameSettingsData } from "../services/fetchData";
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
    // TODO: consider telemetry for text updates.
}

export function UpdateTimer(time: number){
    UpdateGameSettingsData(0, { Timer: time});
    // TODO: consider telemetry for timer updates.
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

export function CalculateBestWPM(ListOfGames: Round[] | undefined): number[] | undefined {
  if (!ListOfGames || ListOfGames.length === 0) return undefined;

  let bestScore = -Infinity;
  let best: [number, number, number] = [0, 0, 0];

  for (const game of ListOfGames) {
    const errorPenalty = game.errorLetters.length * 0.5;
    const textLen = game.text?.length ?? 0;
    if (textLen > 0 && errorPenalty >= (textLen / 6)) continue;
    const score = game.wpm - errorPenalty;

    if (score > bestScore) {
      bestScore = score;
      best = [game.wpm, game.time, errorPenalty];
    }
  }

  return best;
}

export function CalculateErrorHotspots(ListOfGames: Round[] | undefined): Record<string, number> | undefined {
  if (!ListOfGames || ListOfGames.length === 0) return undefined;

  let found = false;

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
      found = true;
    }
  }

  return found ? {[bestKey]: bestVal} : undefined;
}

export function CalculateStreak(ListOfGames: Round[] | undefined): number{
    if (ListOfGames === undefined) return 0;
    return ListOfGames.length;
}

export function SortRoundsArrayByCreated(Rounds: Round[]): Array<Round>{
    return [...Rounds].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function RateRound(round: Round): number | undefined{
    if (round == undefined) return;

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const textLength = round.text?.length ?? 0;
    const errorRate = round.errorLetters.length / Math.max(textLength, 1);

    const accuracyScore = clamp(round.accuracy / 100, 0, 1) * 6;
    const speedScore = clamp(round.wpm / 120, 0, 1) * 3;
    const errorScore = clamp(1 - errorRate * 3, 0, 1) * 1;

    const rating = accuracyScore + speedScore + errorScore;
    return Number(rating.toFixed(2));
}

export function CalculateOverallRating(ListOfGames: Round[] | undefined): number | undefined{
    if (ListOfGames === undefined || ListOfGames.length === 0) return;

    let overallRating = 0;
    let validRounds = 0;

    for (const game of ListOfGames){
        const roundRating = RateRound(game);
        if (roundRating === undefined) continue;
        overallRating += roundRating;
        validRounds++;
    }

    if (validRounds === 0) return;
    return Number((overallRating / validRounds).toFixed(2));
}
