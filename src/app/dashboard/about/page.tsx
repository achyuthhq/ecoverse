"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf, Heart, Users, Globe, Zap, Shield, Award, Star, AlertCircle, Lightbulb, MessageSquare } from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button2";
import { useSession } from "next-auth/react";
import ClassicLoader from "@/components/ui/classic-loader";

export default function AboutPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0c0c' }}>
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8 pt-6 sm:pt-8 md:pt-4">
        {/* Hero Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Leaf className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
              About Ecoverse
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg px-4">
            Empowering individuals to make sustainable choices through AI-powered waste analysis and environmental education
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg w-fit mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-300">
                Advanced machine learning algorithms identify waste items and provide detailed environmental impact assessments
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg w-fit mx-auto mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Eco-Friendly Solutions</h3>
              <p className="text-gray-300">
                Learn about sustainable alternatives, proper disposal methods, and eco-friendly practices
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community Driven</h3>
              <p className="text-gray-300">
                Join a global community of environmentally conscious individuals working together for change
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg w-fit mx-auto mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Global Impact</h3>
              <p className="text-gray-300">
                Track your environmental impact and contribute to global sustainability goals
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Data Privacy</h3>
              <p className="text-gray-300">
                Your data is secure and private. We prioritize user privacy and data protection
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg w-fit mx-auto mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Recognition</h3>
              <p className="text-gray-300">
                Earn badges and recognition for your environmental contributions and achievements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* New Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg w-fit mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">The Problem We Lived</h3>
              <p className="text-gray-300">
                Every day, millions of waste items are improperly disposed of, causing environmental damage and contributing to climate change. Many people want to make a difference but lack the knowledge and tools to identify and properly handle different types of waste.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg w-fit mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">What Ecoverse Actually Does</h3>
              <p className="text-gray-300">
                Ecoverse uses advanced AI technology to instantly identify waste items from photos, providing detailed environmental impact analysis, proper disposal instructions, and eco-friendly alternatives. We empower users with knowledge and actionable insights to make sustainable choices.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg w-fit mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Ready to Tell Your Story?</h3>
              <p className="text-gray-300">
                Join our community and share your sustainability journey. Every analysis you perform, every eco-friendly choice you make, and every story you share contributes to a larger movement towards environmental consciousness and positive change.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <Card className="glass-card rounded-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-white">Meet the Team</CardTitle>
            <p className="text-gray-300">Passionate individuals working for a sustainable future</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Engineers</h3>
                <p className="text-gray-300 text-sm">Developing cutting-edge machine learning models for waste identification</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Environmental Scientists</h3>
                <p className="text-gray-300 text-sm">Ensuring accurate environmental impact assessments and recommendations</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Community Managers</h3>
                <p className="text-gray-300 text-sm">Building and nurturing our global community of eco-conscious users</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardShell>
  );
}