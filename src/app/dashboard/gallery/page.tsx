import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Function to generate DIY idea for an analysis
async function generateDIYIdeaForGallery(item: string, materialType: string): Promise<string> {
  try {
    // Create more specific prompts based on the item type
    let prompt = `Create a creative DIY idea for repurposing ${item} made of ${materialType}.
Give a step-by-step guide with emojis in this format:

🎯 **Recommendation**: Brief description of the DIY project
📋 **Steps to Make**:
1. 🔧 Step 1 with emoji
2. 🎨 Step 2 with emoji  
3. ✨ Step 3 with emoji
4. 🎉 Final step with emoji

Make it specific to ${item} and practical. 3-4 steps maximum.`;

    // Add specific prompts for common items
    if (item.toLowerCase().includes('banana') || item.toLowerCase().includes('fruit')) {
      prompt = `Create a creative DIY idea for repurposing ${item} peels or packaging.
Give a step-by-step guide with emojis in this format:

🎯 **Recommendation**: Brief description of the DIY project
📋 **Steps to Make**:
1. 🔧 Step 1 with emoji
2. 🎨 Step 2 with emoji  
3. ✨ Step 3 with emoji
4. 🎉 Final step with emoji

Make it specific to ${item} and practical. 3-4 steps maximum.`;
    } else if (item.toLowerCase().includes('electronic') || item.toLowerCase().includes('phone') || item.toLowerCase().includes('laptop')) {
      prompt = `Create a creative DIY idea for repurposing ${item} components or parts.
Give a step-by-step guide with emojis in this format:

🎯 **Recommendation**: Brief description of the DIY project
📋 **Steps to Make**:
1. 🔧 Step 1 with emoji
2. 🎨 Step 2 with emoji  
3. ✨ Step 3 with emoji
4. 🎉 Final step with emoji

Make it specific to ${item} and practical. 3-4 steps maximum.`;
    } else if (item.toLowerCase().includes('plastic') || item.toLowerCase().includes('bottle')) {
      prompt = `Create a creative DIY idea for repurposing ${item} made of ${materialType}.
Give a step-by-step guide with emojis in this format:

🎯 **Recommendation**: Brief description of the DIY project
📋 **Steps to Make**:
1. 🔧 Step 1 with emoji
2. 🎨 Step 2 with emoji  
3. ✨ Step 3 with emoji
4. 🎉 Final step with emoji

Make it specific to ${item} and practical. 3-4 steps maximum.`;
    }
    
    // Use the Pollinations API directly
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://text.pollinations.ai/${encodedPrompt}`;
    
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
      .replace(/^(you can|try to|make a)\s+/i, '')
      .replace(/\.$/, '');
    
    // Validate the response format
    if (!cleanResponse.includes('🎯') || !cleanResponse.includes('📋')) {
      return getFallbackDIYIdea(item, materialType);
    }
    
    return cleanResponse;
  } catch (error) {
    console.error("Error generating DIY idea for gallery:", error);
    return getFallbackDIYIdea(item, materialType);
  }
}

// Fallback DIY ideas for when API fails - now more specific
function getFallbackDIYIdea(item: string, materialType: string): string {
  const itemLower = item.toLowerCase();
  
  // Specific fallback ideas based on item type
  if (itemLower.includes('banana') || itemLower.includes('fruit')) {
    return `🎯 **Recommendation**: Create a natural plant fertilizer from banana peels\n📋 **Steps to Make**:\n1. 🔧 Collect and dry banana peels\n2. 🎨 Cut peels into small pieces\n3. ✨ Bury pieces around plant roots\n4. 🎉 Water plants for nutrient boost`;
  } else if (itemLower.includes('electronic') || itemLower.includes('phone') || itemLower.includes('laptop')) {
    return `🎯 **Recommendation**: Transform into a creative desk organizer\n📋 **Steps to Make**:\n1. 🔧 Remove internal components safely\n2. 🎨 Clean and paint the case\n3. ✨ Add dividers and compartments\n4. 🎉 Organize your desk supplies`;
  } else if (itemLower.includes('plastic') || itemLower.includes('bottle')) {
    return `🎯 **Recommendation**: Create a self-watering plant pot\n📋 **Steps to Make**:\n1. 🔧 Cut bottle in half\n2. 🎨 Paint with eco-friendly paint\n3. ✨ Add drainage holes\n4. 🎉 Plant your favorite herb`;
  } else if (itemLower.includes('glass') || itemLower.includes('jar')) {
    return `🎯 **Recommendation**: Make a beautiful candle holder\n📋 **Steps to Make**:\n1. 🔧 Clean the glass thoroughly\n2. 🎨 Decorate with twine or ribbon\n3. ✨ Add a tea light candle\n4. 🎉 Enjoy your cozy ambiance`;
  } else if (itemLower.includes('paper') || itemLower.includes('cardboard')) {
    return `🎯 **Recommendation**: Create a desk organizer\n📋 **Steps to Make**:\n1. 🔧 Cut cardboard to desired height\n2. 🎨 Cover with decorative paper\n3. ✨ Create compartments with dividers\n4. 🎉 Organize your desk supplies`;
  } else {
    // Generic fallback
    const fallbackIdeas = [
      `🎯 **Recommendation**: Transform into a creative storage solution\n📋 **Steps to Make**:\n1. 🔧 Clean the item thoroughly\n2. 🎨 Paint with eco-friendly paint\n3. ✨ Add decorative elements\n4. 🎉 Use for organizing small items`,
      `🎯 **Recommendation**: Create a unique plant holder\n📋 **Steps to Make**:\n1. 🔧 Add drainage holes if needed\n2. 🎨 Decorate with natural materials\n3. ✨ Fill with soil and plant\n4. 🎉 Enjoy your new garden piece`,
      `🎯 **Recommendation**: Make a beautiful wall decoration\n📋 **Steps to Make**:\n1. 🔧 Prepare the surface\n2. 🎨 Paint or decorate creatively\n3. ✨ Add hanging mechanism\n4. 🎉 Display proudly in your space`
    ];
    return fallbackIdeas[Math.floor(Math.random() * fallbackIdeas.length)];
  }
}

// Function to extract just the recommendation from DIY idea
function extractRecommendation(diyIdea: string): string {
  const lines = diyIdea.split('\n');
  for (const line of lines) {
    if (line.includes('🎯') && line.includes('**Recommendation**')) {
      // Extract the text after "**Recommendation**:"
      const match = line.match(/\*\*Recommendation\*\*:\s*(.+)/);
      return match ? match[1].trim() : line.replace('🎯 **Recommendation**:', '').trim();
    }
  }
  // Fallback: return first line without emoji
  return lines[0].replace(/^🎯\s*\*\*Recommendation\*\*:\s*/, '').trim();
}

export default async function GalleryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch real shared analyses from the database
  const sharedAnalyses = await prisma.analysis.findMany({
    where: {
      extraNotes: {
        contains: "SHARED_TO_GALLERY:true"
      }
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Transform the data for display with real generated DIY ideas
  const transformedAnalyses = await Promise.all(
    sharedAnalyses.map(async (analysis) => {
      // Generate real DIY idea for this analysis
      const diyIdea = await generateDIYIdeaForGallery(
        analysis.label, 
        analysis.type || "mixed materials"
      );
      
      // Calculate time ago
      const timeAgo = getTimeAgo(analysis.createdAt);
      
      return {
        id: analysis.id,
        label: analysis.label,
        imageUrl: analysis.imageUrl,
        category: analysis.category || "Recyclable",
        materialType: analysis.type || "Mixed materials",
        diyIdea: diyIdea,
        recommendation: extractRecommendation(diyIdea),
        sharedBy: analysis.user.name || analysis.user.email?.split('@')[0] || "Anonymous",
        sharedAt: timeAgo
      };
    })
  );

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
            Community Gallery
          </h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Discover creative DIY ideas shared by the Ecoverse community
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {transformedAnalyses.map((analysis, index) => (
            <Card 
              key={analysis.id} 
              className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 rounded-3xl animate-in fade-in slide-in-from-bottom-4 w-full max-w-md mx-auto md:max-w-none"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              {/* Image container */}
              <div className="relative aspect-square overflow-hidden rounded-t-3xl">
                <Image
                  src={analysis.imageUrl}
                  alt={analysis.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Category badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-semibold rounded-full shadow-lg border border-white/50">
                    {analysis.category}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <CardHeader className="pb-3 pt-4 px-4 md:px-6">
                <CardTitle className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors duration-300">
                  {analysis.recommendation}
                </CardTitle>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Shared by {analysis.sharedBy} • {analysis.sharedAt}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0 px-4 md:px-6 pb-4 md:pb-6">
                <div className="space-y-2 text-xs md:text-sm text-gray-600">
                  {analysis.diyIdea.split('\n').map((line, lineIndex) => {
                    // Skip the recommendation line since it's already in the title
                    if (line.includes('🎯') && line.includes('**Recommendation**')) {
                      return null;
                    }
                    
                    // Format the steps nicely
                    if (line.includes('📋') && line.includes('**Steps to Make**')) {
                      return (
                        <div key={lineIndex} className="font-semibold text-gray-800 mt-3 mb-2">
                          {line.replace('📋 **Steps to Make**:', 'Steps to Make:')}
                        </div>
                      );
                    }
                    
                    // Format numbered steps
                    if (line.match(/^\d+\.\s*🔧|🎨|✨|🎉/)) {
                      return (
                        <div key={lineIndex} className="ml-4 group/step hover:bg-green-50/50 rounded-lg p-1 -ml-1 transition-colors duration-200">
                          <span className="leading-relaxed">{line}</span>
                        </div>
                      );
                    }
                    
                    // Skip empty lines
                    if (line.trim() === '') {
                      return null;
                    }
                    
                    return <div key={lineIndex} className="leading-relaxed">{line}</div>;
                  })}
                </div>
              </CardContent>
              
              {/* Hover effect border */}
              <div className="absolute inset-0 border-2 border-green-200/0 group-hover:border-green-200/50 rounded-3xl transition-all duration-500 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {transformedAnalyses.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6 text-gray-400 text-6xl animate-bounce">📸</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No shared analyses yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Be the first to share your creative DIY ideas with the community and inspire others!
            </p>
            <Link href="/dashboard/analyze">
              <Button className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Analyze & Share
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
} 