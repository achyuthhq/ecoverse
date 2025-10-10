import React from "react";

interface ClassicLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ClassicLoader({ size = "md", className = "" }: ClassicLoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2", 
    lg: "h-10 w-10 border-4"
  };

  return (
    <div 
      className={`border-green-500 flex ${sizeClasses[size]} animate-spin items-center justify-center rounded-full border-t-transparent ${className}`}
    ></div>
  );
}
