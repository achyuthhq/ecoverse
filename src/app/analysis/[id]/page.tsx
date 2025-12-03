import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Recycle, AlertTriangle, Leaf, RefreshCw, AlertCircle } from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button2";
import { parseJsonArray, parseJsonObject } from "@/lib/utils";
import AnalysisChat from "@/components/analysis-chat";
import ReadMoreText from "@/components/read-more-text";
import ShareButton from "@/components/share-button";
import DIYIdeaSection from "@/components/diy-idea-section";
import AnalysisErrorBoundary from "@/components/analysis-error-boundary";

// Function to check biodegradability directly from the page
async function checkDegradability(item: string, materialType: string = "unknown material"): Promise<string> {
  try {
    const prompt = `Analyze if ${item} made of ${materialType} is biodegradable. 
Give ONLY a very concise 3-4 word response about its biodegradability status.
Examples: 
- "Not biodegradable, 450+ years"
- "Biodegradable, 2-6 weeks"
- "Partially biodegradable, 5-10 years"
- "Non-biodegradable plastic waste"
- "Compostable under industrial conditions"

DO NOT include any explanations, just the 3-4 word response.`;
    
    // Use the Pollinations API directly
    const apiKey = process.env.POLLINATIONS_API_KEY || '';
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://enter.pollinations.ai/api/generate/text/${encodedPrompt}${apiKey ? `?key=${apiKey}` : ''}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 } // Don't cache this request
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    
    const cleanResponse = responseText.trim()
      .replace(/^[^A-Za-z]+/, '') // Remove leading special chars
      .replace(/[^A-Za-z0-9\s.,()-]+$/, '') // Remove trailing special chars
      .replace(/^(is|not)\s+/i, '') // Remove leading "is" or "not"
      .replace(/^it\s+is\s+/i, '') // Remove leading "it is"
      .replace(/\.$/, ''); // Remove trailing period
    
    // Ensure the response is concise (3-8 words)
    const wordCount = cleanResponse.split(/\s+/).length;
    if (wordCount > 8) {
      // If too long, extract just the first part
      return cleanResponse.split(/[,.;]/).slice(0, 1).join('').trim();
    }
    
    return cleanResponse;
  } catch (error) {
    console.error('Degradability check error:', error);
    // Provide a fallback response that doesn't rely on the API
    return `Depends on specific materials`;
  }
}

// Function to check reuse potential
async function checkReusePotential(item: string, materialType: string = "unknown material"): Promise<string> {
  try {
    const prompt = `Evaluate the reuse potential of a ${item} made of ${materialType}.
Give ONLY a very concise 4-6 word response about its reuse potential.
Examples:
- "High - Multiple creative reuses"
- "Medium - Limited repurposing options"
- "Low - Difficult to repurpose"
- "Excellent for craft projects"
- "Can be repurposed as storage"

DO NOT include any explanations, just the 4-6 word response.`;
    
    // Use the Pollinations API directly
    const apiKey = process.env.POLLINATIONS_API_KEY || '';
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://enter.pollinations.ai/api/generate/text/${encodedPrompt}${apiKey ? `?key=${apiKey}` : ''}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 } // Don't cache this request
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    
    const cleanResponse = responseText.trim()
      .replace(/^[^A-Za-z]+/, '') // Remove leading special chars
      .replace(/[^A-Za-z0-9\s.,()-]+$/, '') // Remove trailing special chars
      .replace(/^(has|with)\s+/i, '') // Remove leading words
      .replace(/\.$/, ''); // Remove trailing period
    
    // Ensure the response is concise
    const wordCount = cleanResponse.split(/\s+/).length;
    if (wordCount > 8) {
      // If too long, extract just the first part
      return cleanResponse.split(/[,.;]/).slice(0, 1).join('').trim();
    }
    
    return cleanResponse;
  } catch (error) {
    console.error('Reuse potential check error:', error);
    // Provide a fallback response
    return `Potential varies by condition`;
  }
}

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
    const apiKey = process.env.POLLINATIONS_API_KEY || '';
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://enter.pollinations.ai/api/generate/text/${encodedPrompt}${apiKey ? `?key=${apiKey}` : ''}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 } // Don't cache this request
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    
    const cleanResponse = responseText.trim()
      .replace(/^[^A-Za-z]+/, '') // Remove leading special chars
      .replace(/[^A-Za-z0-9\s.,()-]+$/, '') // Remove trailing special chars
      .replace(/^(you can|try to|make a)\s+/i, '') // Remove leading words
      .replace(/\.$/, ''); // Remove trailing period
    
    // Ensure the response is concise but detailed
    const wordCount = cleanResponse.split(/\s+/).length;
    if (wordCount > 50) {
      // If too long, extract just the first part but keep it meaningful
      const sentences = cleanResponse.split(/[.!?]+/);
      const firstTwoSentences = sentences.slice(0, 2).join('. ').trim();
      return firstTwoSentences || getFallbackDIYIdea(item, materialType);
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
    `🎯 **Recommendation**: Convert into a practical organizer\n📋 **Steps to Make**:\n1. 🔧 Measure and cut if needed\n2. 🎨 Personalize with your style\n3. ✨ Add compartments or dividers\n4. 🎉 Organize your belongings`
  ];
  
  // Return a random fallback idea
  return fallbackIdeas[Math.floor(Math.random() * fallbackIdeas.length)];
}

// Function to determine material type
async function determineMaterialType(item: string): Promise<string> {
  try {
    const prompt = `Identify the primary material composition of a ${item}.
Give ONLY a very concise 1-3 word response about its material type.
Examples:
- "Plastic (PET)"
- "Aluminum"
- "Mixed textiles"
- "Glass"
- "Organic matter"
- "Electronic components"
- "Paper and cardboard"
- "Ceramic"

DO NOT include any explanations, just the 1-3 word material description.`;
    
    const encodedPrompt = encodeURIComponent(prompt);
    const apiKey = process.env.POLLINATIONS_API_KEY || '';
    const apiUrl = `https://enter.pollinations.ai/api/generate/text/${encodedPrompt}${apiKey ? `?key=${apiKey}` : ''}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    
    const cleanResponse = responseText.trim()
      .replace(/^[^A-Za-z]+/, '')
      .replace(/[^A-Za-z0-9\s.,()-]+$/, '')
      .replace(/^(made of|composed of|consists of)\s+/i, '')
      .replace(/\.$/, '');
    
    // Ensure the response is concise
    const wordCount = cleanResponse.split(/\s+/).length;
    if (wordCount > 3) {
      return cleanResponse.split(/[,.;]/).slice(0, 1).join('').trim();
    }
    
    return cleanResponse;
  } catch (error) {
    console.error('Material type determination error:', error);
    return "Mixed materials";
  }
}

// Function to determine waste category
async function determineCategory(item: string, materialType: string): Promise<string> {
  try {
    const prompt = `Classify ${item} made of ${materialType} into ONE waste category.
Choose ONLY ONE of these categories:
- "Recyclable"
- "Compostable"
- "Hazardous Waste"
- "Electronic Waste"
- "Landfill Waste"
- "Recyclable Mixed"
- "Special Collection"

Give ONLY the category name, no other text.`;
    
    const encodedPrompt = encodeURIComponent(prompt);
    const apiKey = process.env.POLLINATIONS_API_KEY || '';
    const apiUrl = `https://enter.pollinations.ai/api/generate/text/${encodedPrompt}${apiKey ? `?key=${apiKey}` : ''}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    
    const cleanResponse = responseText.trim()
      .replace(/^[^A-Za-z]+/, '')
      .replace(/[^A-Za-z\s]+$/, '')
      .replace(/^(category:|classified as|is a)\s+/i, '')
      .replace(/\.$/, '');
    
    // Validate against known categories
    const validCategories = [
      "Recyclable", "Compostable", "Hazardous Waste", 
      "Electronic Waste", "Landfill Waste", "Recyclable Mixed", "Special Collection"
    ];
    
    // Find the closest match
    for (const category of validCategories) {
      if (cleanResponse.toLowerCase().includes(category.toLowerCase())) {
        return category;
      }
    }
    
    // If no match found, return the cleaned response if it's short enough
    if (cleanResponse.split(/\s+/).length <= 3) {
      return cleanResponse;
    }
    
    // Default fallback
    return "Recyclable Mixed";
  } catch (error) {
    console.error('Category determination error:', error);
    return "Recyclable Mixed";
  }
}

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch the analysis data
  const analysis = await prisma.analysis.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: true,
    },
  });

  if (!analysis) {
    redirect("/dashboard");
  }

  // Get or generate material type
  let materialType = analysis.type;
  if (!materialType || materialType === "mixed materials" || materialType === "Unknown material") {
    try {
      materialType = await determineMaterialType(analysis.label || "unknown item");
      
      // Update the database with the new value
      await prisma.analysis.update({
        where: { id: params.id },
        data: { type: materialType }
      });
    } catch (error) {
      console.error("Error determining material type:", error);
      materialType = "Mixed materials";
    }
  }
  
  // Get or generate category
  let category = analysis.category;
  if (!category || category === "Uncategorized") {
    try {
      category = await determineCategory(analysis.label || "unknown item", materialType);
      
      // Update the database with the new value
      await prisma.analysis.update({
        where: { id: params.id },
        data: { category: category }
      });
    } catch (error) {
      console.error("Error determining category:", error);
      category = "Recyclable Mixed";
    }
  }
  
  // Check if degradability is "Pending assessment" and if so, fetch it immediately
  let degradability = (analysis as any).degradability;
  let reusePotential = (analysis as any).potentialForReuse;
  
  // If degradability is pending or not specified, get it now
  if (!degradability || degradability === "Pending assessment" || degradability === "Not specified") {
    try {
      degradability = await checkDegradability(analysis.label || "unknown item", materialType);
      
      // Update the database with the new value
      await prisma.analysis.update({
        where: { id: params.id },
        data: { degradability: degradability }
      });
    } catch (error) {
      console.error("Error checking degradability:", error);
      degradability = "Depends on specific materials";
    }
  }
  
  // If reuse potential is not specified, get it now
  if (!reusePotential || reusePotential === "Not specified") {
    try {
      reusePotential = await checkReusePotential(analysis.label || "unknown item", materialType);
      
      // Update the database with the new value
      await prisma.analysis.update({
        where: { id: params.id },
        data: { potentialForReuse: reusePotential }
      });
    } catch (error) {
      console.error("Error checking reuse potential:", error);
      reusePotential = "Potential varies by condition";
    }
  }

  // Generate DIY idea - let client component handle this
  let diyIdea = "Creative repurposing possible";
  // We'll let the client component handle the actual generation
  // This prevents server-side generation issues and provides better UX

  // Parse JSON strings
  const environmentalImpact = parseJsonArray(analysis.environmentalImpact as string | undefined);
  const harms = parseJsonArray(analysis.harms);
  const disposal = parseJsonArray(analysis.disposal);
  const alternatives = parseJsonArray(analysis.alternatives);
  const recommendations = parseJsonObject(analysis.recommendations as string | undefined);

  // Determine category color
  let categoryColor = "bg-gray-100 text-gray-700";
  if (category) {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("recycl")) {
      categoryColor = "bg-green-100 text-green-700";
    } else if (categoryLower.includes("compost")) {
      categoryColor = "bg-amber-100 text-amber-700";
    } else if (categoryLower.includes("hazard")) {
      categoryColor = "bg-red-100 text-red-700";
    } else if (categoryLower.includes("electronic")) {
      categoryColor = "bg-blue-100 text-blue-700";
    } else if (categoryLower.includes("landfill")) {
      categoryColor = "bg-gray-100 text-gray-700";
    } else if (categoryLower.includes("special")) {
      categoryColor = "bg-purple-100 text-purple-700";
    }
  }

  // Prepare initial analysis data for the chat component
  const initialAnalysisData = {
    label: analysis.label || "Unknown item",
    materialType: materialType,
    category: category || "Uncategorized",
    degradability: degradability,
    reusePotenial: reusePotential,
    environmentalImpact: environmentalImpact,
    harms: harms,
    disposal: disposal,
    alternatives: alternatives,
    recommendations: recommendations || {},
  };

  return (
    <DashboardShell>
      <AnalysisErrorBoundary analysisId={analysis.id}>
        <div className="flex flex-col gap-6 relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 -z-10 rounded-xl opacity-50" />
          
          {/* Back button */}
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-green-600 transition-colors duration-200">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            
            <ShareButton 
              analysisId={analysis.id} 
              label={analysis.label || "Unknown item"}
              diyIdea={diyIdea}
            />
          </div>

          {/* Analysis Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Image */}
            <div className="w-full md:w-1/3 aspect-square relative rounded-xl overflow-hidden border border-gray-200 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
              <Image
                src={analysis.imageUrl}
                alt={analysis.label || "Analyzed image"}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Analysis Info */}
            <div className="w-full md:w-2/3 glass-card-light rounded-xl p-6 shadow-lg">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${categoryColor} shadow-sm`}>
                  {category || "Uncategorized"}
                </span>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 shadow-sm">
                  {materialType}
                </span>
              </div>
              
              <div className="mb-4">
                <ReadMoreText 
                  text={analysis.label} 
                  wordCount={10}
                  textClassName="text-2xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent"
                  buttonClassName="text-green-600 hover:text-green-700"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-5 glass-effect rounded-xl border border-white/30 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-amber-100">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Degradability</h3>
                  </div>
                  <p className="text-gray-600 pl-10">{degradability}</p>
                </div>
                
                <div className="p-5 glass-effect rounded-xl border border-white/30 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-green-100">
                      <Recycle className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Reuse Potential</h3>
                  </div>
                  <p className="text-gray-600 pl-10">{reusePotential}</p>
                </div>

                <div className="p-5 glass-effect rounded-xl border border-white/30 shadow-md md:col-span-2">
                  <DIYIdeaSection 
                    initialDiyIdea={diyIdea}
                    itemLabel={analysis.label || "unknown item"}
                    materialType={materialType}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
            <AnalysisChat 
              analysisId={analysis.id} 
              initialAnalysisData={initialAnalysisData}
            />
          </div>
        </div>
      </AnalysisErrorBoundary>
    </DashboardShell>
  );
} 