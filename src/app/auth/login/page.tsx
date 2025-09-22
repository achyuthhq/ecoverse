"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { Unbounded } from "next/font/google";
import { Browser } from '@capacitor/browser';

// Add type declaration for Capacitor
declare global {
  interface Window {
    Capacitor?: {
      isNative: boolean;
      platform?: string;
    };
  }
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Loader2, Eye, EyeOff, Mail } from "lucide-react";

const unbounded = Unbounded({ subsets: ['latin'] });

// Define validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { status } = useSession();
  const hasShownSuccessMessage = useRef(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);
  
  // Check if we're coming from signup page with success message
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "account-created" && !hasShownSuccessMessage.current) {
      hasShownSuccessMessage.current = true;
      toast({
        title: "Account created successfully!",
        description: "Please log in with your credentials to access your dashboard.",
        variant: "default",
      });
    }
  }, [searchParams, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      console.log("Attempting credentials login with:", formData.email);
      
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      console.log("SignIn result:", result);
      
      if (result?.error) {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please check your credentials and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Successful login - redirect to dashboard
      router.push("/dashboard");
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "There was a problem logging in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      console.log("Starting Google sign-in with NextAuth...");
      
      // Check if running in Capacitor (mobile app)
      if (window.Capacitor?.isNative) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ecoverse-ivory.vercel.app';
        const callbackUrl = `${appUrl}/dashboard`;
        const authUrl = `${appUrl}/api/auth/signin/google`;
        
        // Use Capacitor Browser for mobile
        await Browser.open({ 
          url: `${authUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          windowName: '_self',
          presentationStyle: 'popover'
        });
        
        // Listen for the URL change event
        Browser.addListener('browserFinished', () => {
          // Check if we're on the success page
          if (window.location.pathname === '/dashboard') {
            // Redirect to dashboard after successful login
            router.push('/dashboard');
          }
        });

        // Add a listener for custom URL scheme (if using one)
        if (window.Capacitor.platform === 'android' || window.Capacitor.platform === 'ios') {
          window.addEventListener('appUrlOpen', (event: any) => {
            // Handle deep link
            const slug = event.url.split('ecoverse://').pop();
            if (slug === 'dashboard') {
              router.push('/dashboard');
            }
          });
        }
      } else {
        // Web browser flow
        const result = await signIn('google', { 
          callbackUrl: '/dashboard',
          redirect: false
        });
        
        if (result?.error) {
          toast({
            title: "Google login failed",
            description: "There was a problem signing in with Google. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Successful login - redirect to dashboard
        router.push("/dashboard");
      }
      
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "There was a problem signing in with Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-500" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Modern gradient background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-white/10 to-white/30 backdrop-blur-[120px]"></div>
      </div>
      
      <div className="z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card-light rounded-3xl border border-white/30 shadow-2xl backdrop-blur-xl p-8 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 blur-2xl"></div>

          <div className="text-center mb-8 relative">
            <Link href="/">
              <div className="inline-flex items-center gap-1.5 mb-6 hover:scale-105 transition-transform">
                <div className="p-0.5 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg">
                    <Image 
                      src="/images/ecoverse.png" 
                      alt="Ecoverse Logo" 
                      width={24} 
                      height={24}
                      className="object-contain"
                    />
                </div>
                <span className={`${unbounded.className} text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-emerald-400 to-green-400 tracking-wide`}>
                  Ecoverse
                </span>
              </div>
            </Link>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Welcome Back</h1>
            <p className="text-sm text-gray-600">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="yourname@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`bg-white/50 border-gray-200 rounded-xl pl-10 ${
                    errors.email ? "border-red-500 focus:ring-red-200" : "focus:ring-green-200"
                  }`}
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && (
                <div className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-xs text-green-600 hover:text-green-700 hover:underline font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`bg-white/50 border-gray-200 rounded-xl ${
                    errors.password ? "border-red-500 focus:ring-red-200" : "focus:ring-green-200"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-400 hover:from-green-600 hover:to-green-500 text-white rounded-xl h-11 font-medium shadow-lg shadow-green-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-green-600 hover:text-green-700 hover:underline font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 