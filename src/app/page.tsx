"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ClassicLoader from "@/components/ui/classic-loader";
import LandingPage from "./landing/page";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#020710" }}
      >
        <ClassicLoader size="lg" />
      </div>
    );
  }

  // If not logged in, show marketing landing page
  if (!session) {
    return <LandingPage />;
  }

  // Fallback while redirecting logged-in users
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#020710" }}
    >
      <ClassicLoader size="lg" />
    </div>
  );
} 