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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {analyses.map((analysis, index) => {
        // Parse the JSON strings
        const harms = parseJsonArray(analysis.harms);
        const disposal = parseJsonArray(analysis.disposal);
        
        // Determine category color
        let categoryColor = "bg-gray-100 text-gray-700";
        if (analysis.category) {
          const category = analysis.category.toLowerCase();
          if (category.includes("recycl")) {
            categoryColor = "bg-green-100 text-green-700";
          } else if (category.includes("compost")) {
            categoryColor = "bg-amber-100 text-amber-700";
          } else if (category.includes("hazard")) {
            categoryColor = "bg-red-100 text-red-700";
          } else if (category.includes("landfill")) {
            categoryColor = "bg-gray-100 text-gray-700";
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
              <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 h-full">
                <div className="relative aspect-square">
                  <Image
                    src={analysis.imageUrl}
                    alt={analysis.label || "Analyzed image"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-white/90 text-gray-800 font-medium shadow-sm">
                      {analysis.type || "Unknown"}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
                    {analysis.label}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(analysis.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-medium ${categoryColor} px-2 py-1 rounded-md`}>
                      {analysis.category || "Uncategorized"}
                    </span>
                  </div>
                  
                  {disposal && disposal.length > 0 && (
                    <p className="text-sm line-clamp-2 text-gray-600">
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