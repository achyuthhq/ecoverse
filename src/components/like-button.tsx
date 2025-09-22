"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
  initialLikes: number;
  analysisId: string;
  className?: string;
}

export default function LikeButton({ initialLikes, analysisId, className }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (isLiked) {
      setLikes(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setIsLiked(true);
    }
    
    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      className={`flex items-center gap-1 transition-all duration-200 ${
        isLiked 
          ? "text-red-500 hover:text-red-600" 
          : "text-gray-600 hover:text-red-500"
      } ${className}`}
    >
      <Heart 
        className={`h-4 w-4 transition-all duration-200 ${
          isLiked ? "fill-current" : ""
        } ${isAnimating ? "scale-125" : ""}`}
      />
      <span className="text-sm">{likes}</span>
    </Button>
  );
} 