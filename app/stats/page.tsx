/**
 * Author: Lucas Lotze
*/

"use client"; // Enables client-side rendering for this page
import { useEffect, useState } from "react";

// Type definition for user stats
type Stats = {
  autoguessrCurrentStreak: number;
  autoguessrMaxStreak: number;
  autorankCurrentStreak: number;
  autorankMaxStreak: number;
};

export default function StatsPage() {
  // State to hold stats data and loading status
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user stats from API when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const res = await fetch("/api/stats/get");
      if (res.ok) {
        setStats(await res.json()); // Update stats state with API response
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  // Card layout for stats, loading, and error states
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-800 shadow-2xl p-8 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-center mb-2">Your Game Stats</h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-xl font-semibold">Loading stats...</span>
          </div>
        ) : !stats ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-xl font-semibold">No stats found.</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            <div className="flex-1 bg-slate-700 rounded-lg p-6 flex flex-col items-center">
              <h2 className="font-semibold text-xl mb-4">AutoGuessr</h2>
              {/* Show current and max win streaks for AutoGuessr */}
              <p className="mb-2">Current Win Streak: <span className="font-bold text-emerald-400">{stats.autoguessrCurrentStreak}</span></p>
              <p>Max Win Streak: <span className="font-bold text-emerald-400">{stats.autoguessrMaxStreak}</span></p>
            </div>
            <div className="flex-1 bg-slate-700 rounded-lg p-6 flex flex-col items-center">
              <h2 className="font-semibold text-xl mb-4">AutoRank</h2>
              {/* Show current and max win streaks for AutoRank */}
              <p className="mb-2">Current Win Streak: <span className="font-bold text-emerald-400">{stats.autorankCurrentStreak}</span></p>
              <p>Max Win Streak: <span className="font-bold text-emerald-400">{stats.autorankMaxStreak}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}