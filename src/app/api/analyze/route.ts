import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FormData from "form-data";
import axios from "axios";
import { moondream, extractMainItems } from "@/lib/moondream";

// API settings
const IMGBB_API_KEY = "0614a461e2fe444df055e2f533490158";
const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

// Pollinations API URL format
const POLLINATIONS_API_URL = "https://enter.pollinations.ai/api/generate/text/";
const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    // Get user session from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    const userId = session.user.id;

    const body = await request.json();
    const { image, model } = body;

    if (!image) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const selectedModel = model || 'openai';

    console.log("[ANALYSIS_GEN] Starting image analysis process");
    console.log("[ANALYSIS_GEN] User ID:", userId);
    console.log("[ANALYSIS_GEN] Selected model:", selectedModel);
    
    // Step 1: Upload image to ImgBB to get a public URL
    console.log("[ANALYSIS_GEN] Step 1: Uploading image to ImgBB...");
    console.log("[ANALYSIS_GEN] Requesting:", IMGBB_API_URL);
    let imageUrl = "";
    let base64Image = image;
    
    try {
      // Extract base64 data (remove the prefix if present)
      if (image.startsWith('data:image')) {
        base64Image = image.split(',')[1];
      }
      
      // Create form data for ImgBB API
      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', base64Image);
      
      // Upload to ImgBB
      const imgbbResponse = await axios.post(IMGBB_API_URL, formData, {
        headers: {
          ...formData.getHeaders?.() || {}
        }
      });
      
      if (imgbbResponse.data && imgbbResponse.data.data && imgbbResponse.data.data.url) {
        imageUrl = imgbbResponse.data.data.url;
        
        // Validate URL format
        try {
          new URL(imageUrl); // This will throw if URL is invalid
          console.log("[ANALYSIS_GEN] Image uploaded successfully to ImgBB:", imageUrl);
        } catch (e) {
          // If URL is invalid, use a placeholder
          console.error("[ANALYSIS_GEN] Invalid URL format received from ImgBB:", imageUrl);
          imageUrl = "https://placehold.co/400x300?text=Image+Unavailable";
        }
      } else {
        throw new Error("Failed to upload image to ImgBB");
      }
      
    } catch (uploadError) {
      console.error("[ANALYSIS_GEN] Error uploading to ImgBB:", uploadError);
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    // Step 2: Identify the waste item using Moondream API
    console.log("[ANALYSIS_GEN] Step 2: Calling Moondream API for image analysis...");
    
    try {
      // Use our Moondream client library
      console.log("[ANALYSIS_GEN] Requesting Moondream API for image caption...");
      const moondreamResponse = await moondream.caption({
        image: base64Image,
        length: "normal"
      });
      
      // Check if response is valid
      if (!('caption' in moondreamResponse)) {
        throw new Error("Invalid response from Moondream API");
      }
      
      const caption = moondreamResponse.caption;
      const requestId = moondreamResponse.request_id;
      
      console.log("[ANALYSIS_GEN] Moondream caption received:", caption);
      console.log("[ANALYSIS_GEN] Moondream request ID:", requestId);
      
      // Use the full caption as the label
      const topLabel = caption;
      
      console.log("[ANALYSIS_GEN] Detected label:", topLabel);
      
      // Step 3: Get eco-analysis using Pollinations API - WAIT FOR IT
      console.log("[ANALYSIS_GEN] Step 3: Generating eco-analysis with Pollinations API");
      console.log("[ANALYSIS_GEN] Using model:", selectedModel);
      console.log("[ANALYSIS_GEN] Requesting Pollinations API...");
      
      // Generate real AI analysis using the selected model
      const pollinationsResponse = await analyzeWithPollinationsAPI(caption, selectedModel);
      console.log("[ANALYSIS_GEN] Pollinations API response received, success:", pollinationsResponse.success);
      
      let ecoData;
      if (pollinationsResponse.success && pollinationsResponse.data) {
        console.log("[ANALYSIS_GEN] Using AI-generated data from Pollinations API");
        const p2Data = pollinationsResponse.data;
        // Use AI-generated data
        ecoData = {
          item: topLabel,
          caption: caption,
          category: p2Data.category || determineCategoryFromItem(topLabel),
          material: p2Data.detected || determineMaterialFromItem(topLabel),
          degradability: p2Data.type || "Non-biodegradable",
          environmental_impact: Array.isArray(p2Data.harms) ? p2Data.harms : (p2Data.harms ? [p2Data.harms] : [`${topLabel} can contribute to waste accumulation if not properly disposed.`]),
          harms: Array.isArray(p2Data.harms) ? p2Data.harms : (p2Data.harms ? [p2Data.harms] : ["Can contribute to landfill waste"]),
          disposal: Array.isArray(p2Data.disposal) ? p2Data.disposal : (p2Data.disposal ? [p2Data.disposal] : ["Check local recycling guidelines for proper disposal"]),
          potential_for_reuse: p2Data.extra_notes || "Medium - Could potentially be repurposed or upcycled",
          alternatives: Array.isArray(p2Data.eco_alternatives) ? p2Data.eco_alternatives : (p2Data.eco_alternatives ? [p2Data.eco_alternatives] : ["Eco-friendly versions made from sustainable materials"]),
          recommendations: {
            reduce: `Consider if you really need to purchase new items or if existing ones can be reused.`,
            reuse: p2Data.extra_notes || `This item can often be repurposed for storage or other uses.`,
            recycle: Array.isArray(p2Data.disposal) ? p2Data.disposal[0] : (p2Data.disposal || `Check if your local recycling program accepts this type of item.`)
          }
        };
      } else {
        // Fallback if API fails
        console.warn("[ANALYSIS_GEN] Pollinations API failed, using fallback data");
        console.warn("[ANALYSIS_GEN] API error:", pollinationsResponse.error);
        ecoData = {
          item: topLabel,
          caption: caption,
          category: determineCategoryFromItem(topLabel),
          material: determineMaterialFromItem(topLabel),
          degradability: "Non-biodegradable",
          environmental_impact: [
            `${topLabel} can contribute to waste accumulation if not properly disposed.`,
            "May contain materials that take years to decompose naturally."
          ],
          harms: [
            "Can contribute to landfill waste",
            "May contain materials harmful to wildlife if improperly disposed"
          ],
          disposal: [
            `Check local recycling guidelines for proper disposal of this item`,
            "Consider reuse options before disposal"
          ],
          potential_for_reuse: "Medium - Could potentially be repurposed or upcycled",
          alternatives: [
            "Eco-friendly versions made from sustainable materials",
            "Reusable alternatives that reduce waste"
          ],
          recommendations: {
            reduce: `Consider if you really need to purchase new items or if existing ones can be reused.`,
            reuse: `This item can often be repurposed for storage or other uses.`,
            recycle: `Check if your local recycling program accepts this type of item.`
          }
        };
      }
      
      // Step 4: Save the analysis to the database with AI-generated data
      console.log("[ANALYSIS_GEN] Step 4: Saving to database with AI-generated data...");
      try {
        // Validate and fix the image URL
        const validImageUrl = validateAndFixImageUrl(imageUrl);
        
        // Fix the recommendations field by properly stringifying it
        const recommendationsJson = JSON.stringify(ecoData.recommendations);
        
        const analysis = await prisma.analysis.create({
          data: {
            userId: userId,
            imageUrl: validImageUrl,
            label: ecoData.item,
            extraNotes: ecoData.caption,
            type: ecoData.material,
            category: ecoData.category,
            degradability: ecoData.degradability,
            environmentalImpact: JSON.stringify(ecoData.environmental_impact),
            harms: JSON.stringify(ecoData.harms),
            disposal: JSON.stringify(ecoData.disposal),
            potentialForReuse: ecoData.potential_for_reuse,
            alternatives: JSON.stringify(ecoData.alternatives),
            recommendations: recommendationsJson
          }
        });
        
        console.log("[ANALYSIS_GEN] Analysis created successfully with ID:", analysis.id);
        console.log("[ANALYSIS_GEN] Analysis generation completed");
        
        return NextResponse.json({ success: true, id: analysis.id });
      } catch (dbError) {
        console.error("[ANALYSIS_GEN] Database error:", dbError);
        return NextResponse.json(
          { error: "Failed to save analysis to database", details: String(dbError) },
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error("[ANALYSIS_GEN] API processing error:", apiError);
      return NextResponse.json(
        { error: "API processing failed", details: String(apiError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[ANALYSIS_GEN] Error analyzing image:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}

// Helper function to determine category from item name
function determineCategoryFromItem(item: string): string {
  item = item.toLowerCase();
  
  if (item.includes("plastic") || item.includes("bottle") || item.includes("container")) {
    return "Recyclable";
  } else if (item.includes("food") || item.includes("fruit") || item.includes("vegetable")) {
    return "Compostable";
  } else if (item.includes("battery") || item.includes("electronic") || item.includes("chemical")) {
    return "Hazardous Waste";
  } else if (item.includes("paper") || item.includes("cardboard") || item.includes("box")) {
    return "Recyclable Paper";
  } else if (item.includes("glass") || item.includes("jar")) {
    return "Recyclable Glass";
  } else if (item.includes("metal") || item.includes("can") || item.includes("aluminum")) {
    return "Recyclable Metal";
  } else if (item.includes("textile") || item.includes("fabric") || item.includes("cloth") || item.includes("clothing")) {
    return "Reusable/Donatable";
  } else if (item.includes("wood") || item.includes("furniture")) {
    return "Repurposable";
  } else if (item.includes("organic") || item.includes("plant")) {
    return "Compostable";
  } else {
    return "Recyclable Mixed";
  }
}

// Helper function to determine material from item name
function determineMaterialFromItem(item: string): string {
  item = item.toLowerCase();
  
  if (item.includes("plastic")) {
    return "Plastic";
  } else if (item.includes("paper") || item.includes("cardboard")) {
    return "Paper";
  } else if (item.includes("glass")) {
    return "Glass";
  } else if (item.includes("metal") || item.includes("aluminum") || item.includes("can")) {
    return "Metal";
  } else if (item.includes("wood") || item.includes("bamboo")) {
    return "Wood";
  } else if (item.includes("fabric") || item.includes("textile") || item.includes("cloth") || item.includes("clothing")) {
    return "Textile";
  } else if (item.includes("electronic") || item.includes("battery") || item.includes("device")) {
    return "Electronic";
  } else if (item.includes("food") || item.includes("organic") || item.includes("fruit") || item.includes("vegetable")) {
    return "Organic";
  } else {
    return "Mixed";
  }
}

// Helper function to validate and fix image URL
function validateAndFixImageUrl(url: string): string {
  try {
    // Check if URL is valid
    new URL(url);
    return url;
  } catch (e) {
    // If URL is invalid, return a placeholder
    console.error("Invalid image URL:", url);
    return "https://placehold.co/400x300?text=Image+Unavailable";
  }
}

// Function to analyze objects using Pollinations API
async function analyzeWithPollinationsAPI(detectedObject: string, model: string = 'openai') {
  try {
    // Extract the main waste item from the caption for better analysis
    const wasteItems = [
      "bottle", "can", "cup", "container", "bag", "box", "paper", "cardboard", 
      "plastic", "glass", "metal", "aluminum", "steel", "wood", "textile", 
      "electronic", "battery", "food", "organic", "plant", "vegetable", "fruit",
      "wrapper", "packaging", "foil", "styrofoam", "ceramic", "porcelain",
      "fire extinguisher", "extinguisher"
    ];
    
    // Try to find a waste item in the caption
    const lowerCaption = detectedObject.toLowerCase();
    let mainItem = "item";
    
    for (const item of wasteItems) {
      if (lowerCaption.includes(item)) {
        mainItem = item;
        break;
      }
    }
    
    const promptTemplate = `You are an expert environmental analyst. Analyze this waste item for comprehensive environmental impact assessment.

**Detected Item:** ${detectedObject}
**Main Item:** ${mainItem}

Provide a detailed analysis in JSON format with these exact fields:
{
  "detected": "${mainItem}",
  "type": "biodegradable" or "non-biodegradable" (be specific about degradation time if known),
  "category": "Recyclable", "Compostable", "Hazardous Waste", "E-Waste", "Reusable/Donatable", "Repurposable", or "Recyclable Mixed",
  "harms": [
    "Specific environmental impact 1 (e.g., contributes to microplastic pollution)",
    "Specific environmental impact 2 (e.g., takes 450 years to decompose)",
    "Specific environmental impact 3 (e.g., harms marine life if not disposed properly)"
  ],
  "disposal": [
    "Step-by-step disposal instruction 1 (be specific)",
    "Step-by-step disposal instruction 2 (be specific)",
    "Step-by-step disposal instruction 3 (be specific)"
  ],
  "eco_alternatives": [
    "Specific eco-friendly alternative 1 (e.g., reusable steel water bottle)",
    "Specific eco-friendly alternative 2 (e.g., bamboo-based product)",
    "Specific eco-friendly alternative 3 (e.g., glass container)"
  ],
  "extra_notes": "Detailed information about reuse potential, recycling tips, or special handling requirements"
}

IMPORTANT: 
- Return ONLY valid JSON, no markdown code blocks
- Be specific and detailed, not generic
- Base your analysis on the actual item: ${detectedObject}
- Provide real, actionable information`;

    // Use Pollinations API with selected model
    const encodedPrompt = encodeURIComponent(promptTemplate);
    const params = new URLSearchParams();
    if (POLLINATIONS_API_KEY) params.append('key', POLLINATIONS_API_KEY);
    params.append('model', model);
    const apiUrl = `${POLLINATIONS_API_URL}${encodedPrompt}?${params.toString()}`;
    
    console.log("[ANALYSIS_GEN] Requesting Pollinations API:", apiUrl.substring(0, 100) + "...");
    console.log("[ANALYSIS_GEN] Model parameter:", model);
    console.log("[ANALYSIS_GEN] API key present:", !!POLLINATIONS_API_KEY);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });

    console.log("[ANALYSIS_GEN] Pollinations API response status:", response.status);
    if (!response.ok) {
      console.error("[ANALYSIS_GEN] Pollinations API request failed with status:", response.status);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    console.log("[ANALYSIS_GEN] Pollinations API response received, length:", responseText.length);

    // Parse the response from Pollinations API
    console.log("[ANALYSIS_GEN] Parsing Pollinations API response...");
    let parsedData;
    try {
      // Try to extract JSON from the response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
        console.log("[ANALYSIS_GEN] Successfully parsed JSON from Pollinations API response");
      } else {
        console.error("[ANALYSIS_GEN] Could not extract JSON from response");
        parsedData = { error: "Could not extract JSON from response" };
      }
    } catch (parseError) {
      console.error("[ANALYSIS_GEN] Error parsing Pollinations API response:", parseError);
      return {
        success: false,
        error: "Failed to parse analysis response",
      };
    }

    console.log("[ANALYSIS_GEN] Pollinations API analysis completed successfully");
    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    console.error("[ANALYSIS_GEN] Pollinations API error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
} 