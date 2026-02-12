import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AccurancyPercentageCalculator, CalculateWPM, FetchGameData, type Game } from "../utils";
import { getUserStats, type UserStats } from "../services/supabaseData";
import { GameStoreContext } from "./gameStoreContext";

export function GameStoreProvider({ children }: { children: ReactNode }) {
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [game, setGame] = useState<Game>(() => FetchGameData(0));
  const [textVersion, setTextVersion] = useState<number>(0);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [firstLoaded, setFirstLoaded] = useState<boolean>(true);
  const [isUserWindowOpen, setIsUserWindowOpen] = useState<boolean>(false);

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
    setLoadingStats(true);
    setStatsError(null);

    try {
      const data = await getUserStats();
      setStats(data);
    } catch {
      setStatsError("Konnte Stats nicht laden");
    } finally {
      setLoadingStats(false);
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
      isUserWindowOpen,
      setIsUserWindowOpen,
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
      isUserWindowOpen,
      setIsUserWindowOpen,
    ]
  );

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}
