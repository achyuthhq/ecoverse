import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Leaf, Heart, Target, Users, Globe, Zap, TrendingUp } from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeamMember from "@/components/team-member";
import ContactSection from "@/components/contact-section";

export default async function AboutPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8 lg:gap-12">
        {/* Enhanced Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 rounded-2xl sm:rounded-3xl shadow-xl">
              <Leaf className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              About Ecoverse
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg sm:text-xl px-4 leading-relaxed">
            Pioneering the future of sustainable waste management through AI innovation and community-driven environmental stewardship.
          </p>
        </div>

        {/* Enhanced Mission Section */}
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-green-400/20 rounded-full translate-y-24 -translate-x-24 blur-2xl" />
          
          <Card className="relative bg-gradient-to-br from-white via-gray-50/50 to-white border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-teal-500/5 to-blue-500/5" />
            
            <CardHeader className="relative pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-teal-600 bg-clip-text text-transparent">
                    Our Mission
                  </CardTitle>
                  <p className="text-gray-500 mt-1">Transforming waste management through AI innovation</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              {/* Mission Statement */}
              <div className="space-y-4">
                <p className="text-gray-700 text-lg leading-relaxed">
                  At Ecoverse, we envision a world where environmental sustainability is not just a choice, but a seamless part of everyday life. 
                  Our mission is to democratize access to intelligent waste management solutions, empowering individuals and communities to make 
                  informed decisions that positively impact our planet.
                </p>
                
                <p className="text-gray-700 text-lg leading-relaxed">
                  Through cutting-edge AI technology, we're revolutionizing how people interact with waste. Our platform transforms complex 
                  environmental decisions into simple, actionable insights, making sustainable living accessible to everyone, regardless of 
                  their background or expertise.
                </p>
              </div>
              
              {/* Key Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-green-500">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-800">AI-Powered Insights</h3>
                  </div>
                  <p className="text-green-700 text-sm leading-relaxed">
                    Leveraging advanced machine learning to provide instant, accurate waste classification and disposal guidance.
                  </p>
                </div>
                
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-blue-500">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-800">Community Impact</h3>
                  </div>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Building a global community of environmentally conscious individuals working together for a sustainable future.
                  </p>
                </div>
                
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-teal-500">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-teal-800">Environmental Stewardship</h3>
                  </div>
                  <p className="text-teal-700 text-sm leading-relaxed">
                    Committed to reducing waste, promoting recycling, and fostering sustainable practices across all communities.
                  </p>
                </div>
              </div>
              
              {/* Impact Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10">
                  <div className="text-2xl font-bold text-green-600">AI-Powered</div>
                  <div className="text-sm text-green-700">Waste Analysis</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                  <div className="text-2xl font-bold text-blue-600">Real-time</div>
                  <div className="text-sm text-blue-700">Guidance</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-600/10">
                  <div className="text-2xl font-bold text-teal-600">Community</div>
                  <div className="text-sm text-teal-700">Driven</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                  <div className="text-2xl font-bold text-purple-600">Sustainable</div>
                  <div className="text-sm text-purple-700">Future</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Team Section */}
        <div className="relative">
          <Card className="bg-gradient-to-br from-white via-gray-50/50 to-white border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-pink-600 bg-clip-text text-transparent">
                    Meet Our Team
                  </CardTitle>
                  <p className="text-gray-500 mt-1">The innovators behind Ecoverse's mission</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 lg:p-8">
              <div className="grid grid-cols-1 gap-8">
                <TeamMember
                  name="Achyuth"
                  title={
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-semibold">Student Innovator</span>
                      <span className="text-xs text-gray-400">(The Hyderabad Public School, Kadapa)</span>
                    </div>
                  }
                  description="A passionate young innovator with a drive to solve real-world environmental challenges. Leading Ecoverse's mission to revolutionize waste management through cutting-edge AI technology, combining technical expertise with a deep commitment to sustainability and community impact."
                  imageUrl="/images/2025-07-31 22_41_00-Window.png"
                  socialLinks={{
                    twitter: "https://x.com/@Achyuth_Rxch",
                    linkedin: "https://linkedin.com/in/achyuth04",
                    email: "achyuth@slayz.cc"
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contact Section */}
        <ContactSection
          email="achyuth@slayz.cc"
          socialLinks={{
            twitter: "https://x.com/@Achyuth_Rxch",
            github: "https://github.com/achyuth-c",
            linkedin: "https://linkedin.com/in/achyuth04"
          }}
        />
        
        {/* Enhanced Footer */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700">Ecoverse</span>
          </div>
          <p className="flex items-center justify-center gap-2 text-gray-500 mb-2">
            Made with <Heart className="h-4 w-4 text-red-500" /> by Achyuth
          </p>
          <p className="text-gray-400 text-sm">© 2025 Ecoverse. All rights reserved.</p>
        </div>
      </div>
    </DashboardShell>
  );
} 