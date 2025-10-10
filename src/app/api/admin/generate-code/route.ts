import { NextRequest, NextResponse } from "next/server";
import { generateAccessCode } from "@/lib/admin";

export async function POST(request: NextRequest) {
  try {
    const { subscriptionType } = await request.json();

    if (!subscriptionType || !["monthly", "lifetime"].includes(subscriptionType)) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription type" },
        { status: 400 }
      );
    }

    const accessCode = await generateAccessCode(subscriptionType as "monthly" | "lifetime");

    return NextResponse.json({
      success: true,
      code: accessCode.code,
      subscriptionType: accessCode.subscriptionType,
      expiresAt: accessCode.expiresAt
    });
  } catch (error) {
    console.error("Generate code error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate code" },
      { status: 500 }
    );
  }
}
