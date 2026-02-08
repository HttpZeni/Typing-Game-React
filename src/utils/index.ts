export type { Game, GameSettings, LineGraphPoint, Settings, TextLength } from "../services/fetchData";
export {
  FetchGameData,
  FetchGameSettingsData,
  FetchSettingsData,
  SubscribeDataChanges,
  SubscribeGameDataChanges,
  SubscribeGameSettingsChanges,
  UpdateGameData,
  UpdateGameSettingsData,
  UpdateGraphDataSet,
  UpdateSettingsData,
} from "../services/fetchData";

export { get_text } from "../services/fetchText";
export { UpdateText } from "./tools";
export { AccurancyPercentageCalculator } from "./AccuracyPercentageCalculator";
export { CalculateWPM } from "./wpmCalculator";
