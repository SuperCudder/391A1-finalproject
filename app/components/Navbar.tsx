"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="w-full bg-slate-800 border-b border-slate-700 text-slate-100">
            <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
                <Link href="/" className="text-xl font-bold hover:text-emerald-400">
                    AutoGames
                </Link>
                <div className="flex items-center gap-6 text-sm">
                    <Link href="/" className="hover:text-emerald-400">
                        Home
                    </Link>
                    <Link href="/autorank" className="hover:text-emerald-400">
                        AutoRank
                    </Link>
                    <Link href="/autoguessr" className="hover:text-emerald-400">
                        AutoGuessr
                    </Link>
                    {status === "authenticated" ? (
                        <>
                            <Link href="/stats" className="hover:text-emerald-400">
                                Stats
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="hover:text-emerald-400 bg-transparent border-none cursor-pointer"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className="hover:text-emerald-400">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}