import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for profile update validation
const profileUpdateSchema = z.object({
  name: z.string().optional(),
  image: z.string().nullable().optional(),
  profileShape: z.enum(["circle", "square", "triangle"]).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    // Get user ID from request headers (sent by frontend)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, image, profileShape } = validationResult.data;
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name !== undefined ? name : undefined,
        image: image !== undefined ? image : undefined,
        profileShape: profileShape !== undefined ? profileShape : undefined,
      } as any,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        profileShape: (updatedUser as any).profileShape,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 