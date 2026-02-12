import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Game } from "../utils";
import type { UserStats } from "../services/supabaseData";

export type GameStoreValue = {
  game: Game;
  setGame: Dispatch<SetStateAction<Game>>;
  isGameStarted: boolean;
  setIsGameStarted: Dispatch<SetStateAction<boolean>>;
  showResults: boolean;
  setShowResults: Dispatch<SetStateAction<boolean>>;
  textVersion: number;
  bumpTextVersion: () => void;
  stats: UserStats | null;
  loadingStats: boolean;
  statsError: string | null;
  firstLoaded: boolean;
  loadStats: () => Promise<void>;
  isUserWindowOpen: boolean;
  setIsUserWindowOpen: Dispatch<SetStateAction<boolean>>;
};

export const GameStoreContext = createContext<GameStoreValue | null>(null);
