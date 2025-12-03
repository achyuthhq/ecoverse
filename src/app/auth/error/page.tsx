"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button2";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  // Map error codes to user-friendly messages
  const getErrorMessage = () => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration. Please contact support.";
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in.";
      case "Verification":
        return "The verification link may have expired or already been used.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        return "There was a problem with the authentication service. Please try again.";
      case "OAuthAccountNotLinked":
        return "To confirm your identity, sign in with the same account you used originally.";
      case "EmailSignin":
        return "The email could not be sent. Please try again later.";
      case "CredentialsSignin":
        return "The sign in details you provided were invalid. Please check your credentials and try again.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "An unknown error occurred. Please try again later.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-red-500 opacity-10 blur-3xl"></div>
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
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Authentication Error</h1>
            <p className="text-gray-600 mb-6">
              {getErrorMessage()}
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-700">
                  <strong>Error code:</strong> {error || "Unknown"}
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Link href="/auth/login">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white"
                  >
                    Try signing in again
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 