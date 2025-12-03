import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { city: true },
    });

    if (!user?.city) {
      return NextResponse.json(
        {
          city: null,
          totalAnalyses: 0,
        },
        { status: 200 }
      );
    }

    const totalAnalyses = await prisma.analysis.count({
      where: {
        user: {
          city: user.city,
        },
      },
    });

    return NextResponse.json(
      {
        city: user.city,
        totalAnalyses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CITY_METRICS] Error:", error);
    return NextResponse.json(
      { message: "Failed to load city metrics" },
      { status: 500 }
    );
  }
}


