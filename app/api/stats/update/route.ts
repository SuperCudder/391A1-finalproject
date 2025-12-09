/**
 * Author: Lucas Lotze
*/

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// Update user stats after game ends
export async function POST(request: NextRequest) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get game result from request body
  const { game, won } = await request.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let updates: any = {};

  // Update autoguessr stats
  if (game === "autoguessr") {
    if (won) {
      // Increment streak on win
      updates.autoguessrCurrentStreak = user.autoguessrCurrentStreak + 1;
      updates.autoguessrMaxStreak = Math.max(
        user.autoguessrMaxStreak,
        user.autoguessrCurrentStreak + 1
      );
    } else {
      // Reset streak on loss
      updates.autoguessrCurrentStreak = 0;
    }
  } else if (game === "autorank") {
    // Update autorank stats
    if (won) {
      updates.autorankCurrentStreak = user.autorankCurrentStreak + 1;
      updates.autorankMaxStreak = Math.max(
        user.autorankMaxStreak,
        user.autorankCurrentStreak + 1
      );
    } else {
      updates.autorankCurrentStreak = 0;
    }
  }

  // Save updated stats to database
  await prisma.user.update({
    where: { email: session.user.email },
    data: updates,
  });

  return NextResponse.json({ success: true });
}