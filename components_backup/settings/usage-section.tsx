"use client";

import React from "react";
import { BarChart3, Zap, CreditCard, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button2";

interface UsageSectionProps {
  analysesCount: number;
}

export default function UsageSection({ analysesCount }: UsageSectionProps) {
  // Free tier limit (for demo purposes)
  const FREE_TIER_LIMIT = 50;
  const usagePercentage = Math.min((analysesCount / FREE_TIER_LIMIT) * 100, 100);
  
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Statistics</h2>
        
        {/* Current Plan */}
        <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-green-100">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Free Plan</h3>
              <p className="text-sm text-gray-600 mt-1">
                You're currently on the free plan with {FREE_TIER_LIMIT} analyses per month.
              </p>
              <Button 
                className="mt-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                size="sm"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
        
        {/* Usage Progress */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">Analyses Used</h4>
              <p className="text-sm text-gray-500">This month</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold">{analysesCount}</span>
              <span className="text-gray-500">/{FREE_TIER_LIMIT}</span>
            </div>
          </div>
          
          <Progress value={usagePercentage} className="h-2" />
          
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            {FREE_TIER_LIMIT - analysesCount > 0 ? (
              `You have ${FREE_TIER_LIMIT - analysesCount} analyses remaining this month`
            ) : (
              "You've reached your monthly limit. Upgrade for more analyses."
            )}
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
          
          {/* Previous Months (Demo Data) */}
          <div className="grid grid-cols-3 text-sm text-gray-500">
            <div>Previous Month</div>
            <div className="text-center">32</div>
            <div className="text-right">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Complete
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 text-sm text-gray-500">
            <div>Two Months Ago</div>
            <div className="text-center">18</div>
            <div className="text-right">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Complete
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 