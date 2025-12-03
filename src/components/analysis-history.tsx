"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate, parseJsonArray } from "@/lib/utils";
import { Analysis } from "@prisma/client";
import { motion } from "framer-motion";
import { Calendar, Tag } from "lucide-react";

interface AnalysisHistoryProps {
  analyses: Analysis[];
}

const AnalysisHistory = ({ analyses }: AnalysisHistoryProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {analyses.map((analysis, index) => {
        // Parse the JSON strings
        const harms = parseJsonArray(analysis.harms);
        const disposal = parseJsonArray(analysis.disposal);
        
        // Determine category color
        let categoryColor = "bg-white/10 text-gray-300 border border-white/20";
        if (analysis.category) {
          const category = analysis.category.toLowerCase();
          if (category.includes("recycl")) {
            categoryColor = "bg-white/10 text-white border border-white/20";
          } else if (category.includes("compost")) {
            categoryColor = "bg-amber-500/20 text-amber-400 border border-amber-500/30";
          } else if (category.includes("hazard")) {
            categoryColor = "bg-red-500/20 text-red-400 border border-red-500/30";
          } else if (category.includes("landfill")) {
            categoryColor = "bg-white/10 text-gray-300 border border-white/20";
          }
        }
        
        return (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={`/dashboard/analysis/${analysis.id}`}>
              <div className="glass-card rounded-lg overflow-hidden hover:shadow-xl hover:border-white/20 transition-all duration-300 h-full">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={analysis.imageUrl}
                    alt={analysis.label || "Analyzed image"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 rounded-full text-xs glass-card text-white font-medium shadow-sm">
                      {analysis.type || "Unknown"}
                    </span>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1">
                    {analysis.label}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(analysis.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium ${categoryColor} px-1.5 py-0.5 rounded-md`}>
                      {analysis.category || "Uncategorized"}
                    </span>
                  </div>
                  
                  {disposal && disposal.length > 0 && (
                    <p className="text-xs line-clamp-2 text-gray-400">
                      {disposal[0]}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AnalysisHistory; 