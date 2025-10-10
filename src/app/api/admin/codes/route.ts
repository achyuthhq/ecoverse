import { NextResponse } from "next/server";
import { getRecentAccessCodes } from "@/lib/admin";

export async function GET() {
  try {
    const codes = await getRecentAccessCodes(10);
    return NextResponse.json(codes);
  } catch (error) {
    console.error("Admin codes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch codes" },
      { status: 500 }
    );
  }
}
