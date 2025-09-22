import { NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { prisma } from '@/lib/prisma';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;
      
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      console.error('Missing Firebase Admin SDK credentials. Check your environment variables.');
    } else {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

export async function POST(request: Request) {
  try {
    console.log("Firebase verify endpoint called");
    
    // Check if already authenticated with NextAuth
    const session = await getServerSession(authOptions);
    if (session) {
      console.log("User already authenticated with NextAuth:", session.user);
      return NextResponse.json({ 
        success: true, 
        message: 'Already authenticated',
        user: session.user
      });
    }

    // Get the ID token from the request
    const { idToken } = await request.json();
    
    if (!idToken) {
      console.error("No ID token provided");
      return NextResponse.json(
        { success: false, message: 'No ID token provided' },
        { status: 400 }
      );
    }

    // Verify the ID token
    try {
      console.log("Verifying Firebase ID token...");
      const decodedToken = await auth().verifyIdToken(idToken);
      
      if (!decodedToken) {
        console.error("Invalid ID token");
        return NextResponse.json(
          { success: false, message: 'Invalid ID token' },
          { status: 401 }
        );
      }
      
      console.log("Token verified successfully:", decodedToken.email);

      if (!decodedToken.email) {
        console.error("No email in decoded token");
        return NextResponse.json(
          { success: false, message: 'No email found in token' },
          { status: 400 }
        );
      }

      // Check if user exists in database
      console.log("Checking if user exists in database:", decodedToken.email);
      let user = await prisma.user.findUnique({
        where: {
          email: decodedToken.email,
        },
      });

      // Create user if they don't exist
      if (!user) {
        console.log("Creating new user for:", decodedToken.email);
        try {
          user = await prisma.user.create({
            data: {
              email: decodedToken.email,
              name: decodedToken.name || decodedToken.email.split('@')[0],
              image: decodedToken.picture,
              emailVerified: new Date(),
            },
          });
          console.log("User created successfully:", user.id);
        } catch (createError) {
          console.error("Error creating user:", createError);
          return NextResponse.json(
            { success: false, message: 'Failed to create user account' },
            { status: 500 }
          );
        }
      } else {
        console.log("User already exists:", user.id);
      }

      return NextResponse.json({
        success: true,
        message: 'Token verified successfully',
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          image: user?.image,
        },
      });
    } catch (tokenError: any) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json(
        { success: false, message: 'Failed to verify token: ' + tokenError.message },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Firebase verification error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to verify Firebase token' 
      },
      { status: 500 }
    );
  }
} 