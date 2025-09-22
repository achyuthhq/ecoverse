import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import { 
  Trophy, 
  Users, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  Award,
  MessageSquare,
  ThumbsUp,
  Leaf
} from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Mock data for leaderboard
  const leaderboardUsers = [
    { id: 1, name: "Sarah Johnson", points: 1250, avatar: "/avatars/avatar-1.png", rank: 1 },
    { id: 2, name: "Michael Chen", points: 1120, avatar: "/avatars/avatar-2.png", rank: 2 },
    { id: 3, name: "Emma Williams", points: 980, avatar: "/avatars/avatar-3.png", rank: 3 },
    { id: 4, name: "David Kim", points: 875, avatar: "/avatars/avatar-4.png", rank: 4 },
    { id: 5, name: "Olivia Garcia", points: 810, avatar: "/avatars/avatar-5.png", rank: 5 },
  ];

  // Mock data for recent activities
  const recentActivities = [
    { 
      id: 1, 
      user: { name: "Sarah Johnson", avatar: "/avatars/avatar-1.png" },
      action: "analyzed",
      item: "Plastic Bottle",
      points: 15,
      time: "2 hours ago",
      type: "analysis"
    },
    { 
      id: 2, 
      user: { name: "Michael Chen", avatar: "/avatars/avatar-2.png" },
      action: "completed",
      item: "Zero Waste Week",
      points: 50,
      time: "5 hours ago",
      type: "challenge"
    },
    { 
      id: 3, 
      user: { name: "Emma Williams", avatar: "/avatars/avatar-3.png" },
      action: "shared",
      item: "Recycling Tips",
      points: 10,
      time: "1 day ago",
      type: "post"
    },
    { 
      id: 4, 
      user: { name: "David Kim", avatar: "/avatars/avatar-4.png" },
      action: "earned",
      item: "Eco Warrior Badge",
      points: 100,
      time: "2 days ago",
      type: "badge"
    },
  ];

  // Mock data for challenges
  const challenges = [
    {
      id: 1,
      title: "Zero Waste Week",
      description: "Go an entire week without producing any landfill waste",
      participants: 243,
      daysLeft: 5,
      progress: 65,
      image: "/challenges/zero-waste.jpg"
    },
    {
      id: 2,
      title: "Plastic-Free July",
      description: "Avoid single-use plastics for the entire month",
      participants: 512,
      daysLeft: 12,
      progress: 40,
      image: "/challenges/plastic-free.jpg"
    },
    {
      id: 3,
      title: "Community Cleanup",
      description: "Join a local cleanup event in your area",
      participants: 128,
      daysLeft: 3,
      progress: 80,
      image: "/challenges/cleanup.jpg"
    }
  ];

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
              Community Hub
          </h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Connect with fellow eco-warriors and participate in sustainability challenges
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Leaderboard */}
          <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-amber-100">
                  <Trophy className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Leaderboard</h2>
              </div>
              
              <div className="space-y-4">
                {leaderboardUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center font-semibold text-sm">
                        {user.rank === 1 && <span className="text-amber-500">🥇</span>}
                        {user.rank === 2 && <span className="text-gray-400">🥈</span>}
                        {user.rank === 3 && <span className="text-amber-700">🥉</span>}
                        {user.rank > 3 && <span className="text-gray-500">{user.rank}</span>}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-sm">{user.name}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Leaf className="h-3.5 w-3.5 text-green-500" />
                      <span className="font-semibold text-sm">{user.points}</span>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full text-sm">
                  View Full Leaderboard
                </Button>
              </div>
            </div>
          </div>

          {/* Middle Column - Activity Feed */}
          <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="p-4 rounded-lg bg-white/60 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-1 text-sm">
                          <span className="font-medium">{activity.user.name}</span>
                          <span className="text-gray-600">{activity.action}</span>
                          <span className="font-medium">{activity.item}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 hover:bg-green-100">
                            +{activity.points} points
                          </Badge>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {activity.type === "analysis" && (
                          <div className="p-1.5 rounded-full bg-blue-50 text-blue-500">
                            <Leaf className="h-4 w-4" />
                          </div>
                        )}
                        {activity.type === "challenge" && (
                          <div className="p-1.5 rounded-full bg-purple-50 text-purple-500">
                            <Award className="h-4 w-4" />
                          </div>
                        )}
                        {activity.type === "post" && (
                          <div className="p-1.5 rounded-full bg-amber-50 text-amber-500">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                        )}
                        {activity.type === "badge" && (
                          <div className="p-1.5 rounded-full bg-green-50 text-green-500">
                            <Trophy className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Challenges */}
          <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Challenges</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600">
                  View All
                </Button>
              </div>
              
              <div className="space-y-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="rounded-lg bg-white/60 border border-gray-100 overflow-hidden">
                    <div className="aspect-[3/1] relative">
                      <Image 
                        src={challenge.image} 
                        alt={challenge.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-3">
                        <h3 className="text-white font-medium">{challenge.title}</h3>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-3">
                        {challenge.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{challenge.participants} participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{challenge.daysLeft} days left</span>
                        </div>
                      </div>
                      
                      <Progress value={challenge.progress} className="h-1.5 mb-3" />
                      
                      <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-1">
                        <span>Join Challenge</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-green-100 mb-3">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">1,245</div>
              <div className="text-sm text-gray-500 mt-1">Items Analyzed</div>
            </div>
          </div>
          
          <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-blue-100 mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">842</div>
              <div className="text-sm text-gray-500 mt-1">Active Members</div>
            </div>
          </div>
          
          <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-amber-100 mb-3">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-500 mt-1">Active Challenges</div>
            </div>
          </div>
          
          <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-purple-100 mb-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">3.2K</div>
              <div className="text-sm text-gray-500 mt-1">Community Posts</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 