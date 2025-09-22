import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { analysisId, diyIdea } = await request.json();

    if (!analysisId) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 }
      );
    }

    // Verify the analysis belongs to the user
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: session.user.id,
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found or access denied" },
        { status: 404 }
      );
    }

    // Safely mark as shared by adding a shared flag to extraNotes
    // This doesn't change the database schema, just uses existing field
    const currentExtraNotes = analysis.extraNotes || "";
    const sharedFlag = "SHARED_TO_GALLERY:true";
    
    // Check if already shared
    if (currentExtraNotes.includes(sharedFlag)) {
      return NextResponse.json(
        { error: "Analysis already shared" },
        { status: 400 }
      );
    }

    // Add shared flag and DIY idea to extraNotes
    let updatedExtraNotes = currentExtraNotes;
    
    if (diyIdea) {
      // Store the DIY idea with a special marker
      updatedExtraNotes = currentExtraNotes 
        ? `${currentExtraNotes}\nDIY_IDEA:${diyIdea}\n${sharedFlag}`
        : `DIY_IDEA:${diyIdea}\n${sharedFlag}`;
    } else {
      updatedExtraNotes = currentExtraNotes 
        ? `${currentExtraNotes}\n${sharedFlag}`
        : sharedFlag;
    }

    await prisma.analysis.update({
      where: { id: analysisId },
      data: { extraNotes: updatedExtraNotes }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Analysis shared successfully" 
    });

  } catch (error) {
    console.error("Error sharing analysis:", error);
    return NextResponse.json(
      { error: "Failed to share analysis" },
      { status: 500 }
    );
  }
} 