"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const [source, setSource] = useState("");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          goals,
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
              Let's get to know you a bit better to personalize your experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="source">How did you hear about Ecoverse?</Label>
              <Input
                id="source"
                value={source}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSource(e.target.value)}
                placeholder="Social media, friend, search engine, etc."
                className="bg-gray-900/50 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goals">What are your sustainability goals?</Label>
              <Textarea
                id="goals"
                value={goals}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGoals(e.target.value)}
                placeholder="I want to reduce my plastic waste, learn about composting, etc."
                className="bg-gray-900/50 border-gray-700 min-h-[120px]"
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