"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf, Heart, Users, Target, Globe, Zap, Shield, Award, Star, ArrowRight } from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCodeAuth } from "@/lib/auth-utils";
import ClassicLoader from "@/components/ui/classic-loader";

export default function AboutPage() {
  const { user, isLoading } = useCodeAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 -z-10 rounded-xl opacity-50" />
        
        {/* Hero Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Leaf className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
              About Ecoverse
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg px-4">
            Empowering individuals to make sustainable choices through AI-powered waste analysis and environmental education
          </p>
        </div>

        {/* Mission Section */}
        <Card className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                <Target className="h-6 w-6 text-white" />
              </div>
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-gray-700 text-center text-lg leading-relaxed">
              Ecoverse is an AI-powered platform that helps users identify waste items, 
              understand their environmental impact, and learn about proper disposal methods 
              and eco-friendly alternatives. We're building a community of environmentally 
              conscious individuals working together to create a more sustainable future.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg w-fit mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Advanced machine learning algorithms identify waste items and provide detailed environmental impact assessments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg w-fit mx-auto mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Eco-Friendly Solutions</h3>
              <p className="text-gray-600">
                Learn about sustainable alternatives, proper disposal methods, and eco-friendly practices
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Driven</h3>
              <p className="text-gray-600">
                Join a global community of environmentally conscious individuals working together for change
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg w-fit mx-auto mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Impact</h3>
              <p className="text-gray-600">
                Track your environmental impact and contribute to global sustainability goals
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Privacy</h3>
              <p className="text-gray-600">
                Your data is secure and private. We prioritize user privacy and data protection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg w-fit mx-auto mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Recognition</h3>
              <p className="text-gray-600">
                Earn badges and recognition for your environmental contributions and achievements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
              <p className="text-green-100 text-lg">Making a difference, one analysis at a time</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-green-100">Items Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">5K+</div>
                <div className="text-green-100">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-green-100">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-green-100">Accuracy Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Meet the Team</CardTitle>
            <p className="text-gray-600">Passionate individuals working for a sustainable future</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Engineers</h3>
                <p className="text-gray-600 text-sm">Developing cutting-edge machine learning models for waste identification</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Environmental Scientists</h3>
                <p className="text-gray-600 text-sm">Ensuring accurate environmental impact assessments and recommendations</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Managers</h3>
                <p className="text-gray-600 text-sm">Building and nurturing our global community of eco-conscious users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-green-100 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already making a positive impact on the environment. 
              Start your sustainability journey today.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}