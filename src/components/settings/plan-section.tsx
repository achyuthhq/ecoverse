"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Calendar, 
  Zap, 
  Infinity, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Shield,
  Star
} from "lucide-react";

interface User {
  id: string;
  // Name can be null/undefined from auth providers
  name?: string | null;
  // Subscription fields may not be set for new/free users
  subscriptionType?: string | null;
  subscriptionExpires?: string | null;
}

interface PlanSectionProps {
  user: User;
  analysesCount: number;
}

export default function PlanSection({ user, analysesCount }: PlanSectionProps) {
  const isLifetime = user.subscriptionType === "lifetime";
  const isMonthly = user.subscriptionType === "monthly";
  
  // Calculate days remaining for monthly subscriptions
  const getDaysRemaining = () => {
    if (isLifetime) return null;
    if (!user.subscriptionExpires) return null;
    
    const expirationDate = new Date(user.subscriptionExpires);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();
  const isExpired = isMonthly && daysRemaining === 0;

  // Calculate usage percentage (assuming 100 analyses per month limit for monthly)
  const monthlyLimit = 100;
  const usagePercentage = isLifetime ? 0 : Math.min((analysesCount / monthlyLimit) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className="glass-card p-6 border border-white/10 shadow-lg rounded-xl overflow-hidden backdrop-blur-xl bg-[#0c0c0c]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              isLifetime 
                ? "bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30" 
                : isExpired
                ? "bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30"
                : "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30"
            } shadow-lg`}>
              <Crown className={`h-6 w-6 ${
                isLifetime ? "text-purple-400" : isExpired ? "text-red-400" : "text-emerald-400"
              }`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {isLifetime ? "Lifetime Plan" : "Monthly Plan"}
              </h3>
              <p className="text-gray-400">
                {isLifetime ? "Unlimited access forever" : "Monthly subscription"}
              </p>
            </div>
          </div>
          <Badge 
            variant={isLifetime ? "default" : isExpired ? "destructive" : "secondary"}
            className={`px-3 py-1 ${
              isLifetime 
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                : isExpired
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {isLifetime ? "Active" : isExpired ? "Expired" : "Active"}
          </Badge>
        </div>

        {/* Plan Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 rounded-lg border border-white/10 bg-[#191919]">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Subscription</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {isLifetime ? "Forever" : isExpired ? "Expired" : `${daysRemaining} days left`}
            </p>
            {isMonthly && !isExpired && (
              <p className="text-xs text-gray-500">
                Expires {new Date(user.subscriptionExpires!).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="glass-card p-4 rounded-lg border border-white/10 bg-[#191919]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Analyses</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {isLifetime ? "Unlimited" : `${analysesCount}/${monthlyLimit}`}
            </p>
            <p className="text-xs text-gray-500">
              {isLifetime ? "No limits" : "This month"}
            </p>
          </div>

          <div className="glass-card p-4 rounded-lg border border-white/10 bg-[#191919]">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Status</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {isLifetime ? "Premium" : isExpired ? "Expired" : "Active"}
            </p>
            <p className="text-xs text-gray-500">
              {isLifetime ? "Lifetime access" : isExpired ? "Renewal needed" : "Auto-renewal"}
            </p>
          </div>
        </div>

        {/* Usage Progress (for monthly plans) */}
        {isMonthly && !isExpired && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Monthly Usage</span>
              <span className="text-sm text-gray-400">{analysesCount}/{monthlyLimit}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-gray-500">
              {usagePercentage >= 90 ? "Approaching limit" : "Usage is normal"}
            </p>
          </div>
        )}
      </Card>

      {/* Features Comparison */}
      <Card className="glass-card p-6 border border-white/10 shadow-lg rounded-xl backdrop-blur-xl bg-[#0c0c0c]">
        <h3 className="text-lg font-semibold text-white mb-4">Plan Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-gray-300">AI Image Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-gray-300">Environmental Insights</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-gray-300">Recycling Recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-gray-300">Analysis History</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-gray-300">Eco Tips & Guides</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-gray-300">Community Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-gray-300">Leaderboard</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-gray-300">Priority Support</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Upgrade Prompt (for monthly users) */}
      {isMonthly && (
        <Card className="glass-card p-6 border border-purple-500/30 shadow-lg rounded-xl backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <Star className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Upgrade to Lifetime</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Get unlimited access forever with our lifetime plan. No monthly fees, no limits, 
            and all premium features included.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Infinity className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Unlimited Analyses</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Premium Features</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Lifetime Access</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
