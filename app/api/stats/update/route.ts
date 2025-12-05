import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { game, won } = await request.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let updates: any = {};

  if (game === "autoguessr") {
    if (won) {
      updates.autoguessrCurrentStreak = user.autoguessrCurrentStreak + 1;
      updates.autoguessrMaxStreak = Math.max(
        user.autoguessrMaxStreak,
        user.autoguessrCurrentStreak + 1
      );
    } else {
      updates.autoguessrCurrentStreak = 0;
    }
  } else if (game === "autorank") {
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

  await prisma.user.update({
    where: { email: session.user.email },
    data: updates,
  });

  return NextResponse.json({ success: true });
}