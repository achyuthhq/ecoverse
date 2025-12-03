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

    // Filter out users with 0 analyses (0 points)
    const usersWithAnalyses = usersWithScores.filter(user => user.analysisCount > 0 && user.ecoAwarenessScore > 0);

    // Sort by eco awareness score
    usersWithAnalyses.sort((a, b) => b.ecoAwarenessScore - a.ecoAwarenessScore);

    return NextResponse.json(usersWithAnalyses);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
