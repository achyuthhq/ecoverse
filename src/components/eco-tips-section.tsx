"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      
      // Try different API endpoints
      let response;
      try {
        response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      } catch (fetchError) {
        console.log("Primary API failed, trying alternative...");
        response = await fetch(`https://api.pollinations.ai/text/${encodeURIComponent(prompt)}`);
      }
      
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
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
            Eco Tips
          </h2>
        </div>
        <Button
          onClick={fetchNewTips}
          disabled={isLoadingTips}
          className="p-2 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
        >
          {isLoadingTips ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tips.map((tip, i) => (
          <div key={i} className={`relative overflow-hidden p-6 rounded-2xl border backdrop-blur-sm bg-gradient-to-br ${tip.color} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
            {/* Glass effect overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tip.bgGradient} rounded-2xl`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-3xl mb-3">{tip.icon}</div>
              <p className="text-sm font-medium text-gray-700 leading-relaxed">{tip.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 