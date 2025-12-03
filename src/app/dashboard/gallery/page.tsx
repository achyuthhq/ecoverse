"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Image as ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";

import DashboardShell from "@/components/dashboard-shell";
import { useSession } from "next-auth/react";
import ClassicLoader from "@/components/ui/classic-loader";

interface Analysis {
  id: string;
  imageUrl: string;
  label: string;
  category?: string;
  type?: string;
  createdAt: string;
}

export default function GalleryPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAnalyses();
    }
  }, [user]);

  const loadAnalyses = async () => {
    try {
      const response = await fetch(`/api/user/${user?.id}/analyses`);
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data);
      }
    } catch (error) {
      console.error("Failed to load analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0c0c' }}>
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 pt-6 sm:pt-8 md:pt-4 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 -z-10 rounded-xl opacity-50" />
        
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Your Gallery
            </h1>
          </div>
          <p className="text-gray-300 max-w-md mx-auto text-sm sm:text-base px-4">
            A collection of your environmental analysis journey
          </p>
        </div>
        
        {/* Gallery Grid */}
        <div className="glass-card rounded-2xl shadow-lg p-6">
          {analyses.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {analyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group cursor-pointer"
                >
                  <div className="aspect-square rounded-xl overflow-hidden glass-card shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <Image
                      src={analysis.imageUrl}
                      alt={analysis.label}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-sm font-medium truncate">
                        {analysis.label}
                      </p>
                      <p className="text-white/80 text-xs">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-gray-400" />
                <p className="text-gray-500 font-medium">No analyses yet</p>
                <Sparkles className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Start analyzing items to build your gallery
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm">Your gallery will appear here</span>
                <ImageIcon className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}