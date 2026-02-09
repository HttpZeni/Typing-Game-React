import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AccurancyPercentageCalculator, CalculateWPM, FetchGameData, type Game } from "../utils";
import { getUserStats, type UserStats } from "../services/supabaseData";

type GameStoreValue = {
  game: Game;
  setGame: React.Dispatch<React.SetStateAction<Game>>;
  isGameStarted: boolean;
  setIsGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  showResults: boolean;
  setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
  textVersion: number;
  bumpTextVersion: () => void;
  stats: UserStats | null;
  loadingStats: boolean;
  statsError: string | null;
  firstLoaded: boolean;
  loadStats: () => Promise<void>;
};

const GameStoreContext = createContext<GameStoreValue | null>(null);

export function GameStoreProvider({ children }: { children: ReactNode }) {
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [game, setGame] = useState<Game>(() => FetchGameData(0));
  const [textVersion, setTextVersion] = useState<number>(0);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [firstLoaded, setFirstLoaded] = useState<boolean>(true);

  const bumpTextVersion = useCallback(() => setTextVersion((v) => v + 1), []);

  useEffect(() => {
    setGame((prev) => {
      const Minutes = prev.Seconds / 60;
      const WPM = CalculateWPM(prev.Character, Minutes);
      const Errors = prev.Character - prev.CorrectCharacter;
      const Accurancy = AccurancyPercentageCalculator(prev.CorrectCharacter, prev.Character);

      if (
        Minutes === prev.Minutes &&
        WPM === prev.WPM &&
        Errors === prev.Errors &&
        Accurancy === prev.Accurancy
      ) {
        return prev;
      }

      return { ...prev, Minutes, WPM, Errors, Accurancy };
    });
  }, [game.Seconds, game.Character, game.CorrectCharacter]);

  const loadStats = useCallback(async () => {
    let cancelled = false;
    setLoadingStats(true);
    setStatsError(null);

    try {
      const data = await getUserStats();
      if (!cancelled) setStats(data);
    } catch (e) {
      if (!cancelled) setStatsError("Konnte Stats nicht laden");
    } finally {
      if (!cancelled) setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (!showResults) return;
    loadStats();
  }, [showResults, loadStats]);

  useEffect(() => {
    if (!firstLoaded) return;
    setFirstLoaded(false);
  }, [firstLoaded]);

  const value = useMemo(
    () => ({
      game,
      setGame,
      isGameStarted,
      setIsGameStarted,
      showResults,
      setShowResults,
      textVersion,
      bumpTextVersion,
      stats,
      loadingStats,
      statsError,
      firstLoaded,
      loadStats,
    }),
    [
      game,
      isGameStarted,
      showResults,
      textVersion,
      stats,
      loadingStats,
      statsError,
      bumpTextVersion,
      firstLoaded,
      loadStats,
    ]
  );

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore() {
  const ctx = useContext(GameStoreContext);
  if (!ctx) {
    throw new Error("useGameStore must be used within GameStoreProvider");
  }
  return ctx;
}
