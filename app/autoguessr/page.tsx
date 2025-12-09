/**
 * Author: Jonah Kastelic
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import Autocomplete from "../components/Autocomplete";

type DailyCar = { /*api elem to cal*/
  model_id: string;
  make: string;
  model: string;
  year: string;
  seed: number;
};

type CarDetails = {
  model_id: string;
  model_make_id: string;
  model_name: string;
  model_year: string;
  model_engine_cc?: string;
  model_engine_l?: string;
  model_engine_cyl?: string;
  model_engine_type?: string;
  model_engine_power_hp?: string;
  model_engine_power_ps?: string;
  model_top_speed_mph?: string;
  model_weight_lbs?: string;
  model_length_in?: string;
  model_width_in?: string;
  model_height_in?: string;
  model_body?: string;
  model_drive?: string;
  model_transmission_type?: string;
  model_seats?: string;
  model_doors?: string;
  make_country?: string;
  [key: string]: any;
};

type Guess = {
  make: string;
  model: string;
  year: string;
  feedback: {
    make: "correct" | "close" | "wrong";
    model: "correct" | "close" | "wrong";
    year: "correct" | "close" | "wrong";
  };
  yearDirection?: "higher" | "lower"; /*directional hint for guess*/
};

type Difficulty = "easy" | "medium" | "hard";

export default function AutoGuessrPage() {
  // Game state
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [dailyCar, setDailyCar] = useState<DailyCar | null>(null);
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState({ make: "", model: "", year: "" });
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_GUESSES = 6;

  /*seeded random for spec shuffle*/
  const seededRandom = (seed: number) => {
    return () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
      t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /*after diff selected get dailt car*/
  useEffect(() => {
    if (!difficulty) return;

    const loadDailyCar = async () => {
      try {
        setLoading(true);
        setError(null);

        /*daily car fetch*/
        const response = await fetch("/api/autoguessr/random-car");
        if (!response.ok) {
          throw new Error("Failed to fetch daily car");
        }

        const car: DailyCar = await response.json();
        setDailyCar(car);

        /*full car fetch*/
        const detailsResponse = await fetch(`/api/autoguessr/car/${car.model_id}`);
        if (!detailsResponse.ok) {
          throw new Error("Failed to fetch car details");
        }

        const details: CarDetails = await detailsResponse.json();
        setCarDetails(details);

      } catch (err) {
        console.error("Error loading daily car:", err);
        setError("Could not load today's car. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDailyCar();
  }, [difficulty]); /*reload if change in diff*/

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
  };

  /*normalize strings*/
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") /*remove accents*/
      .replace(/[\s\-_]/g, ''); /*remove separators*/
  };

  /*common lingo for car makes*/
  const brandAliases: { [key: string]: string } = {
    'chevy': 'chevrolet',
    'vw': 'volkswagen',
    'merc': 'mercedes',
    'mercedesbenz': 'mercedes',
    'benz': 'mercedes',
    'beemer': 'bmw',
    'bimmer': 'bmw',
    'caddy': 'cadillac',
    'alfa': 'alfaromeo',
  };

  /*check if two strings match */
  const lingoMatch = (input: string, target: string): boolean => {
    const normalizedInput = normalizeString(input);
    const normalizedTarget = normalizeString(target);

    /*exact match*/
    if (normalizedInput === normalizedTarget) return true;

    /*check if input is lingo*/
    const resolvedInput = brandAliases[normalizedInput] || normalizedInput;
    if (resolvedInput === normalizedTarget) return true;

    return false;
  };

  /*calculates how many edits it takes to turn one word into another*/
    /*allows for model feedback, if the car is 325i but the user guessed 330i lets them knwo theyre close*/
  const levenshtein = (a: string, b: string): number => {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, /* deletion*/
            matrix[i][j - 1] + 1,     /* insertion*/
            matrix[i - 1][j] + 1      /* substitution*/
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const handleGuess = () => {
    if (!dailyCar || !currentGuess.make || !currentGuess.model || !currentGuess.year) {
      return;
    }

    /*calculate similarity for the model*/
    const guessNorm = normalizeString(currentGuess.model);
    const targetNorm = normalizeString(dailyCar.model);
    const dist = levenshtein(guessNorm, targetNorm);
    const len = Math.max(guessNorm.length, targetNorm.length);

    /*close if one contains the other like Civic inside Civic Type R)
       or diff is small <=2 or half the len*/
    const isModelClose =
      (guessNorm.length > 2 && targetNorm.includes(guessNorm)) ||
      (targetNorm.length > 2 && guessNorm.includes(targetNorm)) ||
      (len > 0 && dist <= 2 && (dist / len) < 0.5);

    const feedback = {
      make: lingoMatch(currentGuess.make, dailyCar.make)
        ? "correct" as const
        : "wrong" as const,
      model: lingoMatch(currentGuess.model, dailyCar.model)
        ? "correct" as const
        : isModelClose
          ? "close" as const
          : "wrong" as const,
      year: currentGuess.year === dailyCar.year
        ? "correct" as const
        : Math.abs(parseInt(currentGuess.year) - parseInt(dailyCar.year)) <= 5
        ? "close" as const
        : "wrong" as const,
    };

    /*calculate directional hint for year*/
    const yearDirection = feedback.year !== "correct"
      ? parseInt(currentGuess.year) < parseInt(dailyCar.year)
        ? "higher" as const
        : "lower" as const
      : undefined;

    const newGuess: Guess = {
      ...currentGuess,
      feedback,
      yearDirection,
    };

    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);

    /*check if they guessed correct*/
    if (feedback.make === "correct" && feedback.model === "correct" && feedback.year === "correct") {
      setGameState("won");
      updateStreak(true);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState("lost");
      updateStreak(false);
    }

    /*reset*/
    setCurrentGuess({ make: "", model: "", year: "" });
  };

  /*depending on guess: yellow if close green if correct*/
  const getFeedbackColor = (status: "correct" | "close" | "wrong") => {
    switch (status) {
      case "correct":
        return "bg-emerald-500 text-white";
      case "close":
        return "bg-yellow-500 text-white";
      case "wrong":
        return "bg-slate-600 text-slate-300";
    }
  };

  /*memoize specs so no render reshuffle*/
  const sortedSpecs = useMemo(() => {
    if (!carDetails || !dailyCar) return [];

    /*calculate decade from year*/
    const decade = carDetails.model_year
      ? `${Math.floor(parseInt(carDetails.model_year) / 10) * 10}s`
      : null;

    const allSpecs = [
      { label: "Country", value: carDetails.make_country, priority: 3 },
      { label: "Decade", value: decade, priority: 3 },
      { label: "Engine Size", value: carDetails.model_engine_l ? `${carDetails.model_engine_l}L` : null, priority: 2 },
      { label: "Cylinders", value: carDetails.model_engine_cyl, priority: 1 },
      { label: "Engine Type", value: carDetails.model_engine_type, priority: 2 },
      { label: "Horsepower", value: carDetails.model_engine_power_hp ? `${carDetails.model_engine_power_hp} hp` : null, priority: 3 },
      { label: "Top Speed", value: carDetails.model_top_speed_mph ? `${carDetails.model_top_speed_mph} mph` : null, priority: 3 },
      { label: "Weight", value: carDetails.model_weight_lbs ? `${carDetails.model_weight_lbs} lbs` : null, priority: 2 },
      { label: "Body Style", value: carDetails.model_body, priority: 3 },
      { label: "Drive Type", value: carDetails.model_drive, priority: 3 },
      { label: "Transmission", value: carDetails.model_transmission_type, priority: 2 },
      { label: "Seats", value: carDetails.model_seats, priority: 1 },
      { label: "Doors", value: carDetails.model_doors, priority: 1 },
    ].filter(spec => spec.value && spec.value !== "null");

    /*use seeded rand for shuffling*/
    const rng = seededRandom(dailyCar.seed);

    /*group by priority*/
    const grouped = new Map<number, typeof allSpecs>();
    allSpecs.forEach(spec => {
      if (!grouped.has(spec.priority)) grouped.set(spec.priority, []);
      grouped.get(spec.priority)!.push(spec);
    });

    /*shuffle prio using seeded rand*/
    grouped.forEach((specs) => {
      for (let i = specs.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [specs[i], specs[j]] = [specs[j], specs[i]];
      }
    });

    /*priov order high to low*/
    return [3, 2, 1].flatMap(priority => grouped.get(priority) || []);
  }, [carDetails, dailyCar]);

  /*handle specs depending on diff and guess num*/
  const getVisibleSpecs = () => {
    if (difficulty === "hard") {
      /*hard show only 3 specs never reveal more*/
      return sortedSpecs.slice(0, 3);
    } else if (difficulty === "easy") {
      /*easy start with 5 specs reveal 1 more with each wrong guess*/
      const specsToShow = Math.min(5 + guesses.length, sortedSpecs.length);
      return sortedSpecs.slice(0, specsToShow);
    } else {
      /* medium start with 4 specs reveal 1 more every 2 wrong guesses*/
      const specsToShow = Math.min(4 + Math.floor(guesses.length / 2), sortedSpecs.length);
      return sortedSpecs.slice(0, specsToShow);
    }
  };

  // Call this when the game ends
  const updateStreak = async (won: boolean) => {
    await fetch("/api/stats/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game: "autoguessr", won }),
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-800 shadow-xl p-6 space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AutoGuessr</h1>
          <p className="text-sm text-slate-300">
            Guess today's car based on its specifications. You have {MAX_GUESSES} attempts!
          </p>
        </header>

        {/* Difficulty Selection Screen */}
        {!difficulty ? (
          <div className="space-y-6 py-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Choose Your Difficulty</h2>
              <p className="text-sm text-slate-400">Select a difficulty level to start playing</p>
            </div>

            <div className="grid gap-4">
              {/* Easy Mode Card */}
              <button
                onClick={() => handleDifficultySelect("easy")}
                className="rounded-xl bg-slate-700/80 border-2 border-slate-600 hover:border-emerald-500 p-6 text-left transition-all hover:scale-102 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-emerald-400">🟢 Easy</h3>
                    <span className="text-xs text-slate-400">Beginner Friendly</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Starts with 7 specs, reveals 1 more with each guess
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Most hints available</li>
                    <li>• Progressive reveals help you learn</li>
                    <li>• Perfect for getting started</li>
                  </ul>
                </div>
              </button>

              {/* Medium Mode Card */}
              <button
                onClick={() => handleDifficultySelect("medium")}
                className="rounded-xl bg-slate-700/80 border-2 border-slate-600 hover:border-emerald-500 p-6 text-left transition-all hover:scale-102 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-yellow-400">🟡 Medium</h3>
                    <span className="text-xs text-slate-400">Balanced Challenge</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Starts with 5 specs, reveals 1 more every 2 guesses
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Moderate hint system</li>
                    <li>• Strategic reveal timing</li>
                    <li>• Good balance of challenge</li>
                  </ul>
                </div>
              </button>

              {/* Hard Mode Card */}
              <button
                onClick={() => handleDifficultySelect("hard")}
                className="rounded-xl bg-slate-700/80 border-2 border-slate-600 hover:border-emerald-500 p-6 text-left transition-all hover:scale-102 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-red-400">🔴 Hard</h3>
                    <span className="text-xs text-slate-400">Expert Only</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Only 3 specs shown (no reveals)
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Minimal hints</li>
                    <li>• No additional reveals</li>
                    <li>• Ultimate challenge</li>
                  </ul>
                </div>
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-slate-300">Loading today's car...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-red-400 text-center">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Current Difficulty Display */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-slate-400">Difficulty:</span>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                difficulty === "easy" ? "bg-emerald-500 text-white" :
                difficulty === "medium" ? "bg-yellow-500 text-white" :
                "bg-red-500 text-white"
              }`}>
                {difficulty}
              </span>
            </div>

            {/* Difficulty Description */}
            <div className="text-center text-xs text-slate-400">
              {difficulty === "easy" && "Starts with 7 specs, reveals 1 more each guess"}
              {difficulty === "medium" && "Starts with 5 specs, reveals 1 more every 2 guesses"}
              {difficulty === "hard" && "Only 3 specs shown (no reveals)"}
            </div>

            {/* Car Specifications */}
            <div className="rounded-xl bg-slate-700/80 border border-slate-600 p-4 space-y-3">
              <h2 className="font-semibold text-lg mb-3">Car Specifications</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {getVisibleSpecs().map((spec, index) => (
                  <div key={index} className="contents">
                    <div className="text-slate-300">{spec.label}:</div>
                    <div className="font-medium text-slate-100">{spec.value}</div>
                  </div>
                ))}
              </div>
              {(difficulty === "easy" || difficulty === "medium") && gameState === "playing" && (
                <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-600">
                  💡 {getVisibleSpecs().length} specs revealed
                  {difficulty === "easy" && guesses.length < MAX_GUESSES && ` • ${MAX_GUESSES - guesses.length} more to unlock`}
                  {difficulty === "medium" && guesses.length < MAX_GUESSES && Math.floor((MAX_GUESSES - guesses.length) / 2) > 0 && ` • ${Math.floor((MAX_GUESSES - guesses.length) / 2)} more to unlock`}
                </p>
              )}
            </div>

            {/* Previous Guesses */}
            {guesses.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-slate-400">
                  Your Guesses ({guesses.length}/{MAX_GUESSES})
                </h3>
                <div className="space-y-2">
                  {guesses.map((guess, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-2 rounded-xl bg-slate-700/50 p-3"
                    >
                      <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${getFeedbackColor(guess.feedback.make)}`}>
                        {guess.make}
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${getFeedbackColor(guess.feedback.model)}`}>
                        {guess.model}
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${getFeedbackColor(guess.feedback.year)}`}>
                        {guess.year} {guess.yearDirection && (guess.yearDirection === "higher" ? "↑" : "↓")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guess Input */}
            {gameState === "playing" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-slate-400">Make Your Guess</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Autocomplete
                    value={currentGuess.make}
                    onChange={(value) => setCurrentGuess({ ...currentGuess, make: value })}
                    placeholder="Make"
                    searchType="make"
                  />
                  <Autocomplete
                    value={currentGuess.model}
                    onChange={(value) => setCurrentGuess({ ...currentGuess, model: value })}
                    placeholder="Model"
                    searchType="model"
                    make={currentGuess.make}
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={currentGuess.year}
                    onChange={(e) => setCurrentGuess({ ...currentGuess, year: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGuess}
                    disabled={!currentGuess.make || !currentGuess.model || !currentGuess.year}
                    className="flex-1 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm disabled:opacity-60 disabled:hover:bg-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Submit Guess ({guesses.length + 1}/{MAX_GUESSES})
                  </button>
                  <button
                    onClick={() => setGameState("lost")}
                    className="px-5 py-2.5 rounded-xl border border-slate-500 text-slate-300 hover:bg-slate-700 font-semibold text-sm cursor-pointer"
                  >
                    Give Up
                  </button>
                </div>
              </div>
            )}

            {/* Game Over */}
            {gameState === "won" && (
              <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/50 p-4 text-center space-y-2">
                <p className="text-xl font-bold text-emerald-400">🎉 Congratulations!</p>
                <p className="text-sm text-slate-300">
                  You guessed the car in {guesses.length} {guesses.length === 1 ? "try" : "tries"}!
                </p>
                <p className="text-lg font-semibold">
                  {dailyCar?.year} {dailyCar?.make} {dailyCar?.model}
                </p>
              </div>
            )}

            {gameState === "lost" && (
              <div className="rounded-xl bg-red-500/20 border border-red-500/50 p-4 text-center space-y-2">
                <p className="text-xl font-bold text-red-400">Game Over</p>
                <p className="text-sm text-slate-300">
                  The correct answer was:
                </p>
                <p className="text-lg font-semibold">
                  {dailyCar?.year} {dailyCar?.make} {dailyCar?.model}
                </p>
              </div>
            )}

            {/* Actions */}
            {gameState !== "playing" && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm cursor-pointer"
                >
                  Play Again Tomorrow
                </button>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-700">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-emerald-500"></div>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span>Close (±5 years or similar model)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-slate-600"></div>
                <span>Wrong</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
