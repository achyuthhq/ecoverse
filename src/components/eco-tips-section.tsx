"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button2";

export default function EcoTipsSection() {
  const [tips, setTips] = useState([
    {
      tip: "Reduce single-use plastics by using reusable water bottles and bags.",
      icon: "🌱",
      color: "from-green-50 to-green-100/50 border-green-200/50",
      bgGradient: "from-green-400/10 to-green-600/10"
    },
    {
      tip: "Compost food waste to reduce methane emissions from landfills.",
      icon: "♻️",
      color: "from-blue-50 to-blue-100/50 border-blue-200/50",
      bgGradient: "from-blue-400/10 to-blue-600/10"
    },
    {
      tip: "Properly recycle electronic waste to recover valuable materials.",
      icon: "📱",
      color: "from-indigo-50 to-indigo-100/50 border-indigo-200/50",
      bgGradient: "from-indigo-400/10 to-indigo-600/10"
    }
  ]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  const fetchNewTips = async () => {
    setIsLoadingTips(true);
    try {
      const prompt = `Give me 3 eco-friendly tips for daily life. Format as JSON array with objects containing: tip (string), icon (emoji), color (tailwind gradient), bgGradient (tailwind gradient). Example: [{"tip": "Use bamboo toothbrush", "icon": "🦷", "color": "from-green-50 to-green-100/50 border-green-200/50", "bgGradient": "from-green-400/10 to-green-600/10"}]`;
      
      console.log("Fetching new tips...");
      
      // Use the new enter.pollinations.ai API
      const apiKey = process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY || '';
      const encodedPrompt = encodeURIComponent(prompt);
      const apiUrl = `https://enter.pollinations.ai/api/generate/text/${encodedPrompt}${apiKey ? `?key=${apiKey}` : ''}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tips: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log("API Response:", responseText);
      
      // Try to parse as JSON, fallback to default tips if parsing fails
      try {
        const newTips = JSON.parse(responseText);
        console.log("Parsed tips:", newTips);
        
        if (Array.isArray(newTips) && newTips.length >= 3) {
          setTips(newTips.slice(0, 3));
          console.log("Updated tips successfully");
        } else {
          console.log("Invalid tips format, using fallback");
          setFallbackTips();
        }
      } catch (parseError) {
        console.log("Failed to parse tips as JSON:", parseError);
        console.log("Response was:", responseText);
        setFallbackTips();
      }
    } catch (error) {
      console.error("Error fetching tips:", error);
      setFallbackTips();
    } finally {
      setIsLoadingTips(false);
    }
  };

  const setFallbackTips = () => {
    const fallbackTips = [
      {
        tip: "Switch to LED bulbs to reduce energy consumption by up to 80%",
        icon: "💡",
        color: "from-yellow-50 to-yellow-100/50 border-yellow-200/50",
        bgGradient: "from-yellow-400/10 to-yellow-600/10"
      },
      {
        tip: "Use public transport or carpool to reduce carbon emissions",
        icon: "🚌",
        color: "from-blue-50 to-blue-100/50 border-blue-200/50",
        bgGradient: "from-blue-400/10 to-blue-600/10"
      },
      {
        tip: "Plant native flowers to support local pollinators and biodiversity",
        icon: "🌸",
        color: "from-pink-50 to-pink-100/50 border-pink-200/50",
        bgGradient: "from-pink-400/10 to-pink-600/10"
      }
    ];
    setTips(fallbackTips);
  };

  return (
    <div className="glass-card p-4 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            Eco Tips
          </h2>
        </div>
        <Button
          onClick={fetchNewTips}
          disabled={isLoadingTips}
          className="p-1.5 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
        >
          {isLoadingTips ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tips.map((tip, i) => (
          <div key={i} className="relative overflow-hidden p-4 rounded-xl glass-card transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
            {/* Content */}
            <div className="relative z-10">
              <div className="text-2xl mb-2">{tip.icon}</div>
              <p className="text-xs font-medium text-white leading-relaxed">{tip.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 