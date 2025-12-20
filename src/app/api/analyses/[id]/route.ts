import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    const userId = session.user.id;

    const analysis = await prisma.analysis.findUnique({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    const { aiData } = body;

    if (!aiData) {
      return NextResponse.json({ error: "AI data is required" }, { status: 400 });
    }

    // Verify the analysis belongs to the user
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found or access denied" }, { status: 404 });
    }

    // Save AI data as JSON in extraNotes
    // Preserve existing data (audioUrl, voice) if it exists
    let existingData: any = {};
    if (analysis.extraNotes) {
      if (analysis.extraNotes.trim().startsWith('{')) {
        // If extraNotes is already JSON, parse it to preserve audioUrl and voice
        try {
          existingData = JSON.parse(analysis.extraNotes);
          console.log("[ANALYSIS_UPDATE] Existing data keys:", Object.keys(existingData));
        } catch (e) {
          console.warn("[ANALYSIS_UPDATE] Could not parse existing extraNotes, starting fresh");
        }
      }
    }
    
    // Merge AI data with existing data (preserve audioUrl and voice if they exist)
    const mergedData = {
      ...aiData, // AI data takes priority
      ...(existingData.audioUrl && { audioUrl: existingData.audioUrl }),
      ...(existingData.voice && { voice: existingData.voice })
    };
    
    console.log("[ANALYSIS_UPDATE] Merged data keys:", Object.keys(mergedData));
    console.log("[ANALYSIS_UPDATE] Has impactScore:", mergedData.impactScore !== undefined);
    console.log("[ANALYSIS_UPDATE] Has audioUrl:", !!mergedData.audioUrl);
    
    const updatedExtraNotes = JSON.stringify(mergedData);

    console.log("[ANALYSIS_UPDATE] Saving AI data to database for analysis:", params.id);
    await prisma.analysis.update({
      where: { id: params.id },
      data: { extraNotes: updatedExtraNotes }
    });

    console.log("[ANALYSIS_UPDATE] AI data saved successfully");
    return NextResponse.json({ success: true, message: "AI data saved successfully" });
  } catch (error) {
    console.error("[ANALYSIS_UPDATE] Error updating analysis:", error);
    return NextResponse.json({ error: "Failed to update analysis" }, { status: 500 });
  }
}
