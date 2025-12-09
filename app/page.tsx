/**
 * Author: Jonah Kastelic
 */

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-4xl space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Welcome to <span className="text-emerald-400">AutoGames</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Test your automotive knowledge with our daily car challenges!
            </p>
          </div>

          {/* Game Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {/* AutoGuessr Card */}
            <Link href="/autoguessr">
              <div className="rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 shadow-xl p-6 space-y-4 transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">AutoGuessr</h2>
                  <span className="text-3xl">🚗</span>
                </div>
                <p className="text-slate-300">
                  Guess the car based on its specifications. Like Wordle, but for cars!
                </p>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Daily challenge</li>
                  <li>• 6 attempts to guess</li>
                  <li>• Wordle-style feedback</li>
                  <li>• Three difficulty modes</li>
                </ul>
                <div className="pt-2">
                  <span className="inline-block px-4 py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold text-sm">
                    Play Now →
                  </span>
                </div>
              </div>
            </Link>

            {/* AutoRank Card */}
            <Link href="/autorank">
              <div className="rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 shadow-xl p-6 space-y-4 transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">AutoRank</h2>
                  <span className="text-3xl">🏁</span>
                </div>
                <p className="text-slate-300">
                  Rank cars by horsepower from highest to lowest. Test your performance knowledge!
                </p>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Rank 4 random cars</li>
                  <li>• Sort by horsepower</li>
                  <li>• Instant feedback</li>
                  <li>• Unlimited rounds</li>
                </ul>
                <div className="pt-2">
                  <span className="inline-block px-4 py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold text-sm">
                    Play Now →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Footer Info */}
          <div className="text-center text-sm text-slate-400 pt-8">
            <p>Built with Next.js, React, and the CarQuery API</p>
          </div>
        </div>
      </div>
  );
}
