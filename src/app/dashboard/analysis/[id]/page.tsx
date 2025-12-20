"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Trash2, 
  Info, 
  Leaf, 
  Recycle, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Zap,
  Brain,
  CheckCircle2,
  Play,
  Pause,
  Volume2
} from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button2";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import ReadMoreText from "@/components/read-more-text";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";
import ClassicLoader from "@/components/ui/classic-loader";
import AnalysisChat from "@/components/analysis-chat";
import ShareAnalysisModal from "@/components/share-analysis-modal";
import CityOnboardingModal from "@/components/city-onboarding-modal";
import { ShaderAnimation } from "@/components/shader-animation";

interface Analysis {
  id: string;
  imageUrl: string;
  label: string;
  type: string;
  category: string;
  degradability: string;
  environmentalImpact: string;
  harms: string;
  disposal: string;
  potentialForReuse: string;
  alternatives: string;
  recommendations: string;
  extraNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface AIEnhancedData {
  impactScore: number;
  category: string;
  co2Equivalent?: number;
  waterUsage?: number;
  landfillYears?: number;
  recyclability?: number;
  energyConsumption?: number;
  microplasticsRisk?: boolean;
  toxicityLevel?: string;
  composition: Array<{ material: string; percentage: number }>;
  recommendations?: Array<string>;
  disposalInstructions: string;
  diyIdeas: Array<{
    title: string;
    description: string;
    difficulty: string;
    materials: string[];
  }>;
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [aiData, setAiData] = useState<AIEnhancedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<{
    current: number;
    total: number;
    message: string;
  }>({ current: 0, total: 4, message: "Uploading..." });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const router = useRouter();
  const hasFetchedRef = useRef(false);
  const isGeneratingRef = useRef(false);
  const [cityMetrics, setCityMetrics] = useState<{ city: string | null; totalAnalyses: number } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (session?.user && params.id && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAnalysis();
    }
  }, [session?.user?.id, params.id]);

  useEffect(() => {
    const loadCityMetrics = async () => {
      try {
        const res = await fetch("/api/user/city-metrics");
        if (!res.ok) return;
        const data = await res.json();
        setCityMetrics({
          city: data.city,
          totalAnalyses: data.totalAnalyses,
        });
      } catch (error) {
        console.error("[CITY_METRICS] Failed to load in analysis page:", error);
      }
    };

    if (session?.user) {
      loadCityMetrics();
    }
  }, [session?.user]);

  const fetchAnalysis = async () => {
    console.log("[ANALYSIS] Starting analysis fetch");
    console.log("[ANALYSIS] Analysis ID:", params.id);
    try {
      // Fetch analysis data first (no loading steps yet)
      console.log("[ANALYSIS] Requesting analysis data from /api/analyses/" + params.id);
      
      const response = await fetch(`/api/analyses/${params.id}`);
      console.log("[ANALYSIS] Analysis data response status:", response.status);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Analysis not found");
        } else {
          setError("Failed to load analysis");
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("[ANALYSIS] Analysis data received:", { id: data.id, label: data.label });
      setAnalysis(data);
      
      // Extract data from extraNotes if available
      let existingAiData = null;
      let audioUrlFromNotes = null;
      
      if (data.extraNotes) {
        try {
          if (data.extraNotes.trim().startsWith('{')) {
            const extraNotesData = JSON.parse(data.extraNotes);
            console.log("[ANALYSIS] Parsed extraNotes, keys:", Object.keys(extraNotesData));
            
            // Extract audio URL if present
            if (extraNotesData.audioUrl) {
              audioUrlFromNotes = extraNotesData.audioUrl;
              setAudioUrl(audioUrlFromNotes);
              console.log("[ANALYSIS] Audio URL found in extraNotes:", audioUrlFromNotes.substring(0, 50) + "...");
            } else {
              console.log("[ANALYSIS] No audioUrl found in extraNotes, keys:", Object.keys(extraNotesData));
            }
            
            // Check if it contains AI data (has impactScore)
            if (extraNotesData.impactScore !== undefined) {
              existingAiData = extraNotesData;
              console.log("[ANALYSIS] Existing AI data found in extraNotes, using cached data");
              console.log("[ANALYSIS] AI data has impactScore:", existingAiData.impactScore);
              console.log("[ANALYSIS] AI data keys:", Object.keys(existingAiData));
              setAiData(existingAiData);
              // Make sure audioUrl is set if it exists in the data
              if (extraNotesData.audioUrl && !audioUrlFromNotes) {
                setAudioUrl(extraNotesData.audioUrl);
                console.log("[ANALYSIS] Audio URL found in AI data");
              }
              // Data already exists, skip loading animation - set loading to false IMMEDIATELY
              setLoading(false);
              return; // Exit early, data already exists
            } else {
              console.log("[ANALYSIS] extraNotes contains JSON but not valid AI data (no impactScore)");
            }
          } else {
            console.log("[ANALYSIS] extraNotes contains non-JSON data (likely original caption), will generate AI data");
          }
        } catch (e) {
          console.error("[ANALYSIS] Error parsing existing data from extraNotes:", e);
          console.log("[ANALYSIS] Will generate new AI data due to parse error");
        }
      } else {
        console.log("[ANALYSIS] No extraNotes found, will generate AI data");
      }
      
      // Only show loading animation if we need to generate new AI data
      if (!existingAiData) {
        console.log("[ANALYSIS] No existing AI data found, generating new AI-enhanced data");
        
        // Step 1: Loading analysis data
        setLoadingSteps({ current: 1, total: 4, message: "Uploading..." });
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Step 2: Item detected
        setLoadingSteps({ current: 2, total: 4, message: "Recognizing..." });
        console.log("[ANALYSIS] Step 2: Item detected -", data.label || 'Unknown item');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 3: Processing with AI
        setLoadingSteps({ current: 3, total: 4, message: "Thinking..." });
        // Generate AI-enhanced data
        await generateAIEnhancedData(data);
        
        // Step 4: Complete
        setLoadingSteps({ current: 4, total: 4, message: "Analysis complete!" });
        console.log("[ANALYSIS] Analysis fetch completed successfully");
        await new Promise(resolve => setTimeout(resolve, 300)); // Small delay before showing results
      }
      
    } catch (err) {
      console.error("Error fetching analysis:", err);
      setError("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  const generateAIEnhancedData = async (analysisData: Analysis, forceRegenerate: boolean = false) => {
    console.log("[REGENERATE] Regenerate button clicked");
    console.log("[REGENERATE] Analysis ID:", analysisData.id);
    console.log("[REGENERATE] Force regenerate:", forceRegenerate);
    
    // Prevent multiple simultaneous calls
    if (isGeneratingRef.current && !forceRegenerate) {
      console.log("[REGENERATE] Already generating, skipping duplicate call");
      return;
    }
    
    try {
      isGeneratingRef.current = true;
      setRegenerating(true);
      console.log("[REGENERATE] Starting AI-enhanced data generation...");
      
      // Step 3.1: Analyzing environmental impact
      setLoadingSteps({ current: 3, total: 4, message: "Thinking..." });
      console.log("[REGENERATE] Step 3.1: Analyzing environmental impact");
      
      // Create enhanced prompt for AI analysis with more environmental parameters
      const prompt = `You are an expert environmental analyst. Analyze this waste item and provide comprehensive environmental data.

**Item Details:**
- Image Description: ${analysisData.label}
- Material Type: ${analysisData.type || 'Unknown'}
- Category: ${analysisData.category || 'Uncategorized'}
- Degradability: ${analysisData.degradability || 'Unknown'}
- Environmental Impact: ${typeof analysisData.environmentalImpact === 'string' ? analysisData.environmentalImpact : JSON.stringify(analysisData.environmentalImpact)}
- Disposal Method: ${typeof analysisData.disposal === 'string' ? analysisData.disposal : JSON.stringify(analysisData.disposal)}
- Alternatives: ${typeof analysisData.alternatives === 'string' ? analysisData.alternatives : JSON.stringify(analysisData.alternatives)}

Provide a detailed analysis in JSON format with these exact fields:
{
  "impactScore": <number 0-100, be realistic based on the item type and material>,
  "category": "<excellent|good|moderate|poor>",
  "co2Equivalent": <number in kg CO2, be realistic: plastic items 2-5kg, metal 1-3kg, paper 0.5-2kg, electronics 5-15kg, organic 0.1-1kg>,
  "waterUsage": <number in liters, be realistic: plastic 50-200L, metal 100-500L, paper 10-50L, electronics 200-1000L, organic 5-20L>,
  "landfillYears": <number of years to decompose, realistic: plastic 100-1000, metal 50-500, paper 2-5, organic 0.5-2>,
  "recyclability": <percentage 0-100, how recyclable this item is>,
  "energyConsumption": <number in kWh for production, realistic estimate>,
  "microplasticsRisk": <true|false, if item contributes to microplastics>,
  "toxicityLevel": "<low|medium|high>",
  "composition": [
    {"material": "<specific material name>", "percentage": <number that adds up to 100>},
    {"material": "<specific material name>", "percentage": <number>},
    {"material": "<specific material name>", "percentage": <number>}
  ],
  "disposalInstructions": [
    "<specific, actionable instruction 1>",
    "<specific, actionable instruction 2>",
    "<specific, actionable instruction 3>"
  ],
  "recommendations": [
    "<unique recommendation 1 based on disposal data>",
    "<unique recommendation 2 based on alternatives>",
    "<unique recommendation 3 based on environmental impact>",
    "<unique recommendation 4 for reducing waste>",
    "<unique recommendation 5 for reuse/repurpose>"
  ],
  "diyIdeas": [
    {
      "title": "<creative project title>",
      "description": "<detailed step-by-step description>",
      "difficulty": "<Easy|Medium|Hard>",
      "materials": ["<specific material 1>", "<specific material 2>", "<specific material 3>"]
    }
  ]
}

IMPORTANT: 
- Return ONLY valid JSON, no markdown code blocks
- Be specific and realistic, not generic
- Base all data on the actual item: ${analysisData.label}
- CO2 and water usage must be realistic based on material type
- All 5 recommendations must be UNIQUE and different from each other
- Percentages in composition must add up to 100`;

      // Step 3.2: Generating recommendations
      setLoadingSteps({ current: 3, total: 4, message: "Generating..." });
      console.log("[REGENERATE] Step 3.2: Generating recommendations");

      // Get model from analysis if stored, otherwise default to openai
      // For now, we'll use openai as default since model isn't stored in DB yet
      const model = 'openai';
      console.log("[REGENERATE] Using AI model:", model);
      console.log("[REGENERATE] Requesting /api/generate-diy with:", {
        analysisId: analysisData.id,
        imageUrl: analysisData.imageUrl,
        model: model
      });
      
      const response = await fetch('/api/generate-diy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          imageUrl: analysisData.imageUrl,
          analysisId: analysisData.id,
          model: model
        }),
      });

      console.log("[REGENERATE] API response status:", response.status);
      if (response.ok) {
        const aiResponse = await response.json();
        console.log("[REGENERATE] AI-enhanced data received successfully");
        setAiData(aiResponse);
        
        // Save AI data to database so it persists on refresh
        console.log("[REGENERATE] Saving AI data to database...");
        try {
          const saveResponse = await fetch(`/api/analyses/${analysisData.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ aiData: aiResponse }),
          });
          
          if (saveResponse.ok) {
            console.log("[REGENERATE] AI data saved to database successfully");
            
            // After saving AI data, generate TTS if it doesn't exist yet
            const updatedResponse = await fetch(`/api/analyses/${analysisData.id}`);
            if (updatedResponse.ok) {
              const updatedData = await updatedResponse.json();
              if (updatedData.extraNotes) {
                try {
                  if (updatedData.extraNotes.trim().startsWith('{')) {
                    const parsed = JSON.parse(updatedData.extraNotes);
                    if (parsed.audioUrl && !audioUrl) {
                      setAudioUrl(parsed.audioUrl);
                      console.log("[REGENERATE] Audio URL found after saving AI data");
                    }
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          } else {
            console.error("[REGENERATE] Failed to save AI data to database, status:", saveResponse.status);
          }
        } catch (saveError) {
          console.error("[REGENERATE] Error saving AI data to database:", saveError);
        }
      } else {
        console.error("[REGENERATE] API request failed with status:", response.status);
      }
    } catch (error) {
      console.error("[REGENERATE] Error generating AI data:", error);
    } finally {
      setRegenerating(false);
      isGeneratingRef.current = false;
      console.log("[REGENERATE] AI-enhanced data generation completed");
    }
  };

  // Only show loading if session is loaded AND we're actually loading analysis
  // Don't show loading just because session is checking
  if (status === "loading") {
    // Show minimal loading while session loads
    return (
      <div className="fixed inset-0 w-screen h-screen z-50 bg-[#0c0c0c] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show full loading animation only when actually fetching/generating analysis
  if (loading && session?.user) {
    return (
      <div className="fixed inset-0 w-screen h-screen z-50">
        <ShaderAnimation />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center px-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8">AI Analysis in Progress</h2>
            <motion.p
              key={loadingSteps.message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-lg sm:text-xl md:text-2xl font-semibold text-emerald-300/90 tracking-wide"
            >
              {loadingSteps.message}
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/login");
    return null;
  }

  if (error || !analysis) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="p-6 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Analysis Not Found</h1>
          <p className="text-gray-300 mb-6">
            {error || "The analysis you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Link href="/dashboard">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  // Use AI-generated data only if it exists
  const impactScore = aiData && aiData.impactScore !== undefined ? {
    score: aiData.impactScore,
    category: aiData.category || "moderate"
  } : null;

  // Let AI generate these values dynamically
  const co2Equivalent = aiData?.co2Equivalent;
  const waterUsage = aiData?.waterUsage;
  const landfillYears = aiData?.landfillYears;
  const recyclability = aiData?.recyclability;
  const energyConsumption = aiData?.energyConsumption;
  const microplasticsRisk = aiData?.microplasticsRisk;
  const toxicityLevel = aiData?.toxicityLevel;
  const composition = Array.isArray(aiData?.composition) ? aiData.composition : [
    { material: "Plastic", percentage: 65 },
    { material: "Paper", percentage: 25 },
    { material: "Metal", percentage: 10 }
  ];

  // Parse recommendations from analysis data - use actual data from disposal, alternatives, harms
  const parseJsonField = (field: any): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field.filter(f => f && String(f).trim() !== 'undefined' && String(f).trim() !== 'null').map(f => String(f).trim());
    if (typeof field === 'string') {
      try {
        if (field.startsWith('[') || field.startsWith('{')) {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) return parsed.filter(f => f && String(f).trim() !== 'undefined' && String(f).trim() !== 'null').map(f => String(f).trim());
          if (typeof parsed === 'object' && parsed !== null) {
            // If it's an object with reduce/reuse/recycle keys
            const values = Object.values(parsed).filter(v => v && String(v).trim() !== 'undefined' && String(v).trim() !== 'null').map(v => String(v).trim());
            return values;
          }
        }
        return [field.trim()];
      } catch (e) {
        return [field.trim()];
      }
    }
    return [];
  };

  // Use AI-generated recommendations if available, otherwise build from analysis data
  let recommendations = [];
  
  if (aiData?.recommendations && Array.isArray(aiData.recommendations) && aiData.recommendations.length > 0) {
    // Use AI-generated recommendations
    const titles = ["Proper Disposal", "Eco-Friendly Alternatives", "Environmental Impact", "Reduce Waste", "Reuse & Repurpose"];
    const icons = [<Recycle className="h-5 w-5" />, <Leaf className="h-5 w-5" />, <AlertTriangle className="h-5 w-5" />, <Leaf className="h-5 w-5" />, <Recycle className="h-5 w-5" />];
    const types = ["primary", "secondary", "warning", "primary", "secondary"];
    
    recommendations = aiData.recommendations.slice(0, 5).map((rec, index) => ({
      id: index + 1,
      title: titles[index] || `Recommendation ${index + 1}`,
      description: String(rec).trim(),
      icon: icons[index] || <CheckCircle className="h-5 w-5" />,
      type: types[index] || "primary",
    }));
  } else {
    // Build recommendations from analysis data
    const disposalItems = parseJsonField(analysis.disposal);
    const alternativesItems = parseJsonField(analysis.alternatives);
    const harmsItems = parseJsonField(analysis.harms);
    
    // Recommendation 1: From disposal data
    if (disposalItems.length > 0) {
      recommendations.push({
        id: 1,
        title: "Proper Disposal",
        description: disposalItems[0],
        icon: <Recycle className="h-5 w-5" />,
        type: "primary",
      });
    }
    
    // Recommendation 2: From alternatives data
    if (alternativesItems.length > 0) {
      recommendations.push({
        id: 2,
        title: "Eco-Friendly Alternatives",
        description: alternativesItems[0],
        icon: <Leaf className="h-5 w-5" />,
        type: "secondary",
      });
    }
    
    // Recommendation 3: From harms/environmental impact
    if (harmsItems.length > 0) {
      recommendations.push({
        id: 3,
        title: "Environmental Impact",
        description: harmsItems[0],
        icon: <AlertTriangle className="h-5 w-5" />,
        type: "warning",
      });
    }
    
    // Recommendation 4: Additional disposal tip if available
    if (disposalItems.length > 1) {
      recommendations.push({
        id: 4,
        title: "Additional Disposal Tip",
        description: disposalItems[1],
        icon: <CheckCircle className="h-5 w-5" />,
        type: "primary",
      });
    }
    
    // Recommendation 5: Additional alternative if available
    if (alternativesItems.length > 1) {
      recommendations.push({
        id: 5,
        title: "More Alternatives",
        description: alternativesItems[1],
        icon: <Leaf className="h-5 w-5" />,
        type: "secondary",
      });
    }
    
    // Fallback if no recommendations found
    if (recommendations.length === 0) {
      recommendations = [
        {
          id: 1,
          title: "Recycle properly",
          description: "This item can be recycled in your local recycling program.",
          icon: <Recycle className="h-5 w-5" />,
          type: "primary",
        },
        {
          id: 2,
          title: "Consider alternatives",
          description: "Next time, consider using reusable alternatives to reduce waste.",
          icon: <Leaf className="h-5 w-5" />,
          type: "secondary",
        },
        {
          id: 3,
          title: "Follow guidelines",
          description: "Check local waste management guidelines for proper disposal.",
          icon: <AlertTriangle className="h-5 w-5" />,
          type: "warning",
        }
      ];
    }
  }

  // Process recommendations - ensure all are valid strings
  const processedRecommendations = recommendations.map(rec => {
    let description = rec.description;
    
    // Ensure description is always a valid string
    if (!description || description === 'undefined' || description === 'null' || description.trim() === '') {
      // Use fallback based on title
      if (rec.title.includes("Disposal") || rec.title.includes("Recycle")) {
        description = "This item can be recycled in your local recycling program.";
      } else if (rec.title.includes("Alternative")) {
        description = "Next time, consider using reusable alternatives to reduce waste.";
      } else if (rec.title.includes("Impact") || rec.title.includes("warning")) {
        description = "This item contains materials that should not be disposed in regular trash.";
      } else {
        description = "Follow proper disposal guidelines for this item type.";
      }
    }
    
    return { ...rec, description: String(description).trim() };
  });

  // Handle disposal instructions - could be string, array, or other
  let disposalInstructions;
  if (aiData?.disposalInstructions) {
    disposalInstructions = Array.isArray(aiData.disposalInstructions) 
      ? aiData.disposalInstructions 
      : [aiData.disposalInstructions];
  } else if (analysis.disposal) {
    disposalInstructions = Array.isArray(analysis.disposal) 
      ? analysis.disposal 
      : [analysis.disposal];
  } else {
    disposalInstructions = ["This item should be disposed of according to local recycling guidelines."];
  }

  return (
    <DashboardShell>
      {/* City onboarding popup on analysis page as well */}
      <CityOnboardingModal />

      {/* Audio Control Button - Top Right Corner */}
      {audioUrl && (
        <div className="fixed top-4 right-4 z-[100] pointer-events-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 glass-card border-white/20 hover:bg-white/10 bg-black/50 backdrop-blur-sm"
                  onClick={() => {
                    if (audioRef.current) {
                      if (isPlayingAudio) {
                        audioRef.current.pause();
                        setIsPlayingAudio(false);
                      } else {
                        audioRef.current.play();
                        setIsPlayingAudio(true);
                      }
                    }
                  }}
                >
                  {isPlayingAudio ? (
                    <Pause className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-emerald-400" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPlayingAudio ? 'Pause Audio' : 'Play Audio Analysis'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="flex flex-col gap-6 pt-6 sm:pt-8 md:pt-4">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/search">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <h1 className="text-2xl font-medium tracking-tight text-white">
                Analysis Results
              </h1>
              {cityMetrics?.city && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Your city <span className="text-white font-medium">{cityMetrics.city}</span> has{" "}
                  <span className="text-emerald-400 font-semibold">
                    {cityMetrics.totalAnalyses}{" "}
                  </span>
                  items analyzed in Ecoverse so far.
                </p>
              )}
            </div>
            {regenerating && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ClassicLoader size="sm" />
                <span>AI Regenerating...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => analysis && generateAIEnhancedData(analysis, true)}
                    disabled={regenerating}
                  >
                    {regenerating ? (
                      <ClassicLoader size="sm" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Regenerate AI Analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left column - Image and basic info - matches Environmental Impact height */}
          <div className="glass-card rounded-xl shadow-lg overflow-hidden border border-white/10 col-span-1 self-start">
            <div className="p-6">
              <div className="aspect-square rounded-lg overflow-hidden mb-4 border border-white/10">
                <Image 
                  src={analysis.imageUrl} 
                  alt={analysis.label || "Analysis image"} 
                  width={500} 
                  height={500} 
                  className="object-cover w-full h-full"
                />
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-2">
                <ReadMoreText 
                  text={analysis.label} 
                  wordCount={8}
                  textClassName="text-white font-semibold drop-shadow-sm"
                  buttonClassName="text-emerald-400 hover:text-emerald-300"
                />
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="glass-card text-emerald-300 border-emerald-500/30">
                  {analysis.type || "Unknown material"}
                </Badge>
                <Badge variant="outline" className="glass-card text-blue-300 border-blue-500/30">
                  {analysis.category || "Uncategorized"}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-300">
                <Clock className="h-4 w-4 mr-1" />
                <span>Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Right column - Environmental Impact only */}
          <div className="col-span-1 lg:col-span-3">
            {/* Environmental impact score */}
            <div className="glass-card rounded-xl shadow-lg overflow-hidden border border-white/10">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full glass-card border border-emerald-500/30">
                    <Leaf className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Environmental Impact</h2>
                </div>
                
                <div className={`grid grid-cols-1 gap-4 ${co2Equivalent || waterUsage || impactScore ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'}`}>
                  {/* Impact Score Card - Only show if AI data exists */}
                  {impactScore && (
                    <div className="glass-card rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-300 mb-1">Environmental Impact Score</div>
                      <div className="text-3xl font-semibold text-white">{impactScore.score}/100</div>
                    <Badge 
                      className={`mt-2 glass-card border ${
                        impactScore.category === "excellent" ? "text-emerald-300 border-emerald-500/30" :
                        impactScore.category === "good" ? "text-blue-300 border-blue-500/30" :
                        impactScore.category === "moderate" ? "text-yellow-300 border-yellow-500/30" :
                        "text-red-300 border-red-500/30"
                      }`}
                    >
                      {impactScore.category.charAt(0).toUpperCase() + impactScore.category.slice(1)}
                    </Badge>
                    <div className="text-sm text-gray-300 mt-2">
                      {impactScore.category === "excellent" ? "🌱 Excellent environmental impact" :
                       impactScore.category === "good" ? "✅ Good environmental practices" :
                       impactScore.category === "moderate" ? "⚠️ Moderate environmental impact" :
                       "❌ High environmental impact"}
                      </div>
                    </div>
                  )}
                  
                  {co2Equivalent && (
                    <div className="glass-card rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-300 mb-1">CO₂ Equivalent</div>
                      <div className="text-3xl font-semibold text-white">{co2Equivalent} kg</div>
                      <div className="text-sm text-gray-300 mt-2">≈ {Math.round(co2Equivalent * 4)} km car journey</div>
                    </div>
                  )}
                  
                  {waterUsage && (
                    <div className="glass-card rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-300 mb-1">Water Usage</div>
                      <div className="text-3xl font-semibold text-white">{waterUsage} L</div>
                      <div className="text-sm text-gray-300 mt-2">≈ {Math.round(waterUsage / 70)} full bathtubs</div>
                    </div>
                  )}

                  {landfillYears && (
                    <div className="glass-card rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-300 mb-1">Decomposition Time</div>
                      <div className="text-3xl font-semibold text-white">{landfillYears} years</div>
                      <div className="text-sm text-gray-300 mt-2">Time to decompose in landfill</div>
                    </div>
                  )}

                  {recyclability !== undefined && (
                    <div className="glass-card rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-300 mb-1">Recyclability</div>
                      <div className="text-3xl font-semibold text-white">{recyclability}%</div>
                      <div className="text-sm text-gray-300 mt-2">Percentage recyclable</div>
                    </div>
                  )}

                  {energyConsumption && (
                    <div className="glass-card rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-300 mb-1">Energy Consumption</div>
                      <div className="text-3xl font-semibold text-white">{energyConsumption} kWh</div>
                      <div className="text-sm text-gray-300 mt-2">Production energy required</div>
                    </div>
                  )}

                  {microplasticsRisk !== undefined && (
                    <div className="glass-card rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-300 mb-1">Microplastics Risk</div>
                      <div className={`text-2xl font-semibold ${microplasticsRisk ? 'text-red-400' : 'text-emerald-400'}`}>
                        {microplasticsRisk ? '⚠️ High' : '✅ Low'}
                      </div>
                      <div className="text-sm text-gray-300 mt-2">Contributes to microplastics</div>
                    </div>
                  )}

                  {toxicityLevel && (
                    <div className="glass-card rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-300 mb-1">Toxicity Level</div>
                      <div className={`text-2xl font-semibold ${
                        toxicityLevel === 'high' ? 'text-red-400' :
                        toxicityLevel === 'medium' ? 'text-yellow-400' :
                        'text-emerald-400'
                      }`}>
                        {toxicityLevel.charAt(0).toUpperCase() + toxicityLevel.slice(1)}
                      </div>
                      <div className="text-sm text-gray-300 mt-2">Hazard level</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full width sections below */}
        <div className="space-y-6">
          {/* Material Composition */}
          <div className="glass-card rounded-xl shadow-lg overflow-hidden border border-white/10">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full glass-card border border-blue-500/30">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Material Composition</h2>
              </div>
              
              <div className="space-y-3">
                {Array.isArray(composition) && composition.length > 0 ? (
                  composition.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{item.material}</span>
                        <span className="text-sm font-medium text-white">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-300 italic">
                    Composition data not available
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recommendations and Disposal Instructions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations */}
            <div className="glass-card rounded-xl shadow-lg overflow-hidden border border-white/10">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full glass-card border border-blue-500/30">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Recommendations</h2>
                </div>
                
                <div className="space-y-4">
                    {processedRecommendations.map((rec) => {
                      // Safely get description
                      let descriptionText = '';
                      if (rec.description) {
                        if (Array.isArray(rec.description)) {
                          descriptionText = rec.description.filter(d => d && String(d).trim() !== 'undefined').map(d => String(d).trim()).join(' ');
                        } else {
                          const descStr = String(rec.description).trim();
                          if (descStr && descStr !== 'undefined' && descStr !== 'null') {
                            descriptionText = descStr;
                          }
                        }
                      }
                      
                      // Fallback if description is empty
                      if (!descriptionText) {
                        if (rec.title === "Recycle properly") {
                          descriptionText = "This item can be recycled in your local recycling program.";
                        } else if (rec.title === "Consider alternatives") {
                          descriptionText = "Next time, consider using reusable alternatives to reduce waste.";
                        } else {
                          descriptionText = "Follow proper disposal guidelines for this item type.";
                        }
                      }
                      
                      return (
                        <div 
                          key={rec.id} 
                          className={`p-4 rounded-lg border glass-card ${
                            rec.type === "primary" ? "border-emerald-500/30" :
                            rec.type === "secondary" ? "border-blue-500/30" :
                            "border-yellow-500/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full glass-card border ${
                              rec.type === "primary" ? "text-emerald-400 border-emerald-500/30" :
                              rec.type === "secondary" ? "text-blue-400 border-blue-500/30" :
                              "text-yellow-400 border-yellow-500/30"
                            }`}>
                              {rec.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white">{rec.title}</h3>
                              <div className="text-sm text-gray-300 mt-1">
                                <p>{descriptionText}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            
            {/* Disposal Instructions */}
            <div className="glass-card rounded-xl shadow-lg overflow-hidden border border-white/10">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full glass-card border border-purple-500/30">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Disposal Instructions</h2>
                </div>
                
                <div className="prose prose-sm max-w-none">
                    <div className="space-y-2">
                      {Array.isArray(disposalInstructions) ? (
                        disposalInstructions.map((instruction, index) => (
                          instruction && (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-emerald-400 mt-1">•</span>
                              <span className="text-gray-300">{String(instruction).trim()}</span>
                            </div>
                          )
                        ))
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">•</span>
                          <span className="text-gray-300">{String(disposalInstructions)}</span>
                        </div>
                      )}
                    </div>
                  <p className="text-sm glass-card p-3 rounded-lg border border-blue-500/30 mt-4 text-gray-300">
                    <strong className="text-white">Note:</strong> Recycling guidelines may vary by location. Check with your local waste management authority for specific instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Section */}
        <AnalysisChat 
          analysisId={analysis.id} 
          initialAnalysisData={{
            label: analysis.label,
            materialType: analysis.type || 'Unknown',
            category: analysis.category || 'Uncategorized',
            degradability: analysis.degradability || 'Unknown',
            reusePotenial: analysis.potentialForReuse || 'Unknown',
            environmentalImpact: typeof analysis.environmentalImpact === 'string' 
              ? JSON.parse(analysis.environmentalImpact || '[]') 
              : (Array.isArray(analysis.environmentalImpact) ? analysis.environmentalImpact : []),
            harms: typeof analysis.harms === 'string' 
              ? JSON.parse(analysis.harms || '[]') 
              : (Array.isArray(analysis.harms) ? analysis.harms : []),
            disposal: typeof analysis.disposal === 'string' 
              ? JSON.parse(analysis.disposal || '[]') 
              : (Array.isArray(analysis.disposal) ? analysis.disposal : []),
            alternatives: typeof analysis.alternatives === 'string' 
              ? JSON.parse(analysis.alternatives || '[]') 
              : (Array.isArray(analysis.alternatives) ? analysis.alternatives : []),
            recommendations: typeof analysis.recommendations === 'string' 
              ? JSON.parse(analysis.recommendations || '{}') 
              : (analysis.recommendations || {})
          }}
        />
      </div>

      {/* Share Modal */}
      <ShareAnalysisModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        analysisId={analysis.id}
        analysisLabel={analysis.label}
      />
      
      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlayingAudio(false)}
          onPause={() => setIsPlayingAudio(false)}
          onPlay={() => setIsPlayingAudio(true)}
          className="hidden"
        />
      )}
    </DashboardShell>
  );
} 