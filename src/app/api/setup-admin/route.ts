import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: "Admin user already exists",
        credentials: {
          username: "admin",
          password: "admin123"
        }
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin user created successfully!",
      credentials: {
        username: "admin",
        password: "admin123"
      }
    });
    
  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create admin user" 
    }, { status: 500 });
  }
}
