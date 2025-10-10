import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import FormData from "form-data";
import axios from "axios";
import { moondream, extractMainItems } from "@/lib/moondream";

// API settings
const IMGBB_API_KEY = "0614a461e2fe444df055e2f533490158";
const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

// Pollinations API URL format
const POLLINATIONS_API_URL = "https://text.pollinations.ai/";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers (sent by frontend)
    const userId = request.headers.get('x-user-id');
    
    // Debug: Log headers
    console.log("=== ANALYZE API DEBUG ===");
    console.log("Request method:", request.method);
    console.log("Request URL:", request.url);
    console.log("All headers:", Object.fromEntries(request.headers.entries()));
    console.log("x-user-id header:", userId);
    console.log("Header exists check:", request.headers.has('x-user-id'));
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    console.log("Processing image...");
    
    // Step 1: Upload image to ImgBB to get a public URL
    console.log("Uploading image to ImgBB...");
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
          console.log("Image uploaded successfully to ImgBB:", imageUrl);
        } catch (e) {
          // If URL is invalid, use a placeholder
          console.error("Invalid URL format received from ImgBB:", imageUrl);
          imageUrl = "https://placehold.co/400x300?text=Image+Unavailable";
        }
      } else {
        throw new Error("Failed to upload image to ImgBB");
      }
      
    } catch (uploadError) {
      console.error("Error uploading to ImgBB:", uploadError);
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    // Step 2: Identify the waste item using Moondream API
    console.log("Calling Moondream API for image analysis...");
    
    try {
      // Use our Moondream client library
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
      
      console.log("Caption:", caption);
      console.log("Request ID:", requestId);
      
      // Use the full caption as the label
      const topLabel = caption;
      
      console.log("Detected label:", topLabel);
      
      // Step 3: Get eco-analysis using Pollinations API
      console.log("Generating eco-analysis with Pollinations API...");
      
      // Create a default eco-analysis based on the detected item
      const ecoData = {
        item: topLabel,
        caption: caption, // Store the full caption
        category: determineCategoryFromItem(topLabel),
        material: determineMaterialFromItem(topLabel),
        degradability: "Pending assessment",
        environmental_impact: [
          `${topLabel.substring(0, 50)}... can contribute to waste accumulation if not properly disposed.`,
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
      
      // Step 4: Save the analysis to the database
      console.log("Saving to database...");
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
            extraNotes: ecoData.caption, // Save the full caption as extra notes
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
        
        console.log("Analysis created with ID:", analysis.id);
        
        // Start Pollinations API analysis in the background without waiting for it
        analyzeWithPollinationsAPI(caption).then(pollinationsResponse => {
          if (pollinationsResponse.success && pollinationsResponse.data) {
            // Update the analysis with Pollinations API response if available
            const p2Data = pollinationsResponse.data;
            
            try {
              prisma.analysis.update({
                where: { id: analysis.id },
                data: {
                  degradability: p2Data.type || ecoData.degradability,
                  category: p2Data.category || ecoData.category,
                  harms: p2Data.harms ? JSON.stringify(p2Data.harms) : JSON.stringify(ecoData.harms),
                  disposal: p2Data.disposal ? JSON.stringify(p2Data.disposal) : JSON.stringify(ecoData.disposal),
                  alternatives: p2Data.eco_alternatives ? JSON.stringify(p2Data.eco_alternatives) : JSON.stringify(ecoData.alternatives),
                  potentialForReuse: p2Data.extra_notes || ecoData.potential_for_reuse
                }
              }).then(() => {
                console.log("Analysis updated with Pollinations API data");
              }).catch(updateError => {
                console.error("Error updating analysis with Pollinations API data:", updateError);
              });
            } catch (updateError) {
              console.error("Error updating analysis with Pollinations API data:", updateError);
            }
          }
        }).catch(pollinationsError => {
          console.error("Pollinations API analysis failed:", pollinationsError);
        });
        
        return NextResponse.json({ success: true, id: analysis.id });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return NextResponse.json(
          { error: "Failed to save analysis to database", details: String(dbError) },
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error("API processing error:", apiError);
      return NextResponse.json(
        { error: "API processing failed", details: String(apiError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
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
async function analyzeWithPollinationsAPI(detectedObject: string) {
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
    
    const promptTemplate = `
Detected in image: ${detectedObject}

Main item appears to be: ${mainItem}

-----

Please analyze this item for waste management and environmental impact:

1. Object identification: What is the main waste item in this description?
2. Material type: What material is it made of? (plastic, metal, paper, etc.)
3. Biodegradability: Is it biodegradable or non-biodegradable?
4. Category: What waste category does it belong to? (recyclable, hazardous, etc.)
5. Environmental impact: How does this item impact the environment?
6. Proper disposal: How should this item be disposed of correctly?
7. Alternatives: What are some eco-friendly alternatives?

Format your response as a JSON object with these fields:
{
  "detected": "${mainItem}",
  "type": "biodegradable or non-biodegradable",
  "category": "waste category",
  "harms": ["environmental impact 1", "environmental impact 2", "environmental impact 3"],
  "disposal": ["disposal instruction 1", "disposal instruction 2"],
  "eco_alternatives": ["alternative 1", "alternative 2"],
  "extra_notes": "Additional information about handling or recycling"
}

Be concise but thorough.`;

    // Use Pollinations API
    const encodedPrompt = encodeURIComponent(promptTemplate);
    const apiUrl = `${POLLINATIONS_API_URL}${encodedPrompt}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseText = await response.text();

    // Parse the response from Pollinations API
    let parsedData;
    try {
      // Try to extract JSON from the response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = { error: "Could not extract JSON from response" };
      }
    } catch (parseError) {
      console.error("Error parsing Pollinations API response:", parseError);
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
    console.error("Pollinations API error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
} 