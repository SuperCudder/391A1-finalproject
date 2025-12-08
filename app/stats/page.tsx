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

  // Show loading indicator while fetching stats
  if (loading) return <div className="p-8 text-center">Loading stats...</div>;
  // Show message if no stats are found
  if (!stats) return <div className="p-8 text-center">No stats found.</div>;

  // Display user stats in styled cards
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center mb-4">Your Stats</h1>
        <div className="space-y-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <h2 className="font-semibold mb-2">AutoGuessr</h2>
            {/* Show current and max win streaks for AutoGuessr */}
            <p>Current Win Streak: <span className="font-bold">{stats.autoguessrCurrentStreak}</span></p>
            <p>Max Win Streak: <span className="font-bold">{stats.autoguessrMaxStreak}</span></p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h2 className="font-semibold mb-2">AutoRank</h2>
            {/* Show current and max win streaks for AutoRank */}
            <p>Current Win Streak: <span className="font-bold">{stats.autorankCurrentStreak}</span></p>
            <p>Max Win Streak: <span className="font-bold">{stats.autorankMaxStreak}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}