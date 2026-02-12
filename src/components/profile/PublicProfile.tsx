import { useCallback, useEffect, useMemo, useState } from "react";
import Window from "../layout/Window";
import Button from "../ui/Button";
import DropDown from "../ui/DropDown";
import { Graph } from "../game/Graph";
import MatchHistory from "./MatchHistory";
import Tooltip from "../ui/Tooltip";
import { CalculateAverageAcc, CalculateAverageWPM, CalculateBestWPM, CalculateErrorHotspots, CalculateOverallRating, CalculateStreak, SortRoundsArrayByCreated } from "../../utils/tools";
import { getUserSettingsById, getUserStatsByUserId, getUsernameByUserId, type UserStats } from "../../services/supabaseData";

type Props = {
  userId: string;
  open: boolean;
  onClose: () => void;
};

export default function PublicProfile({ userId, open, onClose }: Props) {
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentGraph, setCurrentGraph] = useState<string>("WpmGraph");

  const loadProfile = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const [name, settings, userStats] = await Promise.all([
        getUsernameByUserId(userId),
        getUserSettingsById(userId),
        getUserStatsByUserId(userId),
      ]);
      setUsername(name);
      setProfilePicture(settings.profilePicture ?? null);
      setStats(userStats);
    } catch {
      // TODO: handle public profile load error.
    } finally {
      setLoading(false);
    }
  }, [open, userId]);

  useEffect(() => {
    let alive = true;
    if (!open) return;
    (async () => {
      await loadProfile();
      if (!alive) return;
    })();
    return () => {
      alive = false;
    };
  }, [open, loadProfile]);

  const rounds = SortRoundsArrayByCreated(stats?.rounds ?? []).map((r) => ({ ...r, errorCount: r.errorLetters.length }));

  const userStats = useMemo(() => {
    const sortedRounds = SortRoundsArrayByCreated(stats?.rounds ?? []);
    const hotspot = CalculateErrorHotspots(sortedRounds);
    return {
      "Overall Rating": CalculateOverallRating(sortedRounds),
      "Average Acc": CalculateAverageAcc(sortedRounds),
      "Average WPM": CalculateAverageWPM(sortedRounds),
      "Best WPM": CalculateBestWPM(sortedRounds)?.[0] ?? 0,
      "Best Time": CalculateBestWPM(sortedRounds)?.[1] ?? 0,
      "Error Hotspots": Object.keys(hotspot ?? {})[0] ?? "",
      "Streaks": CalculateStreak(sortedRounds),
    };
  }, [stats]);

  const WpmGraph = (
    <Graph
      data={rounds}
      xKey={(_, i) => `Round ${i + 1}`}
      series={[{ key: "wpm", label: "WPM", fill: true }]}
      xTitle="Rounds"
      yTitle="WPM"
      height="95%"
      width="100%"
      tooltipValueSuffix="WPM"
      className="border-none shadow-none"
    />
  );

  const AccGraph = (
    <Graph
      data={rounds}
      xKey={(_, i) => `Round ${i + 1}`}
      series={[{ key: "accuracy", label: "Accuracy", fill: true }]}
      xTitle="Rounds"
      yTitle="Accuracy"
      height="95%"
      width="100%"
      tooltipValueSuffix="%"
      className="border-none shadow-none"
    />
  );

  const TimeGraph = (
    <Graph
      data={rounds}
      xKey={(_, i) => `Round ${i + 1}`}
      series={[{ key: "time", label: "Time", fill: true }]}
      xTitle="Rounds"
      yTitle="Time"
      height="95%"
      width="100%"
      tooltipValueSuffix="'s'"
      className="border-none shadow-none"
    />
  );

  const ErrorLettersGraph = (
    <Graph
      data={rounds}
      xKey={(_, i) => `Round ${i + 1}`}
      series={[{ key: "errorCount", label: "ErrorLetters", fill: true }]}
      xTitle="Rounds"
      yTitle="Errors"
      height="95%"
      width="100%"
      tooltipValueSuffix="Error's"
      className="border-none shadow-none"
    />
  );

  const windowValue = (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div className="text-sm font-display uppercase tracking-[0.3em] text-text-secondary">
          Public Profile
        </div>
        <div className="flex items-center gap-2">
          <Button text={loading ? "Refreshing..." : "Refresh"} onClickFunction={() => { void loadProfile(); }} />
          <Button text="Close" onClickFunction={onClose} />
        </div>
      </div>

      {loading ? (
        <div className="text-text-secondary font-display">Loading profile...</div>
      ) : (
        <div className="flex flex-row gap-x-10 h-full min-h-0">
          <div className="w-1/4 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="w-full aspect-square">
                <img
                  src={profilePicture == null ? "https://i.pinimg.com/736x/8c/8f/aa/8c8faaee152db00384e06d3365cae0b9.jpg" : profilePicture}
                  alt="Profile pic"
                  className="rounded-full w-full h-full object-cover border-4 border-card-border shadow-2xl"
                />
              </div>

              <div className="flex justify-center items-center p-5">
                <h2 className="text-2xl text-text-primary font-mono font-extrabold tracking-widest">
                  {username}
                </h2>
              </div>

              <ul className="list-none pl-0 space-y-2 text-lg text-text-primary font-mono font-extrabold">
                <li className="flex items-center justify-between">
                  <Tooltip content="The average accuracy this player has.">
                    <span className="cursor-default">Overall Rating</span>
                  </Tooltip>
                  <span>{userStats["Overall Rating"] !== undefined ? userStats["Overall Rating"] : 0} / 10</span>
                </li>
                <li className="flex items-center justify-between">
                  <Tooltip content="The average accuracy this player has.">
                    <span className="cursor-default">Average Accuracy</span>
                  </Tooltip>
                  <span>{userStats["Average Acc"] !== undefined ? Math.round(userStats["Average Acc"] * 100) / 100 : 0}%</span>
                </li>
                <div className="h-px w-full bg-white/80"/>
                <li className="flex items-center justify-between">
                  <Tooltip content="The average words per minute this player has.">
                    <span className="cursor-default">Average WPM</span>
                  </Tooltip>
                  <span>{userStats["Average WPM"] !== undefined ? Math.round(userStats["Average WPM"] * 100) / 100 : 0}</span>
                </li>
                <div className="h-px w-full bg-white/80"/>
                <li className="flex items-center justify-between">
                  <Tooltip content="The best WPM this player had.">
                    <span className="cursor-default">Best WPM</span>
                  </Tooltip>
                  <Tooltip content={`This player got ${userStats["Best WPM"]} WPM in ${userStats["Best Time"]} seconds!`}>
                    <span>{userStats["Best WPM"]}</span>
                  </Tooltip>
                </li>
                <div className="h-px w-full bg-white/80"/>
                <li className="flex items-center justify-between">
                  <Tooltip content="The letter the player misstypes the most.">
                    <span className="cursor-default">Error Hotspots</span>
                  </Tooltip>
                  <span>{userStats["Error Hotspots"]}</span>
                </li>
                <div className="h-px w-full bg-white/80"/>
                <li className="flex items-center justify-between">
                  <Tooltip content="How many plays this payer has.">
                    <span className="cursor-default">Streak</span>
                  </Tooltip>
                  <span>{userStats["Streaks"]}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-3/4 flex flex-col gap-5 min-h-0">
            <div className="flex-[3] flex flex-row gap-x-5 min-h-0">
              <div className="w-full h-full bg-game-bg-light rounded-md p-5 pl-0">
                <div className="w-fit h-fit flex items-center justify-center ml-5">
                  <DropDown options={["WpmGraph", "AccGraph", "TimeGraph", "ErrorLettersGraph"]} value={currentGraph} onChange={setCurrentGraph} />
                </div>
                {currentGraph === "WpmGraph" && WpmGraph}
                {currentGraph === "AccGraph" && AccGraph}
                {currentGraph === "TimeGraph" && TimeGraph}
                {currentGraph === "ErrorLettersGraph" && ErrorLettersGraph}
              </div>
            </div>
            <div className="flex-[2] bg-game-bg-light rounded-md min-h-0">
              <MatchHistory rounds={SortRoundsArrayByCreated(stats?.rounds ?? [])} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <Window open={open} value={windowValue} width={75} height={80} className="motion-preset-blur-up-lg" overlayClassName="z-[60]" />;
}
