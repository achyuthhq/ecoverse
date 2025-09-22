import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import axios from "axios";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Clarifai API settings
const CLARIFAI_PAT = process.env.CLARIFAI_PAT;
const CLARIFAI_USER_ID = "clarifai";
const CLARIFAI_APP_ID = "main";
const CLARIFAI_MODEL_ID = "general-image-recognition";

// Provider2API settings
const PROVIDER2_API_URL = "https://provider2api.onrender.com/api/provider2";
const PROVIDER2_MODEL_ID = "openai/gpt-4o";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    if (!body.image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Step 1: Send the image to Clarifai for object detection
    const clarifaiResponse = await detectObjectWithClarifai(body.image);
    
    if (!clarifaiResponse.success) {
      return NextResponse.json(
        { error: "Failed to detect object", details: clarifaiResponse.error },
        { status: 500 }
      );
    }

    const detectedLabel = clarifaiResponse.label;
    
    // Step 2: Send the detected label to Provider2API for detailed analysis
    const analysisResponse = await analyzeWithProvider2API(detectedLabel);
    
    if (!analysisResponse.success) {
      return NextResponse.json(
        { error: "Failed to analyze object", details: analysisResponse.error },
        { status: 500 }
      );
    }

    // Generate a Cloudinary URL (in a real app, you'd upload to Cloudinary first)
    // For now, we'll just simulate this with a placeholder
    const imageUrl = `https://res.cloudinary.com/demo/image/upload/sample.jpg`;
    
    // Step 3: Save the analysis to the database
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        imageUrl,
        label: analysisResponse.data.detected || detectedLabel,
        type: analysisResponse.data.type || null,
        category: analysisResponse.data.category || null,
        harms: JSON.stringify(analysisResponse.data.harms || []),
        disposal: JSON.stringify(analysisResponse.data.disposal || []),
        alternatives: JSON.stringify(analysisResponse.data.eco_alternatives || []),
        extraNotes: analysisResponse.data.extra_notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      id: analysis.id,
      detected: detectedLabel,
      analysis: analysisResponse.data,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}

// Function to detect objects using Clarifai API
async function detectObjectWithClarifai(base64Image: string) {
  try {
    // Check if the PAT is available
    if (!CLARIFAI_PAT) {
      return { success: false, error: "Clarifai PAT not configured" };
    }

    const response = await axios.post(
      `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/outputs`,
      {
        inputs: [
          {
            data: {
              image: {
                base64: base64Image,
              },
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Key ${CLARIFAI_PAT}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the top concept from the response
    const concepts = response.data.outputs[0].data.concepts;
    const topConcept = concepts[0];

    return {
      success: true,
      label: topConcept.name,
      confidence: topConcept.value,
    };
  } catch (error) {
    console.error("Clarifai API error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

// Function to analyze objects using Provider2API
async function analyzeWithProvider2API(detectedObject: string) {
  try {
    const promptTemplate = `Detected item: ${detectedObject}\n\n-----\n\nMore details:\n- Is this item biodegradable?\n- What category of waste is this?\n- How to dispose of it properly?\n- Can it be recycled or reused?\n\n-----\n\nHarms caused:\n- List of 3–5 negative environmental impacts\n- Pollution, health risks, wildlife issues, etc.\n\n-----\n\nSuggestions:\n- Eco-friendly alternatives\n- Ways to reduce this waste\n- How to spread awareness\n\nFormat response strictly like:\n{\n \"detected\": \"${detectedObject}\",\n \"type\": \"Non-biodegradable\",\n \"category\": \"Hazardous Electronic Waste\",\n \"harms\": [\"Heavy metal leakage\", \"Groundwater contamination\"],\n \"disposal\": [\"Drop at e-waste center\", \"Do not throw in trash\"],\n \"eco_alternatives\": [\"Rechargeable batteries\"],\n \"extra_notes\": \"Handle with care, do not incinerate.\"\n}`;

    const response = await axios.post(
      PROVIDER2_API_URL,
      {
        prompt: promptTemplate,
        model_id: PROVIDER2_MODEL_ID,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Parse the response from Provider2API
    let parsedData;
    try {
      // The response might be a string that needs to be parsed as JSON
      if (typeof response.data === "string") {
        parsedData = JSON.parse(response.data);
      } else if (response.data.response) {
        // It might be inside the response field
        parsedData = JSON.parse(response.data.response);
      } else {
        // Or it might be directly available
        parsedData = response.data;
      }
    } catch (parseError) {
      console.error("Error parsing Provider2API response:", parseError);
      return {
        success: false,
        error: "Failed to parse analysis response",
      };
    }

    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    console.error("Provider2API error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
} 