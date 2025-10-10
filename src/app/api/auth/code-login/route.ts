import { NextRequest, NextResponse } from "next/server";
import { validateAccessCode, useAccessCode } from "@/lib/admin";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: "Invalid code format" },
        { status: 400 }
      );
    }

    // Validate the access code
    const validation = await validateAccessCode(code);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired code" },
        { status: 401 }
      );
    }

    // If user already exists, return user data
    if (validation.user) {
      return NextResponse.json({
        success: true,
        user: {
          id: validation.user.id,
          name: validation.user.name,
          subscriptionType: validation.user.subscriptionType,
          subscriptionExpires: validation.user.subscriptionExpires
        }
      });
    }

    // Use the code to create a new user
    const result = await useAccessCode(code);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to create user account" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        subscriptionType: result.user.subscriptionType,
        subscriptionExpires: result.user.subscriptionExpires
      }
    });
  } catch (error) {
    console.error("Code login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
