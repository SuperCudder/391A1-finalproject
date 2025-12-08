/**
 * Author: Lucas Lotze
*/

"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

// Provides NextAuth session context to all child components
export default function ClientSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}