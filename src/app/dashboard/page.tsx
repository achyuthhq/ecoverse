"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Award, Sparkles, Globe2, Camera } from "lucide-react";

import DashboardShell, { useUploadModal } from "@/components/dashboard-shell";
import ImageUpload from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import AnalysisHistory from "@/components/analysis-history";
import { getRandomGreeting, calculateEcoAwarenessScore } from "@/lib/utils";
import EcoTipsSection from "@/components/eco-tips-section";
import ImpactMetricsDashboard from "@/components/impact-metrics-dashboard";
import CityOnboardingModal from "@/components/city-onboarding-modal";
import { useSession } from "next-auth/react";
import ClassicLoader from "@/components/ui/classic-loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input2";
import { useToast } from "@/components/ui/use-toast";

// Heavy 3D globe, client-only
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface Analysis {
  id: string;
  userId: string;
  imageUrl: string;
  label: string;
  category: string | null;
  type: string | null;
  degradability: string | null;
  environmentalImpact: string | null;
  harms: string | null;
  disposal: string | null;
  potentialForReuse: string | null;
  alternatives: string | null;
  recommendations: string | null;
  extraNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cityMetrics, setCityMetrics] = useState<{ city: string | null; totalAnalyses: number } | null>(null);
  const [userType, setUserType] = useState<"individual" | "industry" | "">("");
  const [cityInput, setCityInput] = useState("");
  const [cityDialogOpen, setCityDialogOpen] = useState(false);
  const [savingCity, setSavingCity] = useState(false);
  const { toast } = useToast();
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const { openUploadModal } = useUploadModal();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    if (session.user.id) {
      loadUserData(session.user.id);
      loadCityMetrics();
      loadOnboardingProfile();
    }
  }, [session, status, router]);

  const loadUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/${userId}/analyses`);
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCityMetrics = async () => {
    try {
      const res = await fetch("/api/user/city-metrics");
      if (!res.ok) return;
      const data = await res.json();
      setCityMetrics({
        city: data.city,
        totalAnalyses: data.totalAnalyses,
      });
    } catch (error) {
      console.error("Failed to load city metrics:", error);
    }
  };

  const loadOnboardingProfile = async () => {
    try {
      const res = await fetch("/api/user/onboarding");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.user) {
        if (data.user.userType) setUserType(data.user.userType);
        if (data.user.city) setCityInput(data.user.city);
      }
    } catch (error) {
      console.error("Failed to load onboarding profile:", error);
    }
  };

  const handlePickCityFromCoords = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const data = await res.json();
      const detectedCity =
        data?.address?.city ||
        data?.address?.town ||
        data?.address?.village ||
        data?.address?.state_district ||
        "";

      if (detectedCity) {
        setCityInput(detectedCity);
        setSelectedPoint({ lat, lng, name: detectedCity });

        toast({
          title: "City selected",
          description: `We detected ${detectedCity} from the globe. You can adjust it if needed.`,
        });
      } else {
        toast({
          title: "Could not detect city",
          description: "Try clicking closer to a major city, or enter it manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[CITY_GLOBE] Reverse geocoding error:", error);
      toast({
        title: "Error detecting city",
        description: "Please type your city manually.",
        variant: "destructive",
      });
    }
  };

  const handleSaveCity = async () => {
    if (!cityInput.trim()) {
      toast({
        title: "City required",
        description: "Please enter your city so we can group your impact correctly.",
        variant: "destructive",
      });
      return;
    }

    const finalUserType = userType || "individual";

    try {
      setSavingCity(true);
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "",
          goals: "",
          userType: finalUserType,
          city: cityInput.trim(),
        }),
      });

      if (!res.ok) {
        toast({
          title: "Save failed",
          description: "Could not update your city. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "City updated",
        description: "Your city has been updated and analytics will now reflect it.",
      });

      setCityDialogOpen(false);
      if (session?.user?.id) {
        await loadCityMetrics();
        await loadUserData(session.user.id);
      }
    } catch (error) {
      console.error("[CITY_GLOBE] Failed to save city:", error);
      toast({
        title: "Unexpected error",
        description: "Something went wrong while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingCity(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0c0c' }}>
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const ecoAwarenessScore = calculateEcoAwarenessScore(analyses);
  const recentAnalyses = analyses.slice(0, 3);
  const firstName = session.user.name?.split(' ')[0] || 'User';
  const greeting = getRandomGreeting(firstName);

  return (
    <>
      {/* City onboarding popup */}
      <CityOnboardingModal />

      <div className="flex flex-col gap-6 pt-6 sm:pt-8 md:pt-4">
        {/* Header - Modern Design */}
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">
            {greeting}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm">
            Upload an image to analyze waste items and get eco-friendly recommendations.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Section - Enhanced with modern glass UI */}
          <div className="glass-card p-4 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">
              Your Impact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
              {[
                {
                  title: "Analyses",
                  value: analyses.length,
                  description: "Total items analyzed",
                  color: "from-emerald-400 to-emerald-600",
                  icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
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
                  icon: <Zap className="h-4 w-4 text-blue-500" />,
                  bgGradient: "from-blue-50 to-blue-100/50",
                  borderColor: "border-blue-200/50",
                  sparkleColor: "text-blue-400",
                  starColor: "text-blue-500"
                },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="relative overflow-hidden p-4 rounded-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-xl glass-card"
                >
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg glass-card">
                        {stat.icon}
                      </div>
                      <p className="text-xs font-semibold text-white">{stat.title}</p>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <p className={`text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>
                        {stat.value}
                      </p>
                      {stat.title === "Eco Awareness" && <p className="text-gray-400 text-sm font-medium">pts</p>}
                      {stat.title === "Analyses" && <p className="text-gray-400 text-sm font-medium">{stat.value === 1 ? 'item' : 'items'}</p>}
                    </div>
                    <p className="text-xs text-gray-400">{stat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Upload Section - Enhanced with modern glass UI */}
          <div className="glass-card p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600">
                <Award className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                Quick Upload
              </h2>
            </div>
            <p className="text-gray-300 text-xs mb-4">Take a photo or upload an image of waste items for instant analysis.</p>
            <div className="mb-4 flex justify-start">
              <Button
                type="button"
                onClick={openUploadModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-gray-900 hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300 text-xs font-semibold px-3 py-2 border-0"
              >
                <Camera className="h-4 w-4" />
                <span>Scan Now</span>
              </Button>
            </div>
            <ImageUpload hideBrowseButton />
          </div>
        </div>

        {/* Impact Metrics Dashboard */}
        <ImpactMetricsDashboard 
          analyses={analyses} 
          city={cityMetrics?.city || undefined}
          cityTotalAnalyses={cityMetrics?.totalAnalyses}
        />

        {/* Recent Analyses + City Globe Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Analyses */}
          <div className="glass-card p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                Recent Analyses
              </h2>
            </div>
            {recentAnalyses.length > 0 ? (
              <AnalysisHistory analyses={recentAnalyses} />
            ) : (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="h-6 w-6 text-gray-400" />
                  <p className="text-gray-300 font-medium">No analyses yet</p>
                  <Sparkles className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm">Upload your first image to get started!</p>
              </div>
            )}
          </div>

          {/* City Globe & Selection */}
          <div className="glass-card p-4 rounded-xl shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#191919] border border-white/10">
                  <Globe2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Your City Globe
                  </h2>
                  <p className="text-xs text-gray-400">
                    Visualize and adjust the city that powers your shared waste score.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs border-white/20 text-white bg-white/5 hover:bg-white/10"
                onClick={() => {
                  setCityInput(cityMetrics?.city || cityInput || "");
                  setCityDialogOpen(true);
                }}
              >
                Change city
              </Button>
            </div>

            <div className="relative rounded-xl border border-white/10 bg-[#111111] overflow-hidden h-64 md:h-80 flex items-center justify-center">
              <div className="w-full max-w-xl">
              <Globe
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                showAtmosphere={true}
                atmosphereColor="deepskyblue"
                atmosphereAltitude={0.25}
                  width={520}
                  height={320}
                pointsData={selectedPoint ? [selectedPoint] : []}
                pointLat={(d: any) => d.lat}
                pointLng={(d: any) => d.lng}
                pointRadius={() => 0.25}
                pointColor={() => "rgba(56, 189, 248, 0.95)"}
                onGlobeClick={(point: any) => {
                  if (!point || typeof point.lat !== "number" || typeof point.lng !== "number") return;
                  handlePickCityFromCoords(point.lat, point.lng);
                }}
              />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0c0c0c] to-transparent pt-6 pb-3 px-4 pointer-events-none">
                <p className="text-[11px] text-gray-300">
                  Tap anywhere on the globe to detect the nearest city. We use real map data; no mock locations.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Selected city</span>
                <span className="text-sm font-semibold text-white">
                  {cityMetrics?.city || cityInput || "Not set yet"}
                </span>
              </div>
              {cityMetrics?.totalAnalyses !== undefined && cityMetrics?.city && (
                <div className="text-right">
                  <span className="text-[11px] text-gray-400">
                    City waste score
                  </span>
                  <p className="text-sm font-semibold text-emerald-400">
                    {cityMetrics.totalAnalyses} items analyzed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tips Section */}
        <EcoTipsSection />
      </div>

      {/* Change City Dialog */}
      <Dialog open={cityDialogOpen} onOpenChange={setCityDialogOpen}>
        <DialogContent className="sm:max-w-md glass-card border border-white/10 bg-[#0c0c0c] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-white/5">
            <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#191919] border border-white/10">
                <Globe2 className="h-4 w-4 text-white" />
              </span>
              Adjust your city
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Pick a new city on the globe or type it below. This will change how your shared city waste score is calculated.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-3 bg-[#0c0c0c]">
            <div className="rounded-xl border border-white/10 bg-[#111111] relative overflow-hidden">
              <div className="h-56 w-full">
                <Globe
                  backgroundColor="rgba(0,0,0,0)"
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                  bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                  showAtmosphere={true}
                  atmosphereColor="deepskyblue"
                  atmosphereAltitude={0.25}
                  width={400}
                  height={220}
                  pointsData={selectedPoint ? [selectedPoint] : []}
                  pointLat={(d: any) => d.lat}
                  pointLng={(d: any) => d.lng}
                  pointRadius={() => 0.25}
                  pointColor={() => "rgba(56, 189, 248, 0.95)"}
                  onGlobeClick={(point: any) => {
                    if (!point || typeof point.lat !== "number" || typeof point.lng !== "number") return;
                    handlePickCityFromCoords(point.lat, point.lng);
                  }}
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0c0c0c] to-transparent pt-6 pb-3 px-4 pointer-events-none">
                <p className="text-[11px] text-gray-300">
                  Tap to detect a city using real-world coordinates. You can still edit the name below.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-300">City</p>
              <Input
                id="city-change"
                value={cityInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCityInput(e.target.value)
                }
                placeholder="e.g., Jaipur"
                className="bg-[#111111] border-white/10 text-sm"
              />
            </div>
          </div>

          <div className="px-6 pb-5 pt-3 border-t border-white/5 flex items-center justify-between bg-[#0c0c0c]">
            <p className="text-[11px] text-gray-500 max-w-[60%]">
              Changing your city updates how we group your analytics with others.
            </p>
            <Button
              type="button"
              onClick={handleSaveCity}
              disabled={savingCity}
              className="text-sm px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-lg"
            >
              {savingCity ? "Saving..." : "Save city"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardContent />
    </DashboardShell>
  );
} 