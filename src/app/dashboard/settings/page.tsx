"use client";

import PageTemplate from "@/components/page-template";
import ProfileSection from "@/components/settings/profile-section";
import PlanSection from "@/components/settings/plan-section";
import LogoutSection from "@/components/settings/logout-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [analysesCount, setAnalysesCount] = useState(0);
  const user = session?.user;

  useEffect(() => {
    if (user?.id) {
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
      <div className="glass-card rounded-xl shadow-lg overflow-hidden border border-white/10 backdrop-blur-xl p-6 bg-[#0c0c0c]">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#191919] border border-white/10 p-1 rounded-lg">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#0c0c0c] data-[state=active]:text-white text-gray-400">Profile</TabsTrigger>
            <TabsTrigger value="plan" className="data-[state=active]:bg-[#0c0c0c] data-[state=active]:text-white text-gray-400">Plan</TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-[#0c0c0c] data-[state=active]:text-white text-gray-400">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <ProfileSection user={{ ...user, email: user.email || null }} />
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