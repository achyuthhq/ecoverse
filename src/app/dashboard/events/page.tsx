import { Suspense } from "react";
import { Loader2, MapPin } from "lucide-react";
import EventsContent from "@/components/events-content";
import DashboardShell from "@/components/dashboard-shell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardShell>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
              Recycling Near You
            </h2>
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Find recycling centers, collection points, and eco-friendly events in your area.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-xl">
              <div className="text-center">
                <Loader2 className="h-10 w-10 text-green-500 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Loading Map</h3>
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