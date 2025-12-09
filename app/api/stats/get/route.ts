/**
 * Author: Lucas Lotze
*/

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// Fetch user stats from database
export async function GET(request: NextRequest) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Query user stats from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      autoguessrCurrentStreak: true,
      autoguessrMaxStreak: true,
      autorankCurrentStreak: true,
      autorankMaxStreak: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Return stats as JSON
  return NextResponse.json(user);
}