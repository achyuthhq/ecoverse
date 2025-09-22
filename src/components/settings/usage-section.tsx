"use client";

import React from "react";
import { BarChart3, Zap, Info, FileCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UsageSectionProps {
  analysesCount: number;
}

export default function UsageSection({ analysesCount }: UsageSectionProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Statistics</h2>
        
        {/* Current Status */}
        <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-green-100">
              <FileCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Ecoverse Account</h3>
              <p className="text-sm text-gray-600 mt-1">
                You've analyzed {analysesCount} items with Ecoverse.
              </p>
            </div>
          </div>
        </div>
        
        {/* Usage Progress */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">Analyses Completed</h4>
              <p className="text-sm text-gray-500">Total analyses</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold">{analysesCount}</span>
            </div>
          </div>
          
          <Progress value={analysesCount > 0 ? 100 : 0} className="h-2" />
          
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            Continue analyzing items to build your impact
          </p>
        </div>
      </div>
      
      {/* Usage History */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Usage History</h2>
          <BarChart3 className="h-5 w-5 text-gray-500" />
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 text-sm font-medium text-gray-500 pb-2 border-b">
            <div>Period</div>
            <div className="text-center">Analyses</div>
            <div className="text-right">Status</div>
          </div>
          
          {/* Current Month */}
          <div className="grid grid-cols-3 text-sm">
            <div className="font-medium">{new Date().toLocaleString('default', { month: 'long' })}</div>
            <div className="text-center">{analysesCount}</div>
            <div className="text-right">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Active
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
} 