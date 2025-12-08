/**
 * Author: Lucas Lotze
*/

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";

// NextAuth configuration options
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma), // Use Prisma adapter for DB integration
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const, // Use JWT for session management
  },
  callbacks: {
    // Attach user id to session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token?.sub as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for signing JWTs
};

// Export NextAuth handler for GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };