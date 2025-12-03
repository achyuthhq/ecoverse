"use client";

import { Suspense } from "react";
import { Loader2, MapPin } from "lucide-react";
import EventsContent from "@/components/events-content";
import DashboardShell from "@/components/dashboard-shell";
import { useSession } from "next-auth/react";
import ClassicLoader from "@/components/ui/classic-loader";

export default function EventsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0c0c' }}>
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 sm:pt-8 md:pt-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Recycling Near You
            </h2>
          </div>
          <p className="text-gray-300 max-w-md mx-auto text-sm sm:text-base px-4">
            Find recycling centers, collection points, and eco-friendly events in your area.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-[600px] glass-card rounded-xl">
              <div className="text-center">
                <ClassicLoader size="lg" />
                <h3 className="text-lg font-medium text-white mt-4">Loading Map</h3>
              </div>
            </div>
          }
        >
          <EventsContent />
        </Suspense>
      </div>
    </DashboardShell>
  );
}