import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const bcrypt = require('bcryptjs');

export async function GET(request: NextRequest) {
  return await setupAdmin();
}

export async function POST(request: NextRequest) {
  return await setupAdmin();
}

async function setupAdmin() {
  try {
    console.log('🔐 Starting admin setup...');
    
    // Check if admin already exists
    console.log('Checking for existing admin...');
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      console.log('✅ Admin already exists');
      return NextResponse.json({ 
        success: true, 
        message: "Admin user already exists",
        credentials: {
          username: "admin",
          password: "admin123"
        }
      });
    }

    console.log('Creating new admin user...');
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('Password hashed successfully');
    
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      }
    });

    console.log('✅ Admin user created successfully');
    return NextResponse.json({ 
      success: true, 
      message: "Admin user created successfully!",
      credentials: {
        username: "admin",
        password: "admin123"
      }
    });
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create admin user",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
