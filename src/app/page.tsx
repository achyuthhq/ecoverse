"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ClassicLoader from "@/components/ui/classic-loader";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for existing user session
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      // User is already logged in, redirect to dashboard
      router.push("/dashboard");
    } else {
      // No session, redirect to code login
      router.push("/auth/code-login");
    }
  }, [router]);

  // Show loading while checking session
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
      <ClassicLoader size="lg" />
    </div>
  );
} 