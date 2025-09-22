import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Function to generate DIY ideas
async function generateDIYIdea(item: string, materialType: string = "unknown material"): Promise<string> {
  try {
    const prompt = `Create a creative DIY idea for repurposing a ${item} made of ${materialType}.
Give a step-by-step guide with emojis in this format:

🎯 **Recommendation**: Brief description of the DIY project
📋 **Steps to Make**:
1. 🔧 Step 1 with emoji
2. 🎨 Step 2 with emoji  
3. ✨ Step 3 with emoji
4. 🎉 Final step with emoji

Keep it short, practical, and encouraging. 3-4 steps maximum.`;
    
    // Use the Pollinations API directly
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://text.pollinations.ai/${encodedPrompt}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    
    // Clean and validate the response
    let cleanResponse = responseText.trim();
    
    // Remove common unwanted prefixes
    cleanResponse = cleanResponse
      .replace(/^[^A-Za-z🎯📋]+/, '') // Remove leading special chars except emojis
      .replace(/[^A-Za-z0-9\s.,()-🎯📋🔧🎨✨🎉]+$/, '') // Remove trailing special chars except emojis
      .replace(/^(you can|try to|make a|here's how|here is how)\s+/i, '') // Remove leading phrases
      .replace(/\.$/, ''); // Remove trailing period
    
    // Check if the response has the expected format
    if (!cleanResponse.includes('🎯') || !cleanResponse.includes('📋')) {
      // If the API response doesn't have the expected format, use fallback
      return getFallbackDIYIdea(item, materialType);
    }
    
    // Ensure the response is concise but detailed
    const wordCount = cleanResponse.split(/\s+/).length;
    if (wordCount > 100) {
      // If too long, try to extract just the recommendation and first few steps
      const lines = cleanResponse.split('\n');
      const recommendationLine = lines.find(line => line.includes('🎯'));
      const stepsLines = lines.filter(line => line.match(/^\d+\./)).slice(0, 4);
      
      if (recommendationLine && stepsLines.length > 0) {
        return [recommendationLine, '📋 **Steps to Make**:', ...stepsLines].join('\n');
      }
      
      return getFallbackDIYIdea(item, materialType);
    }
    
    return cleanResponse || getFallbackDIYIdea(item, materialType);
  } catch (error) {
    console.error("Error generating DIY idea:", error);
    return getFallbackDIYIdea(item, materialType);
  }
}

// Fallback DIY ideas for when API fails
function getFallbackDIYIdea(item: string, materialType: string): string {
  const fallbackIdeas = [
    `🎯 **Recommendation**: Transform into a creative storage solution\n📋 **Steps to Make**:\n1. 🔧 Clean the item thoroughly\n2. 🎨 Paint with eco-friendly paint\n3. ✨ Add decorative elements\n4. 🎉 Use for organizing small items`,
    `🎯 **Recommendation**: Create a unique plant holder\n📋 **Steps to Make**:\n1. 🔧 Add drainage holes if needed\n2. 🎨 Decorate with natural materials\n3. ✨ Fill with soil and plant\n4. 🎉 Enjoy your new garden piece`,
    `🎯 **Recommendation**: Make a beautiful wall decoration\n📋 **Steps to Make**:\n1. 🔧 Prepare the surface\n2. 🎨 Paint or decorate creatively\n3. ✨ Add hanging mechanism\n4. 🎉 Display proudly in your space`,
    `🎯 **Recommendation**: Convert into a practical organizer\n📋 **Steps to Make**:\n1. 🔧 Measure and cut if needed\n2. 🎨 Personalize with your style\n3. ✨ Add compartments or dividers\n4. 🎉 Organize your belongings`,
    `🎯 **Recommendation**: Create a unique candle holder\n📋 **Steps to Make**:\n1. 🔧 Clean and prepare the surface\n2. 🎨 Decorate with twine or ribbon\n3. ✨ Add a tea light candle\n4. 🎉 Enjoy your cozy ambiance`,
    `🎯 **Recommendation**: Make a creative wind chime\n📋 **Steps to Make**:\n1. 🔧 Clean and remove sharp edges\n2. 🎨 Paint with weather-resistant paint\n3. ✨ Add string and beads\n4. 🎉 Hang in your garden`
  ];
  
  // Return a random fallback idea
  return fallbackIdeas[Math.floor(Math.random() * fallbackIdeas.length)];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { item, materialType } = body;

    if (!item) {
      return NextResponse.json(
        { error: 'Item is required' },
        { status: 400 }
      );
    }

    const diyIdea = await generateDIYIdea(item, materialType || "unknown material");

    return NextResponse.json({
      diyIdea,
      success: true
    });

  } catch (error) {
    console.error('DIY generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate DIY idea',
        diyIdea: getFallbackDIYIdea("item", "material")
      },
      { status: 500 }
    );
  }
} 