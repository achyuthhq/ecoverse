import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const bcrypt = require('bcryptjs');

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Creating admin user manually...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: "Admin user already exists",
        admin: {
          username: existingAdmin.username,
          id: existingAdmin.id
        }
      });
    }

    // Create admin user with simple credentials
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
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
      admin: {
        id: admin.id,
        username: admin.username,
        createdAt: admin.createdAt
      },
      credentials: {
        username: "admin",
        password: "admin123"
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create admin user",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
