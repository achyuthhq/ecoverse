import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, Recycle, Leaf, Info } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, parseJsonArray } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard-shell";
import { motion } from "framer-motion";

export default async function AnalysisPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const analysis = await prisma.analysis.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!analysis) {
    notFound();
  }

  // Check if the analysis belongs to the current user
  if (analysis.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // Parse JSON strings to arrays
  const harms = parseJsonArray(analysis.harms);
  const disposal = parseJsonArray(analysis.disposal);
  const alternatives = parseJsonArray(analysis.alternatives);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <p className="text-sm text-muted-foreground">
            Analyzed on {formatDate(analysis.createdAt)}
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image column */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={analysis.imageUrl}
                  alt={analysis.label || "Analyzed waste item"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 bg-black/30 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-xs font-medium">
                    {analysis.type || "Unknown type"}
                  </span>
                  <span className="text-sm text-gray-300">
                    {analysis.category || "Uncategorized"}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mt-2">{analysis.label}</h1>
              </div>
            </div>
          </motion.div>

          {/* Analysis column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Environmental Impact */}
            <motion.div 
              className="glass-card rounded-2xl p-6"
              {...fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-semibold">Environmental Impact</h2>
              </div>
              {harms && harms.length > 0 ? (
                <ul className="space-y-2">
                  {harms.map((harm: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>{harm}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No environmental impact data available.</p>
              )}
            </motion.div>

            {/* Proper Disposal */}
            <motion.div 
              className="glass-card rounded-2xl p-6"
              {...fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Recycle className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Proper Disposal</h2>
              </div>
              {disposal && disposal.length > 0 ? (
                <ul className="space-y-2">
                  {disposal.map((instruction: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No disposal instructions available.</p>
              )}
            </motion.div>

            {/* Eco-Friendly Alternatives */}
            <motion.div 
              className="glass-card rounded-2xl p-6"
              {...fadeIn}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-5 w-5 text-green-500" />
                <h2 className="text-xl font-semibold">Eco-Friendly Alternatives</h2>
              </div>
              {alternatives && alternatives.length > 0 ? (
                <ul className="space-y-2">
                  {alternatives.map((alternative: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>{alternative}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No eco-friendly alternatives available.</p>
              )}
            </motion.div>

            {/* Additional Notes */}
            {analysis.extraNotes && (
              <motion.div 
                className="glass-card rounded-2xl p-6"
                {...fadeIn}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-purple-400" />
                  <h2 className="text-xl font-semibold">Additional Notes</h2>
                </div>
                <p>{analysis.extraNotes}</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-wrap gap-3 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button asChild>
                <Link href="/dashboard/upload">
                  Analyze Another Item
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/chat">
                  Ask AI About This
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 