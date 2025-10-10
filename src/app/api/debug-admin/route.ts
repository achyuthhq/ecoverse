import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check if admin exists
    const admin = await prisma.admin.findFirst();
    
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        message: "No admin user found in database",
        adminExists: false
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Admin user found",
      adminExists: true,
      admin: {
        id: admin.id,
        username: admin.username,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin
      }
    });
    
  } catch (error) {
    console.error('Error checking admin:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
