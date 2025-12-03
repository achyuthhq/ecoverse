"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { Unbounded } from "next/font/google";

import { Button } from "@/components/ui/button2";
import { Input } from "@/components/ui/input2";
import { Label } from "@/components/ui/label2";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";

const unbounded = Unbounded({ subsets: ['latin'] });

// Define validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    // Clear error when user types
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = (): boolean => {
    try {
      forgotPasswordSchema.parse({ email });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // For now, we'll just simulate a successful submission
      // In a real app, you would call an API endpoint to send a reset email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "If an account exists with that email, you will receive a password reset link",
        variant: "default",
      });
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Request failed",
        description: "There was a problem sending the reset link. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-500 opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
        </div>
        
        <div className="z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card-light rounded-2xl border border-white/30 shadow-lg p-8"
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold mb-2 text-gray-800">Check your email</h1>
              <p className="text-gray-600 mb-6">
                If an account exists with the email {email}, we've sent a password reset link.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-700">
                    <strong>Tip:</strong> If you don't see the email in your inbox, check your spam folder.
                  </p>
                </div>
                
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-500 opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
      </div>
      
      <div className="z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card-light rounded-2xl border border-white/30 shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <Link href="/">
              <div className="inline-flex items-center gap-1.5 mb-2">
                  <div className="bg-white p-0.5 rounded-full flex items-center justify-center w-6 h-6">
                    <Image 
                      src="/images/ecoverse.png" 
                      alt="Ecoverse Logo" 
                      width={24} 
                      height={24}
                      className="object-contain mb-3"
                    />
                </div>
                <span className={`${unbounded.className} text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-emerald-400 to-green-400 tracking-wide mb-3`}>
                  Ecoverse
                </span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold mb-1 text-gray-800">Reset Password</h1>
            <p className="text-sm text-gray-600">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="yourname@example.com"
                value={email}
                onChange={handleChange}
                className={`bg-white/50 border-gray-200 ${
                  errors.email ? "border-red-500" : ""
                }`}
                required
              />
              {errors.email && (
                <div className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="mt-4 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-green-600 hover:underline flex items-center justify-center"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 