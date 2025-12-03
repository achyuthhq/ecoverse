import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Find the user's city so we can aggregate impact at the city level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { city: true },
    });

    let analyses;

    if (user?.city) {
      // If the user has a city set, return analyses for all users in the same city
      analyses = await prisma.analysis.findMany({
        where: {
          user: {
            city: user.city,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Fallback: only this user's analyses
      analyses = await prisma.analysis.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Get user analyses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}
