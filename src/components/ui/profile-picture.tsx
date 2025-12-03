import Image from "next/image";
import { ReactNode } from "react";

interface ProfilePictureProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square" | "triangle";
  fallback?: ReactNode;
  className?: string;
}

export default function ProfilePicture({
  src,
  alt,
  size = "md",
  shape = "circle",
  fallback = "👤",
  className = ""
}: ProfilePictureProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-32 h-32"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-2xl"
  };

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-xl",
    triangle: "clip-triangle"
  };

  const baseClasses = `${sizeClasses[size]} ${shapeClasses[shape]} overflow-hidden border-2 border-white shadow-md ${className}`;

  return (
    <div className={baseClasses}>
      {src ? (
        <Image 
          src={src} 
          alt={alt} 
          width={parseInt(sizeClasses[size].split(' ')[0].replace('w-', '')) * 4} 
          height={parseInt(sizeClasses[size].split(' ')[0].replace('w-', '')) * 4} 
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 border-2 border-white/20 flex items-center justify-center backdrop-blur-sm">
          <span className={`text-white/80 ${textSizeClasses[size]} font-semibold`}>
            {fallback}
          </span>
        </div>
      )}
    </div>
  );
} 