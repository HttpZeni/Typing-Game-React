export type { Game, GameSettings, LineGraphPoint, Settings, TextLength } from "./fetchData";
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
} from "./fetchData";

export { get_text } from "./fetchText";
export { UpdateText } from "./tools";
export { AccurancyPercentageCalculator } from "./AccurancyPercentageCalculator";
export { CalculateWPM } from "./wpmCalculator";
