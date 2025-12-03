"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button2";
import { Input } from "@/components/ui/input2";
import { Label } from "@/components/ui/label2";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Check, Globe2 } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const [source, setSource] = useState("");
  const [goals, setGoals] = useState("");
  const [userType, setUserType] = useState<"individual" | "industry" | "">("");
  const [city, setCity] = useState("");
  const [detectingCity, setDetectingCity] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!userType) {
        toast({
          title: "Choose your role",
          description: "Please select whether you're an individual or an industry.",
          variant: "destructive",
        });
        return;
      }

      if (!city.trim()) {
        toast({
          title: "City required",
          description: "Please select or enter your city to personalize your impact metrics.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          goals,
          userType,
          city: city.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save onboarding information');
      }
      
      // Update session with new user data
      await update();
      
      toast({
        title: "Welcome to Ecoverse!",
        description: "Your profile has been updated successfully.",
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDetectCity = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location detection. Please select your city manually.",
        variant: "destructive",
      });
      return;
    }

    try {
      setDetectingCity(true);
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // Use OpenStreetMap Nominatim API for reverse geocoding
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                {
                  headers: {
                    "Accept": "application/json",
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
                toast({
                  title: "City detected",
                  description: `We detected your city as ${detectedCity}. You can adjust it if needed.`,
                });
              } else {
                toast({
                  title: "Could not detect city",
                  description: "Please select your city manually from the list.",
                  variant: "destructive",
                });
              }
              resolve();
            } catch (error) {
              console.error("Reverse geocoding error:", error);
              toast({
                title: "Error detecting city",
                description: "Please select your city manually.",
                variant: "destructive",
              });
              reject(error);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast({
              title: "Location permission denied",
              description: "We couldn't access your location. Please select your city manually.",
              variant: "destructive",
            });
            reject(error);
          }
        );
      });
    } finally {
      setDetectingCity(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-slate-900 p-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-500 opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
      </div>
      
      <div className="z-10 w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-dark rounded-2xl border border-gray-800 shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 p-1 rounded-full">
                <div className="bg-black p-1 rounded-full">
                  <span className="text-base">♻️</span>
                </div>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Ecoverse
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Welcome, {session?.user?.name || "Eco-Warrior"}!</h1>
            <p className="text-sm text-gray-400">
              Let&apos;s personalize your impact and connect you with others in your city.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: User Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">How are you using Ecoverse?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("individual")}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition-all ${
                    userType === "individual"
                      ? "border-green-400 bg-green-500/10 text-white shadow-lg shadow-green-500/30"
                      : "border-gray-700 bg-black/40 text-gray-300 hover:border-green-500/60 hover:bg-green-500/5"
                  }`}
                >
                  <p className="font-semibold mb-1">Individual</p>
                  <p className="text-xs text-gray-400">
                    For personal use – students, families, eco-conscious citizens.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("industry")}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition-all ${
                    userType === "industry"
                      ? "border-blue-400 bg-blue-500/10 text-white shadow-lg shadow-blue-500/30"
                      : "border-gray-700 bg-black/40 text-gray-300 hover:border-blue-500/60 hover:bg-blue-500/5"
                  }`}
                >
                  <p className="font-semibold mb-1">Industry / Organization</p>
                  <p className="text-xs text-gray-400">
                    For hostels, campuses, offices, shops, or housing communities.
                  </p>
                </button>
              </div>
            </div>

            {/* Step 2: City Selection with 3D Globe Feel */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">Where are you based?</Label>
              <p className="text-xs text-gray-500">
                We use this to combine your impact with others in your city, so you all see shared progress.
              </p>

              {/* 3D Globe style selector */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDetectCity}
                  disabled={detectingCity}
                  className="relative flex-1 overflow-hidden rounded-2xl border border-gray-700 bg-gradient-to-br from-blue-900 via-black to-emerald-900 p-4 shadow-lg hover:border-blue-400/70 hover:shadow-blue-500/40 transition-all"
                >
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.6),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.6),transparent_55%)]" />
                  <div className="absolute inset-8 rounded-full border border-white/10 backdrop-blur-md" />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 shadow-inner shadow-black/60 flex items-center justify-center">
                      <Globe2 className="h-7 w-7 text-white drop-shadow-lg" />
                      <div className="absolute inset-0 rounded-full bg-black/10 mix-blend-soft-light" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-0.5">
                        {detectingCity ? "Detecting your city..." : "Tap the globe to auto-detect your city"}
                      </p>
                      <p className="text-xs text-gray-300">
                        We&apos;ll use your approximate location to guess your city. You can still edit it below.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Manual city input / dropdown */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs text-gray-400">
                  Confirm or select your city
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                  placeholder="e.g., Jaipur, Mumbai, Bangalore"
                  className="bg-gray-900/50 border-gray-700"
                />
              </div>
            </div>

            {/* Optional: Source & Goals - kept as advanced personalization */}
            <div className="space-y-2">
              <Label htmlFor="source" className="text-sm text-gray-200">
                How did you hear about Ecoverse? <span className="text-xs text-gray-500">(optional)</span>
              </Label>
              <Input
                id="source"
                value={source}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSource(e.target.value)}
                placeholder="Social media, friend, event, etc."
                className="bg-gray-900/50 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goals" className="text-sm text-gray-200">
                What are your sustainability goals? <span className="text-xs text-gray-500">(optional)</span>
              </Label>
              <Textarea
                id="goals"
                value={goals}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGoals(e.target.value)}
                placeholder="I want to reduce my plastic waste, set up recycling in my hostel, etc."
                className="bg-gray-900/50 border-gray-700 min-h-[100px]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Saving..." : (
                <>
                  <Check className="h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
            
            <div className="text-center text-xs text-gray-500">
              You can always update this information later in your profile settings.
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 