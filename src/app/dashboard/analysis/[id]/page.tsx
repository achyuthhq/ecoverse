"use client";

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  Clock
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

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch the analysis
  const analysis = await prisma.analysis.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!analysis) {
    notFound();
  }

  // Calculate environmental impact score (example logic)
  const calculateImpactScore = (analysis: any) => {
    // This would be based on actual data in a real app
    const baseScore = Math.floor(Math.random() * 100);
    return {
      score: baseScore,
      category: baseScore > 80 ? "excellent" : baseScore > 60 ? "good" : baseScore > 40 ? "moderate" : "poor",
    };
  };

  const impactScore = calculateImpactScore(analysis);

  // Mock data for recommendations
  const recommendations = [
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
      title: "Disposal warning",
      description: "This item contains materials that should not be disposed in regular trash.",
      icon: <AlertTriangle className="h-5 w-5" />,
      type: "warning",
    },
  ];

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
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Analysis Results
            </h1>
          </div>
          <div className="flex items-center gap-2">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  textClassName="bg-gradient-to-r from-green-500 to-green-450 bg-clip-text text-transparent"
                  buttonClassName="text-blue-600 hover:text-green-700"
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
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Composition</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plastic</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Paper</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Metal</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Analysis details */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* Environmental impact score */}
            <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-green-100">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Environmental Impact</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-lg p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Impact Score</div>
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
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">CO₂ Equivalent</div>
                    <div className="text-3xl font-bold text-gray-900">2.4 kg</div>
                    <div className="text-sm text-gray-500 mt-2">Approx. 10 km car journey</div>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Water Usage</div>
                    <div className="text-3xl font-bold text-gray-900">140 L</div>
                    <div className="text-sm text-gray-500 mt-2">Approx. 2 full bathtubs</div>
                  </div>
                </div>
              </div>
            </div>
            
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
                  {recommendations.map((rec) => (
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
                        <div>
                          <h3 className="font-medium text-gray-900">{rec.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Additional info */}
            <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-purple-100">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Disposal Instructions</h2>
                </div>
                
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p>
                    This item should be disposed of according to local recycling guidelines. Based on our analysis:
                  </p>
                  <ul>
                    <li>Remove any non-recyclable components before disposal</li>
                    <li>Rinse the container to remove food residue</li>
                    <li>Place in your curbside recycling bin</li>
                    <li>Consider taking to a specialized recycling center for optimal processing</li>
                  </ul>
                  <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                    <strong>Note:</strong> Recycling guidelines may vary by location. Check with your local waste management authority for specific instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 