"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
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
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Check your email</h1>
            <p className="text-gray-600 mb-6">
              We've sent a magic link to your email address. 
              Click the link to sign in to your account.
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