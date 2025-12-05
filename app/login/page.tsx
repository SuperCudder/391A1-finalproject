"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/"); // Redirect if already logged in
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Sign in to AutoClutch</h1>
        <button
          onClick={() => signIn("google")}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-6 py-3 rounded-lg"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}