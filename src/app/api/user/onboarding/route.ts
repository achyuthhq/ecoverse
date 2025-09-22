import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Define a schema for input validation
const onboardingSchema = z.object({
  source: z.string().optional(),
  goals: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Check if DATABASE_URL is properly set
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set");
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate the input
    const result = onboardingSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten();
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: errors.fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { source, goals } = result.data;
    
    // Update user with onboarding information
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        source,
        goals,
      },
    });
    
    return NextResponse.json(
      { 
        message: 'User profile updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          source: updatedUser.source,
          goals: updatedUser.goals,
        }
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Onboarding error:', error);
    
    // Check if it's a Prisma error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { message: 'An error occurred while updating user profile' },
      { status: 500 }
    );
  }
} 