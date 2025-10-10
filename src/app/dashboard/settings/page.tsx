"use client";

import PageTemplate from "@/components/page-template";
import ProfileSection from "@/components/settings/profile-section";
import PlanSection from "@/components/settings/plan-section";
import LogoutSection from "@/components/settings/logout-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import { useCodeAuth } from "@/lib/auth-utils";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { user } = useCodeAuth();
  const [analysesCount, setAnalysesCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadAnalysesCount();
    }
  }, [user]);

  const loadAnalysesCount = async () => {
    try {
      const response = await fetch(`/api/user/${user?.id}/analyses`);
      if (response.ok) {
        const analyses = await response.json();
        setAnalysesCount(analyses.length);
      }
    } catch (error) {
      console.error("Failed to load analyses count:", error);
    }
  };

  if (!user) return null;

  return (
    <PageTemplate 
      title="Settings" 
      description="Manage your account preferences and settings"
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <ProfileSection user={user} />
          </TabsContent>
          
          <TabsContent value="plan" className="mt-6">
            <PlanSection user={user} analysesCount={analysesCount} />
          </TabsContent>
          
          <TabsContent value="account" className="mt-6">
            <LogoutSection />
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}