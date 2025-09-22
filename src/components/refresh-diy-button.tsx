"use client";

import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefreshDIYButtonProps {
  onRefresh: () => Promise<string>;
  onSuccess: (newDiyIdea: string) => void;
  className?: string;
}

export default function RefreshDIYButton({ onRefresh, onSuccess, className }: RefreshDIYButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const newDiyIdea = await onRefresh();
      onSuccess(newDiyIdea);
    } catch (error) {
      console.error("Error refreshing DIY idea:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant="ghost"
      size="sm"
      className={`group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center gap-2">
        {isRefreshing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isRefreshing ? "Generating..." : "Refresh Idea"}
        </span>
      </div>
    </Button>
  );
} 