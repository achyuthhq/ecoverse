import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

import DashboardShell from "@/components/dashboard-shell";
import ImageUpload from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import AnalysisHistory from "@/components/analysis-history";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch the user's recent analyses
  const recentAnalyses = await prisma.analysis.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Upload an image to analyze waste items.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="relative p-6 glass-card rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-xl -z-10"></div>
            <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
            <ImageUpload />
          </div>

          {/* Stats Section */}
          <div className="p-6 glass-card rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-xl -z-10"></div>
            <h2 className="text-xl font-semibold mb-4">Your Impact</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  title: "Analyses",
                  value: recentAnalyses.length,
                  description: "Total items analyzed",
                },
                {
                  title: "Recycled",
                  value: recentAnalyses.filter(a => 
                    a.category?.toLowerCase().includes("recycl")).length,
                  description: "Items properly recycled",
                },
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-background/40 rounded-xl">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="p-6 glass-card rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
          {recentAnalyses.length > 0 ? (
            <AnalysisHistory analyses={recentAnalyses} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No analyses yet. Upload your first image!</p>
            </div>
          )}
        </div>
        
        {/* Tips Section */}
        <div className="p-6 glass-card rounded-2xl bg-gradient-to-r from-green-500/5 to-blue-500/5">
          <h2 className="text-xl font-semibold mb-4">Eco Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                tip: "Reduce single-use plastics by using reusable water bottles and bags.",
                icon: "🌱"
              },
              {
                tip: "Compost food waste to reduce methane emissions from landfills.",
                icon: "♻️"
              },
              {
                tip: "Properly recycle electronic waste to recover valuable materials.",
                icon: "📱"
              }
            ].map((tip, i) => (
              <div key={i} className="p-4 bg-background/40 rounded-xl">
                <div className="text-2xl mb-2">{tip.icon}</div>
                <p className="text-sm">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 