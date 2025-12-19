import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEcoAwarenessScore } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    // If city parameter is provided, return top users in that city
    if (city) {
      const users = await prisma.user.findMany({
        where: {
          city: city,
        },
        include: {
          analyses: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      const usersWithScores = users.map(user => ({
        id: user.id,
        name: user.name,
        image: user.image,
        profileShape: user.profileShape,
        analyses: user.analyses,
        ecoAwarenessScore: calculateEcoAwarenessScore(user.analyses),
        analysisCount: user.analyses.length
      }));

      const usersWithAnalyses = usersWithScores.filter(user => user.analysisCount > 0 && user.ecoAwarenessScore > 0);
      usersWithAnalyses.sort((a, b) => b.ecoAwarenessScore - a.ecoAwarenessScore);

      return NextResponse.json(usersWithAnalyses);
    }

    // Otherwise, return city leaderboard (aggregated by city)
    const cities = await prisma.user.findMany({
      where: {
        city: {
          not: null,
        },
      },
      select: {
        city: true,
      },
      distinct: ['city'],
    });

    const cityStats = await Promise.all(
      cities.map(async (user) => {
        const cityUsers = await prisma.user.findMany({
          where: {
            city: user.city,
          },
          include: {
            analyses: true,
          },
        });

        const allAnalyses = cityUsers.flatMap(u => u.analyses);
        const totalAnalyses = allAnalyses.length;
        const cityScore = calculateEcoAwarenessScore(allAnalyses);
        const userCount = cityUsers.filter(u => u.analyses.length > 0).length;

        return {
          city: user.city,
          totalAnalyses,
          ecoAwarenessScore: cityScore,
          userCount,
        };
      })
    );

    // Filter out cities with 0 analyses and sort by score
    const citiesWithAnalyses = cityStats
      .filter(city => city.totalAnalyses > 0 && city.ecoAwarenessScore > 0)
      .sort((a, b) => b.ecoAwarenessScore - a.ecoAwarenessScore);

    return NextResponse.json(citiesWithAnalyses);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
