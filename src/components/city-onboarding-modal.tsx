"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Globe2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button2";
import { Input } from "@/components/ui/input2";
import { useToast } from "@/components/ui/use-toast";

// Dynamically import the heavy 3D globe on client only
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface OnboardingUser {
  id: string;
  name: string | null;
  email: string | null;
  userType: "individual" | "industry" | null;
  city: string | null;
}

export default function CityOnboardingModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState<"individual" | "industry" | "">("");
  const [city, setCity] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const { toast } = useToast();
  const globeRef = useRef<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/user/onboarding");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        const user: OnboardingUser = {
          id: data.user.id,
          name: data.user.name ?? null,
          email: data.user.email ?? null,
          userType: data.user.userType ?? null,
          city: data.user.city ?? null,
        };

        if (user.userType && user.city) {
          // Already onboarded, no popup
          setOpen(false);
        } else {
          if (user.userType) setUserType(user.userType);
          if (user.city) setCity(user.city);
          setOpen(true);
        }
      } catch (error) {
        console.error("[CITY_ONBOARDING] Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!userType) {
      toast({
        title: "Choose your role",
        description: "Please select whether you're an individual or an industry user.",
        variant: "destructive",
      });
      return;
    }

    if (!city.trim()) {
      toast({
        title: "City required",
        description: "Please enter your city so we can group your impact correctly.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "",
          goals: "",
          userType,
          city: city.trim(),
        }),
      });

      if (!res.ok) {
        toast({
          title: "Save failed",
          description: "Could not save your city and role. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile updated",
        description: "Your city and role are now linked to your impact analytics.",
      });

      setOpen(false);
      // Ensure dashboards/analytics refresh with city-based data
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      console.error("[CITY_ONBOARDING] Failed to save:", error);
      toast({
        title: "Unexpected error",
        description: "Something went wrong while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
        setCity(detectedCity);
        setSelectedPoint({ lat, lng, name: detectedCity });

        // Smoothly rotate globe towards selected point if available
        if (globeRef.current && typeof globeRef.current.pointOfView === "function") {
          globeRef.current.pointOfView({ lat, lng, altitude: 1.8 }, 1000);
        }

        toast({
          title: "City selected",
          description: `We detected ${detectedCity} from the globe. You can adjust it below if needed.`,
        });
      } else {
        toast({
          title: "Could not detect city",
          description: "Try clicking closer to a major city, or enter it manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[CITY_ONBOARDING] Reverse geocoding error:", error);
      toast({
        title: "Error detecting city",
        description: "Please type your city manually.",
        variant: "destructive",
      });
    }
  };

  if (loading) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md glass-card border border-white/10 bg-[#0c0c0c] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-white/5">
          <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#191919] border border-white/10">
              <Globe2 className="h-4 w-4 text-white" />
            </span>
            Welcome to Ecoverse
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400 mt-1">
            We use your city to combine your efforts with others nearby and show a shared waste score.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 bg-[#0c0c0c]">
          {/* User type selection */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-300">
              How are you using Ecoverse?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUserType("individual")}
                className={`rounded-lg border text-left text-xs px-3 py-2.5 transition-colors ${
                  userType === "individual"
                    ? "border-emerald-400 bg-[#191919]"
                    : "border-white/10 bg-[#111111] hover:bg-[#181818]"
                }`}
              >
                <p className="font-semibold text-white mb-1">Individual</p>
                <p className="text-[11px] text-gray-400">
                  Students, families, or anyone tracking personal waste.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setUserType("industry")}
                className={`rounded-lg border text-left text-xs px-3 py-2.5 transition-colors ${
                  userType === "industry"
                    ? "border-blue-400 bg-[#191919]"
                    : "border-white/10 bg-[#111111] hover:bg-[#181818]"
                }`}
              >
                <p className="font-semibold text-white mb-1">Industry / Org</p>
                <p className="text-[11px] text-gray-400">
                  Hostels, campuses, offices, shops, or communities.
                </p>
              </button>
            </div>
          </div>

          {/* City selection with 3D globe + manual fallback */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-300">
              Pick your city on the globe
            </p>
            <div className="rounded-xl border border-white/10 bg-[#111111] relative overflow-hidden">
              <div className="h-56 w-full">
                {/* 3D Globe */}
                <Globe
                  ref={globeRef}
                  width={400}
                  height={220}
                  backgroundColor="rgba(0,0,0,0)"
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                  bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                  showAtmosphere={true}
                  atmosphereColor="deepskyblue"
                  atmosphereAltitude={0.25}
                  pointsData={selectedPoint ? [selectedPoint] : []}
                  pointLat={(d: any) => d.lat}
                  pointLng={(d: any) => d.lng}
                  pointRadius={() => 0.28}
                  pointColor={() => "rgba(56, 189, 248, 0.98)"}
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

            {/* Manual city input */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-300">
                Or type your city
              </p>
              <Input
                id="city"
                value={city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCity(e.target.value)
                }
                placeholder="e.g., Jaipur"
                className="bg-[#111111] border-white/10 text-sm"
              />
              <p className="text-[11px] text-gray-500">
                Users in the same city will see a combined “city waste score” in their analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-white/5 flex items-center justify-between bg-[#0c0c0c]">
          <p className="text-[11px] text-gray-500 max-w-[60%]">
            You can change this later in settings. We never share your exact address.
          </p>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-sm px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-lg"
          >
            {saving ? "Saving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


