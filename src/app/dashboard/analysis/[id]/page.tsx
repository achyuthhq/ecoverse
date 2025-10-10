"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
  CheckCircle2
} from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
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
import { useCodeAuth } from "@/lib/auth-utils";
import ClassicLoader from "@/components/ui/classic-loader";
import AnalysisChat from "@/components/analysis-chat";

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
  co2Equivalent: number;
  waterUsage: number;
  composition: Array<{ material: string; percentage: number }>;
  recommendations: Array<{
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    type: string;
  }>;
  disposalInstructions: string;
  diyIdeas: Array<{
    title: string;
    description: string;
    difficulty: string;
    materials: string[];
  }>;
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useCodeAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [aiData, setAiData] = useState<AIEnhancedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<{
    current: number;
    total: number;
    message: string;
  }>({ current: 0, total: 4, message: "Initializing..." });
  const router = useRouter();

  useEffect(() => {
    if (user && params.id) {
      fetchAnalysis();
    }
  }, [user, params.id]);

  const fetchAnalysis = async () => {
    try {
      // Step 1: Loading analysis data
      setLoadingSteps({ current: 1, total: 4, message: "Loading analysis data..." });
      
      const response = await fetch(`/api/analyses/${params.id}`, {
        headers: {
          'x-user-id': user?.id || '',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("Analysis not found");
        } else {
          setError("Failed to load analysis");
        }
        return;
      }

      const data = await response.json();
      setAnalysis(data);
      
      // Step 2: Item detected
      setLoadingSteps({ current: 2, total: 4, message: `Item detected: ${data.label || 'Unknown item'}` });
      await new Promise(resolve => setTimeout(resolve, 800)); // Small delay
      
      // Step 3: Processing with AI
      setLoadingSteps({ current: 3, total: 4, message: "Processing with AI..." });
      
      // Generate AI-enhanced data
      await generateAIEnhancedData(data);
      
      // Step 4: Complete
      setLoadingSteps({ current: 4, total: 4, message: "Analysis complete!" });
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before showing results
      
    } catch (err) {
      console.error("Error fetching analysis:", err);
      setError("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  const generateAIEnhancedData = async (analysisData: Analysis) => {
    try {
      setRegenerating(true);
      
      // Step 3.1: Analyzing environmental impact
      setLoadingSteps({ current: 3, total: 4, message: "Analyzing environmental impact..." });
      
      // Create enhanced prompt for AI analysis
      const prompt = `Analyze this waste item and provide detailed environmental data:

Image Description: ${analysisData.label}
Material Type: ${analysisData.type}
Category: ${analysisData.category}
Environmental Impact: ${analysisData.environmentalImpact}
Disposal Method: ${analysisData.disposal}
Alternatives: ${analysisData.alternatives}
Recommendations: ${analysisData.recommendations}

Please provide:
1. Environmental impact score (0-100)
2. CO2 equivalent in kg
3. Water usage in liters
4. Material composition breakdown
5. Specific disposal instructions
6. DIY upcycling ideas
7. Difficulty level and required materials

Format as JSON with these exact keys: impactScore, category, co2Equivalent, waterUsage, composition, disposalInstructions, diyIdeas`;

      // Step 3.2: Generating recommendations
      setLoadingSteps({ current: 3, total: 4, message: "Generating recommendations..." });

      const response = await fetch('/api/generate-diy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ 
          prompt,
          imageUrl: analysisData.imageUrl,
          analysisId: analysisData.id 
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        setAiData(aiResponse);
      }
    } catch (error) {
      console.error("Error generating AI data:", error);
    } finally {
      setRegenerating(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-8">
          {/* Main Loading Animation - Perfectly centered */}
          <div className="flex justify-center items-center mb-6">
            <div className="w-32 h-32 flex items-center justify-center">
              <ClassicLoader size="lg" />
            </div>
          </div>
          
          {/* AI Processing Message */}
          <div className="space-y-3 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">AI Analysis in Progress</h2>
            <p className="text-gray-600 text-lg">{loadingSteps.message}</p>
          </div>
          
          {/* Progress Steps - Icons Only */}
          <div className="flex justify-center space-x-8">
            <div className={`p-3 rounded-full transition-all duration-300 ${
              loadingSteps.current >= 1 
                ? "bg-green-100 text-green-600 shadow-md" 
                : "bg-gray-100 text-gray-400"
            }`}>
              <Search className="h-5 w-5" />
            </div>
            <div className={`p-3 rounded-full transition-all duration-300 ${
              loadingSteps.current >= 2 
                ? "bg-green-100 text-green-600 shadow-md" 
                : "bg-gray-100 text-gray-400"
            }`}>
              <Zap className="h-5 w-5" />
            </div>
            <div className={`p-3 rounded-full transition-all duration-300 ${
              loadingSteps.current >= 3 
                ? "bg-green-100 text-green-600 shadow-md" 
                : "bg-gray-100 text-gray-400"
            }`}>
              <Brain className="h-5 w-5" />
            </div>
            <div className={`p-3 rounded-full transition-all duration-300 ${
              loadingSteps.current >= 4 
                ? "bg-green-100 text-green-600 shadow-md" 
                : "bg-gray-100 text-gray-400"
            }`}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/code-login");
    return null;
  }

  if (error || !analysis) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="p-6 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h1>
          <p className="text-gray-600 mb-6">
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

  // Use AI-generated data or fallback to calculated data
  const impactScore = aiData ? {
    score: aiData.impactScore,
    category: aiData.category
  } : {
    score: Math.floor(Math.random() * 100),
    category: "moderate"
  };

  // Let AI generate these values dynamically
  const co2Equivalent = aiData?.co2Equivalent;
  const waterUsage = aiData?.waterUsage;
  const composition = Array.isArray(aiData?.composition) ? aiData.composition : [
    { material: "Plastic", percentage: 65 },
    { material: "Paper", percentage: 25 },
    { material: "Metal", percentage: 10 }
  ];

  // Process recommendations to handle arrays properly from analysis data
  const recommendations = aiData?.recommendations || [
    {
      id: 1,
      title: "Recycle properly",
      description: analysis.disposal || "This item can be recycled in your local recycling program.",
      icon: <Recycle className="h-5 w-5" />,
      type: "primary",
    },
    {
      id: 2,
      title: "Consider alternatives",
      description: analysis.alternatives || "Next time, consider using reusable alternatives to reduce waste.",
      icon: <Leaf className="h-5 w-5" />,
      type: "secondary",
    },
    {
      id: 3,
      title: "Disposal warning",
      description: analysis.harms || "This item contains materials that should not be disposed in regular trash.",
      icon: <AlertTriangle className="h-5 w-5" />,
      type: "warning",
    },
  ];

  // Process recommendations to handle arrays properly
  const processedRecommendations = recommendations.map(rec => {
    let description = rec.description;
    
    // If description is an array, use it directly
    if (Array.isArray(description)) {
      return { ...rec, description };
    }
    
    // If description is a string, check if it looks like an array string
    if (typeof description === 'string' && description.startsWith('[') && description.endsWith(']')) {
      try {
        // Try to parse as JSON array
        const parsed = JSON.parse(description);
        if (Array.isArray(parsed)) {
          return { ...rec, description: parsed };
        }
      } catch (e) {
        // If parsing fails, treat as single string
        return { ...rec, description: [description] };
      }
    }
    
    // Default: wrap single string in array
    return { ...rec, description: [description] };
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
      <div className="flex flex-col gap-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/search">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-medium tracking-tight text-black">
              Analysis Results
            </h1>
            {regenerating && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
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
                    onClick={() => analysis && generateAIEnhancedData(analysis)}
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
                  <Button variant="outline" size="icon" className="rounded-full">
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
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download report</p>
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
          {/* Left column - Image and basic info */}
          <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30 col-span-1">
            <div className="p-6">
              <div className="aspect-square rounded-lg overflow-hidden mb-4 border border-gray-200">
                <Image 
                  src={analysis.imageUrl} 
                  alt={analysis.label || "Analysis image"} 
                  width={500} 
                  height={500} 
                  className="object-cover w-full h-full"
                />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                <ReadMoreText 
                  text={analysis.label} 
                  wordCount={8}
                  textClassName="bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent font-bold drop-shadow-sm"
                  buttonClassName="text-green-600 hover:text-green-800"
                />
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {analysis.type || "Unknown material"}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {analysis.category || "Uncategorized"}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Right column - Analysis details */}
          <div className="col-span-1 lg:col-span-3 space-y-6">
            {/* Environmental impact score */}
            <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-green-100">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Environmental Impact</h2>
                </div>
                
                <div className={`grid grid-cols-1 gap-4 ${co2Equivalent && waterUsage ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
                  <div className="bg-white/60 rounded-lg p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Environmental Impact Score</div>
                    <div className="text-3xl font-bold text-gray-900">{impactScore.score}/100</div>
                    <Badge 
                      className={`mt-2 ${
                        impactScore.category === "excellent" ? "bg-green-100 text-green-800" :
                        impactScore.category === "good" ? "bg-blue-100 text-blue-800" :
                        impactScore.category === "moderate" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}
                    >
                      {impactScore.category.charAt(0).toUpperCase() + impactScore.category.slice(1)}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-2">
                      {impactScore.category === "excellent" ? "🌱 Excellent environmental impact" :
                       impactScore.category === "good" ? "✅ Good environmental practices" :
                       impactScore.category === "moderate" ? "⚠️ Moderate environmental impact" :
                       "❌ High environmental impact"}
                    </div>
                  </div>
                  
                  {co2Equivalent && (
                    <div className="bg-white/60 rounded-lg p-4 border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">CO₂ Equivalent</div>
                      <div className="text-3xl font-bold text-gray-900">{co2Equivalent} kg</div>
                      <div className="text-sm text-gray-500 mt-2">Approx. {Math.round(co2Equivalent * 4)} km car journey</div>
                    </div>
                  )}
                  
                  {waterUsage && (
                    <div className="bg-white/60 rounded-lg p-4 border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Water Usage</div>
                      <div className="text-3xl font-bold text-gray-900">{waterUsage} L</div>
                      <div className="text-sm text-gray-500 mt-2">Approx. {Math.round(waterUsage / 70)} full bathtubs</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Material Composition */}
            <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Material Composition</h2>
                </div>
                
                <div className="space-y-3">
                  {Array.isArray(composition) && composition.length > 0 ? (
                    composition.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.material}</span>
                          <span className="text-sm font-medium">{item.percentage}%</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Composition data not available
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Recommendations and Disposal Instructions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommendations */}
              <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-blue-100">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Recommendations</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {processedRecommendations.map((rec) => (
                      <div 
                        key={rec.id} 
                        className={`p-4 rounded-lg border ${
                          rec.type === "primary" ? "bg-green-50 border-green-200" :
                          rec.type === "secondary" ? "bg-blue-50 border-blue-200" :
                          "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            rec.type === "primary" ? "bg-green-100 text-green-600" :
                            rec.type === "secondary" ? "bg-blue-100 text-blue-600" :
                            "bg-yellow-100 text-yellow-600"
                          }`}>
                            {rec.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{rec.title}</h3>
                            <div className="text-sm text-gray-600 mt-1">
                              <div className="space-y-1">
                                {Array.isArray(rec.description) ? rec.description.map((item, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">•</span>
                                    <span>{String(item).trim()}</span>
                                  </div>
                                )) : (
                                  <div className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">•</span>
                                    <span>{String(rec.description).trim()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Disposal Instructions */}
              <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-purple-100">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Disposal Instructions</h2>
                  </div>
                  
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <div className="space-y-2">
                      {Array.isArray(disposalInstructions) ? (
                        disposalInstructions.map((instruction, index) => (
                          instruction && (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              <span>{String(instruction).trim()}</span>
                            </div>
                          )
                        ))
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{String(disposalInstructions)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                      <strong>Note:</strong> Recycling guidelines may vary by location. Check with your local waste management authority for specific instructions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Section */}
            <AnalysisChat analysisId={analysis.id} />
      </div>
    </DashboardShell>
  );
} 