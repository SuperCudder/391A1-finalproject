"use client";

import { useEffect, useState } from "react";

type PoolCar = {
    model_id: string;
    model_make_id: string;
    model_name: string;
    model_year: string;
    model_engine_power_ps?: string; // from getTrims
    model_engine_power_hp?: string;
};

const STAT = "horsepower";

export default function AutoRankPage() {
    const [pool, setPool] = useState<PoolCar[]>([]);
    const [order, setOrder] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    // Load a pool of cars on first render
    useEffect(() => {
        const loadPool = async () => {
            try {
                setLoading(true);
                setError(null);
                setResult(null);

                const res = await fetch(`/api/autorank/pool?stat=${STAT}&count=4`);
                if (!res.ok) {
                    throw new Error("Failed to load pool");
                }

                const data: PoolCar[] = await res.json();
                setPool(data);
                setOrder(data.map((c) => c.model_id));
            } catch (err) {
                console.error(err);
                setError("Could not load cars");
            } finally {
                setLoading(false);
            }
        };

        loadPool();
    }, []);

    const moveUp = (index: number) => {
        if (index === 0) return;

        setOrder((prev) => {
            const copy = [...prev];
            [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
            return copy;
        });

        setResult(null);
    };

    const moveDown = (index: number) => {
        if (index === order.length - 1) return;

        setOrder((prev) => {
            const copy = [...prev];
            [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
            return copy;
        });

        setResult(null);
    };

    const carFromPool = (id: string) => pool.find((c) => c.model_id === id)!;

    const handleCheck = () => {
        // No cars
        if (!pool.length) return;

        // Build the correct order by sorting the pool
        const sorted = [...pool].sort((a, b) => {
            const aHpRaw = a.model_engine_power_ps ?? a.model_engine_power_hp ?? "0";
            const bHpRaw = b.model_engine_power_ps ?? b.model_engine_power_hp ?? "0";

            const aHp = Number(aHpRaw);
            const bHp = Number(bHpRaw);

            // Highest horsepower first
            return bHp - aHp;
        });

        const correctOrderIds = sorted.map((c) => c.model_id);

        // Compare your current order to the correct order
        const isCorrect =
            order.length === correctOrderIds.length &&
            order.every((id, i) => id === correctOrderIds[i]);

        setResult(
            isCorrect
                ? "✅ Correct! You nailed the horsepower ranking."
                : "❌ Not quite. Try a different order!"
        );
    };

    const handleNewRound = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-slate-800 shadow-xl p-6 space-y-6">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">AutoRank</h1>
                    <p className="text-sm text-slate-300">
                        Rank the cars by{" "}
                        <span className="font-semibold">horsepower</span> (highest to
                        lowest).
                    </p>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <p className="text-slate-300">
                            Loading cars for this round...
                        </p>
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
                        {/* Current order list */}
                        <ol className="space-y-3">
                            {order.map((id, index) => {
                                const car = carFromPool(id);

                                return (
                                    <li
                                        key={id}
                                        className="flex items-center justify-between gap-4 rounded-xl bg-slate-700/80 border border-slate-600 px-4 py-3"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                #{index + 1}{" "}
                                                <span className="uppercase text-xs text-slate-300 mr-1"> {car.model_make_id} </span>
                                                {car.model_name}{" "}
                                                <span className="text-slate-300"> ({car.model_year}) </span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => moveUp(index)}
                                                disabled={index === 0}
                                                className="inline-flex items-center justify-center rounded-full border border-slate-400 px-3 py-1 text-xs font-medium hover:bg-slate-600 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                                            >
                                                ↑ Up
                                            </button>
                                            <button
                                                onClick={() => moveDown(index)}
                                                disabled={index === order.length - 1}
                                                className="inline-flex items-center justify-center rounded-full border border-slate-400 px-3 py-1 text-xs font-medium hover:bg-slate-600 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                                            >
                                                ↓ Down
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <button
                                onClick={handleCheck}
                                disabled={checking}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm disabled:opacity-60 disabled:hover:bg-emerald-500 cursor-pointer"
                            >
                                {checking ? "Checking..." : "Check ranking"}
                            </button>

                            <button
                                onClick={handleNewRound}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-500 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer"
                            >
                                New round
                            </button>
                        </div>

                        {/* Result */}
                        {result && (
                            <p className="mt-4 text-center font-semibold">{result}</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}