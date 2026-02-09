
import rawData from "../data/data.json";

export type LineGraphPoint = {
    gameIndex: number;
    Seconds: number;
    WPM: number;
};

export type TextLength = "short" | "medium" | "long";

export type Game = {
    Seconds: number;
    Minutes: number;
    Accurancy: number;
    Character: number;
    CorrectCharacter: number;
    WPM: number;
    Errors: number;
    ErrorLetters: string[];
    LineGraphDataSet: LineGraphPoint[];
};

export type GameSettings = {
    CurrentText: string;
    CurrentTitle: string;
    Timer: number;
};

export type Settings = {
    Text: {
        Length: TextLength;
    };
};

type DataItem = { Game: Game; GameSettings: GameSettings; Settings: Settings };
type Data = DataItem[];

const data = rawData as Data;

type DataChangeSubscriber = () => void;

const dataChangeSubscribers = new Set<DataChangeSubscriber>();
const gameDataChangeSubscribers = new Set<DataChangeSubscriber>();
const gameSettingsChangeSubscribers = new Set<DataChangeSubscriber>();

function notifySubscribers(subscribers: Set<DataChangeSubscriber>, kind: string) {
    for (const subscriber of subscribers) {
        try {
            subscriber();
        } catch (err) {
            console.error(`${kind} subscriber threw:`, err);
        }
    }
}

function notifyDataChangeSubscribers() {
    notifySubscribers(dataChangeSubscribers, "SubscribeDataChanges");
}

function notifyGameDataChangeSubscribers() {
    notifySubscribers(gameDataChangeSubscribers, "SubscribeGameDataChanges");
    notifyDataChangeSubscribers();
}

function notifyGameSettingsChangeSubscribers() {
    notifySubscribers(gameSettingsChangeSubscribers, "SubscribeGameSettingsChanges");
    notifyDataChangeSubscribers();
}

export function SubscribeDataChanges(subscriber: DataChangeSubscriber): () => void {
    dataChangeSubscribers.add(subscriber);
    return () => {
        dataChangeSubscribers.delete(subscriber);
    };
}

export function SubscribeGameDataChanges(subscriber: DataChangeSubscriber): () => void {
    gameDataChangeSubscribers.add(subscriber);
    return () => {
        gameDataChangeSubscribers.delete(subscriber);
    };
}

export function SubscribeGameSettingsChanges(subscriber: DataChangeSubscriber): () => void {
    gameSettingsChangeSubscribers.add(subscriber);
    return () => {
        gameSettingsChangeSubscribers.delete(subscriber);
    };
}

export function FetchGameData(index: number): Game {
    return data[index].Game;
}

export function UpdateGameData(index: number, value: Partial<Game> = {}): Game {
    const next = (data[index].Game = { ...data[index].Game, ...value });
    notifyGameDataChangeSubscribers();
    return next;
}

export function FetchGameSettingsData(index: number): GameSettings {
    return data[index].GameSettings;
}

export function UpdateGameSettingsData(index: number, value: Partial<GameSettings> = {}): GameSettings | undefined {
    if (index < 0 || index >= data.length) return undefined;
    const next = (data[index].GameSettings = { ...data[index].GameSettings, ...value });
    notifyGameSettingsChangeSubscribers();
    return next;
}

export function FetchSettingsData(index: number): Settings {
    return data[index].Settings;
}

export function UpdateSettingsData(index: number, value: Partial<Settings> = {}): Settings | undefined {
  if (index < 0 || index >= data.length) return undefined;
  const next = (data[index].Settings = { ...data[index].Settings, ...value });
  notifyGameSettingsChangeSubscribers();
  return next;
}

export function UpdateGraphDataSet(index: number, gameIndex: number, seconds: number, WPM: number) {
    data[index].Game.LineGraphDataSet.push({
        gameIndex,
        Seconds: seconds,
        WPM,
    });
    notifyGameDataChangeSubscribers();
}
