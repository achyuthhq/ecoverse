"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, Recycle, Leaf, Info, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button2";
import DashboardShell from "@/components/dashboard-shell";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

type AnalysisDetailProps = {
  analysis: {
    id: string;
    createdAt: Date;
    imageUrl: string;
    label: string | null;
    type: string | null;
    category: string | null;
    harms: string[];
    disposal: string[];
    alternatives: string[];
    extraNotes: string | null;
  };
};

export default function AnalysisDetail({ analysis }: AnalysisDetailProps) {
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  // Function to truncate text to a specific number of words
  const truncateWords = (text: string | null, wordCount: number): string => {
    if (!text) return "";
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
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
                <div className="mt-2">
                  <h1 className="text-base font-bold text-green-400">Ecoverse AI</h1>
                  <div className="relative">
                    <p className="text-sm text-white/90">
                      {showFullCaption ? analysis.label : truncateWords(analysis.label, 6)}
                    </p>
                    <button 
                      onClick={() => setShowFullCaption(!showFullCaption)}
                      className="absolute -right-1 -bottom-1 p-1 text-white/80 hover:text-white"
                    >
                      {showFullCaption ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
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
              {analysis.harms && analysis.harms.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.harms.map((harm: string, index: number) => (
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
              {analysis.disposal && analysis.disposal.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.disposal.map((instruction: string, index: number) => (
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
              {analysis.alternatives && analysis.alternatives.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.alternatives.map((alternative: string, index: number) => (
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

            {/* Additional Notes - Full Caption */}
            {analysis.extraNotes && (
              <motion.div 
                className="glass-card rounded-2xl p-6 mt-4 lg:hidden"
                {...fadeIn}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-green-400" />
                    <h2 className="text-sm font-semibold">AI Detection Details</h2>
                  </div>
                  {showDetails ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {showDetails && (
                  <p className="text-xs text-gray-400 mt-2">{analysis.extraNotes}</p>
                )}
              </motion.div>
            )}
            
            {/* Additional Notes - For larger screens */}
            {analysis.extraNotes && (
              <motion.div 
                className="glass-card rounded-2xl p-6 hidden lg:block"
                {...fadeIn}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-5 w-5 text-green-400" />
                    <h2 className="text-xl font-semibold">AI Detection Details</h2>
                  </div>
                  {showDetails ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {showDetails && (
                  <p className="text-sm text-gray-400 mt-4">{analysis.extraNotes}</p>
                )}
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