import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin";

export async function GET() {
  try {
    const stats = await getAdminStats();
    
    if (!stats) {
      return NextResponse.json(
        { error: "Failed to fetch stats" },
        { status: 500 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
