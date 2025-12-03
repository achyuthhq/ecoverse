"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Trophy, Medal, Award, Users, Zap, Target } from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import ProfilePicture from "@/components/ui/profile-picture";
import { calculateEcoAwarenessScore } from "@/lib/utils";
import ClassicLoader from "@/components/ui/classic-loader";

interface User {
  id: string;
  name: string;
  subscriptionType: string;
  subscriptionExpires?: string;
}

interface Analysis {
  id: string;
  imageUrl: string;
  label: string;
  category?: string;
  type?: string;
  createdAt: string;
}

interface LeaderboardUser {
  id: string;
  name: string;
  image?: string;
  profileShape?: string;
  analyses: Analysis[];
  ecoAwarenessScore: number;
  analysisCount: number;
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      return;
    }

    loadLeaderboardData();
  }, [session, status]);

  const loadLeaderboardData = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboardUsers(data);
      }
    } catch (error) {
      console.error("Failed to load leaderboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 pt-6 sm:pt-8 md:pt-4 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 -z-10 rounded-xl opacity-50" />
        
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Eco Champions Leaderboard
            </h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Recognizing our top contributors who are making a difference through environmental analysis
          </p>
        </div>
        
        {/* Leaderboard */}
        <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-400 to-green-600">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Top Eco Champions</h2>
            </div>
            
            <div className="space-y-4">
              {leaderboardUsers.map((user, index) => (
                <div 
                  key={user.id}
                  className="relative overflow-hidden flex items-center p-4 rounded-2xl transition-all duration-300 hover:scale-[1.01] glass-card"
                >
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center w-full">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      {index === 0 ? (
                        <div className="mx-auto bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                          <Medal className="h-4 w-4 text-white" />
                        </div>
                      ) : index === 1 ? (
                        <div className="mx-auto bg-gradient-to-r from-gray-300 to-gray-400 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                          <Medal className="h-4 w-4 text-white" />
                        </div>
                      ) : index === 2 ? (
                        <div className="mx-auto bg-gradient-to-r from-orange-600 to-orange-700 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                          <Medal className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <span className="text-lg font-semibold text-gray-300">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* User avatar */}
                    <div className="flex-shrink-0 ml-3 relative">
                      <ProfilePicture
                        src={user.image}
                        alt={user.name || "User"}
                        size="md"
                        shape={(user as any).profileShape || "circle"}
                        className={`${
                          index === 0 ? "border-yellow-400" : 
                          index === 1 ? "border-gray-300" : 
                          index === 2 ? "border-orange-600" : "border-white"
                        }`}
                      />
                      {index < 3 && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                          <Award className={`h-4 w-4 ${
                            index === 0 ? "text-yellow-400" : 
                            index === 1 ? "text-gray-400" : 
                            "text-orange-600"
                          }`} />
                        </div>
                      )}
                    </div>
                    
                    {/* User info */}
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-white">{user.name || "Anonymous User"}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Zap className="h-3 w-3 text-blue-400" />
                        <p className="text-sm text-gray-300">{user.analysisCount} analyses</p>
                      </div>
                    </div>
                    
                    {/* Eco awareness score badge */}
                    <div className="flex-shrink-0">
                      <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                        index === 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : 
                        index === 1 ? "bg-white/10 text-gray-300 border border-white/20" : 
                        index === 2 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : 
                        "bg-green-500/20 text-green-400 border border-green-500/30"
                      }`}>
                        {user.ecoAwarenessScore} pts
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {leaderboardUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No analysis data available yet. Be the first to contribute!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 