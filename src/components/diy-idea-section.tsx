"use client";

import { useState } from "react";
import { Leaf, AlertCircle, Sparkles } from "lucide-react";
import DIYIdeaDisplay from "@/components/diy-idea-display";
import RefreshDIYButton from "@/components/refresh-diy-button";
import { Button } from "@/components/ui/button2";

interface DIYIdeaSectionProps {
  initialDiyIdea: string;
  itemLabel: string;
  materialType: string;
}

export default function DIYIdeaSection({ 
  initialDiyIdea, 
  itemLabel, 
  materialType
}: DIYIdeaSectionProps) {
  const [diyIdea, setDiyIdea] = useState(initialDiyIdea);
  const [isError, setIsError] = useState(initialDiyIdea.includes("Creative repurposing possible"));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(!initialDiyIdea.includes("Creative repurposing possible"));

  const handleRefresh = async (): Promise<string> => {
    setIsRefreshing(true);
    setIsError(false);
    
    try {
      // Call the API endpoint for generating DIY ideas
      const response = await fetch('/api/generate-diy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: itemLabel,
          materialType: materialType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate DIY idea');
      }

      const data = await response.json();
      
      if (!data.diyIdea) {
        throw new Error('No DIY idea received from API');
      }
      
      return data.diyIdea;
    } catch (error) {
      console.error("Error refreshing DIY idea:", error);
      setIsError(true);
      // Return a fallback DIY idea
      return getFallbackDIYIdea(itemLabel, materialType);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getFallbackDIYIdea = (item: string, materialType: string): string => {
    const fallbackIdeas = [
      `🎯 **Recommendation**: Transform into a creative storage solution\n📋 **Steps to Make**:\n1. 🔧 Clean the item thoroughly\n2. 🎨 Paint with eco-friendly paint\n3. ✨ Add decorative elements\n4. 🎉 Use for organizing small items`,
      `🎯 **Recommendation**: Create a unique plant holder\n📋 **Steps to Make**:\n1. 🔧 Add drainage holes if needed\n2. 🎨 Decorate with natural materials\n3. ✨ Fill with soil and plant\n4. 🎉 Enjoy your new garden piece`,
      `🎯 **Recommendation**: Make a beautiful wall decoration\n📋 **Steps to Make**:\n1. 🔧 Prepare the surface\n2. 🎨 Paint or decorate creatively\n3. ✨ Add hanging mechanism\n4. 🎉 Display proudly in your space`,
      `🎯 **Recommendation**: Convert into a practical organizer\n📋 **Steps to Make**:\n1. 🔧 Measure and cut if needed\n2. 🎨 Personalize with your style\n3. ✨ Add compartments or dividers\n4. 🎉 Organize your belongings`,
      `🎯 **Recommendation**: Create a unique candle holder\n📋 **Steps to Make**:\n1. 🔧 Clean and prepare the surface\n2. 🎨 Decorate with twine or ribbon\n3. ✨ Add a tea light candle\n4. 🎉 Enjoy your cozy ambiance`,
      `🎯 **Recommendation**: Make a creative wind chime\n📋 **Steps to Make**:\n1. 🔧 Clean and remove sharp edges\n2. 🎨 Paint with weather-resistant paint\n3. ✨ Add string and beads\n4. 🎉 Hang in your garden`
    ];
    
    return fallbackIdeas[Math.floor(Math.random() * fallbackIdeas.length)];
  };

  const handleRefreshSuccess = (newDiyIdea: string) => {
    setDiyIdea(newDiyIdea);
    setIsError(false);
    setHasGenerated(true);
  };

  const handleGenerateFirstTime = async () => {
    const newDiyIdea = await handleRefresh();
    handleRefreshSuccess(newDiyIdea);
  };

  return (
    <div className="p-5 glass-effect rounded-xl border border-white/30 shadow-md md:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-purple-100">
            <Leaf className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="font-semibold text-gray-800">DIY Idea</h3>
        </div>
        
        {hasGenerated ? (
          <RefreshDIYButton 
            onRefresh={handleRefresh}
            onSuccess={handleRefreshSuccess}
          />
        ) : (
          <Button
            onClick={handleGenerateFirstTime}
            disabled={isRefreshing}
            className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {isRefreshing ? "Generating..." : "Generate Idea"}
              </span>
            </div>
          </Button>
        )}
      </div>
      
      {isRefreshing ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-sm text-gray-600">Generating new idea...</span>
        </div>
      ) : hasGenerated ? (
        <DIYIdeaDisplay diyIdea={diyIdea} />
      ) : (
        <div className="text-center py-8">
          <div className="mb-4 text-gray-400">💡</div>
          <p className="text-gray-600 mb-4">
            Ready to get creative? Generate a DIY idea for your item!
          </p>
          <p className="text-xs text-gray-500">
            Click "Generate Idea" to create a custom DIY project with step-by-step instructions.
          </p>
        </div>
      )}
      
      {/* Error handling message */}
      {isError && !isRefreshing && hasGenerated && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">DIY idea generation failed</span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Click the refresh button above to generate a new idea, or try a new analysis if the issue persists.
          </p>
        </div>
      )}
    </div>
  );
} 