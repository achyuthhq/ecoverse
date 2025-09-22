"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReadMoreTextProps {
  text: string | null;
  wordCount?: number;
  className?: string;
  textClassName?: string;
  buttonClassName?: string;
}

export default function ReadMoreText({
  text,
  wordCount = 7,
  className = "",
  textClassName = "",
  buttonClassName = "",
}: ReadMoreTextProps) {
  const [showFullText, setShowFullText] = useState(false);

  // Function to truncate text to a specific number of words
  const truncateWords = (text: string | null, wordCount: number): string => {
    if (!text) return "";
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  if (!text) return null;

  return (
    <div className={`relative ${className}`}>
      <p className={`${textClassName}`}>
        {showFullText ? text : truncateWords(text, wordCount)}
      </p>
      {text.split(' ').length > wordCount && (
        <button 
          onClick={() => setShowFullText(!showFullText)}
          className={`flex items-center gap-1 mt-1 text-sm font-color-black font-medium ${buttonClassName}`}
          aria-label={showFullText ? "Show less" : "Read more"}
        >
          {showFullText ? (
            <>
              <span>Show less</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Read more</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
} 