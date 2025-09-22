import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { Leaf, TrendingUp, Zap, Target, Award, Sparkles, Star } from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import ImageUpload from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import AnalysisHistory from "@/components/analysis-history";
import { prisma } from "@/lib/prisma";
import { getRandomGreeting, calculateEcoAwarenessScore } from "@/lib/utils";
import EcoTipsSection from "@/components/eco-tips-section";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch all analyses for stats
  const allAnalyses = await prisma.analysis.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get only recent 5 for display
  const recentAnalyses = allAnalyses.slice(0, 5);

  // Calculate eco awareness score using shared function
  const ecoAwarenessScore = calculateEcoAwarenessScore(allAnalyses);

  // Get user's first name or default to 'User'
  const firstName = session.user.name?.split(' ')[0] || 'User';
  
  // Get a random greeting
  const greeting = getRandomGreeting(firstName);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        {/* Header - Modern Design */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
              {greeting}
            </h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Upload an image to analyze waste items and get eco-friendly recommendations.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stats Section - Enhanced with modern glass UI */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-400 to-green-600">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
                Your Impact
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              {[
                {
                  title: "Analyses",
                  value: allAnalyses.length,
                  description: "Total items analyzed",
                  color: "from-emerald-400 to-emerald-600",
                  icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
                  bgGradient: "from-emerald-50 to-emerald-100/50",
                  borderColor: "border-emerald-200/50",
                  sparkleColor: "text-emerald-400",
                  starColor: "text-emerald-500"
                },
                {
                  title: "Eco Awareness",
                  value: ecoAwarenessScore,
                  description: "Environmental awareness score",
                  color: "from-blue-400 to-blue-600",
                  icon: <Zap className="h-5 w-5 text-blue-500" />,
                  bgGradient: "from-blue-50 to-blue-100/50",
                  borderColor: "border-blue-200/50",
                  sparkleColor: "text-blue-400",
                  starColor: "text-blue-500"
                },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} backdrop-blur-sm group`}
                >
                  {/* Glass effect overlay */}
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm">
                      {stat.icon}
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{stat.title}</p>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                      <p className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>
                        {stat.value}
                      </p>
                      {stat.title === "Eco Awareness" && <p className="text-gray-600 text-sm mb-1 font-medium">pts</p>}
                      {stat.title === "Analyses" && <p className="text-gray-600 text-sm mb-1 font-medium">{stat.value === 1 ? 'item' : 'items'}</p>}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{stat.description}</p>
                  </div>
                  
                  {/* Enhanced decorative elements */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="relative">
                      <Sparkles className={`h-6 w-6 ${stat.sparkleColor} animate-pulse`} />
                      <Star className={`h-3 w-3 ${stat.starColor} absolute -top-1 -right-1 animate-bounce`} />
                    </div>
                  </div>
                  
                  {/* Background sparkles for subtle effect */}
                  <div className="absolute bottom-2 right-2 opacity-20">
                    <Sparkles className={`h-4 w-4 ${stat.sparkleColor}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Upload Section - Enhanced with modern glass UI */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
                Quick Upload
              </h2>
            </div>
            <p className="text-gray-600 mb-6">Take a photo or upload an image of waste items for instant analysis.</p>
            <ImageUpload />
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
              <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
                Recent Analyses
              </h2>
            </div>
          {recentAnalyses.length > 0 ? (
            <AnalysisHistory analyses={recentAnalyses} />
          ) : (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-gray-400" />
                <p className="text-gray-500 font-medium">No analyses yet</p>
                <Sparkles className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">Upload your first image to get started!</p>
            </div>
          )}
        </div>
        
        {/* Tips Section */}
        <EcoTipsSection />
      </div>
    </DashboardShell>
  );
} 