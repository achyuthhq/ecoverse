"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ClassicLoader from "@/components/ui/classic-loader";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (session) {
      // User is already logged in, redirect to dashboard
      router.push("/dashboard");
    } else {
      // No session, redirect to login
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Show loading while checking session
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0c0c' }}>
      <ClassicLoader size="lg" />
    </div>
  );
} 