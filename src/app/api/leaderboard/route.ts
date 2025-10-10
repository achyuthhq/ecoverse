import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEcoAwarenessScore } from "@/lib/utils";

export async function GET() {
  try {
    // Fetch top users with their analyses
    const topUsers = await prisma.user.findMany({
      include: {
        analyses: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        analyses: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // Calculate eco awareness scores for each user
    const usersWithScores = topUsers.map(user => ({
      id: user.id,
      name: user.name,
      image: user.image,
      profileShape: user.profileShape,
      analyses: user.analyses,
      ecoAwarenessScore: calculateEcoAwarenessScore(user.analyses),
      analysisCount: user.analyses.length
    }));

    // Sort by eco awareness score
    usersWithScores.sort((a, b) => b.ecoAwarenessScore - a.ecoAwarenessScore);

    return NextResponse.json(usersWithScores);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
