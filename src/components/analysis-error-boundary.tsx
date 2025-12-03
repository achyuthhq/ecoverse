"use client";

import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button2";
import Link from "next/link";

interface AnalysisErrorBoundaryProps {
  children: React.ReactNode;
  analysisId: string;
}

export default function AnalysisErrorBoundary({ children, analysisId }: AnalysisErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Analysis error:", error);
      setHasError(true);
      setErrorMessage("Analysis generation failed. Please try again.");
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Analysis Generation Failed
          </h3>
          
          <p className="text-gray-600 mb-6">
            {errorMessage || "We encountered an issue while generating your analysis. This might be due to network issues or API limitations."}
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Link href="/dashboard/analyze">
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            If the issue persists, try uploading a different image or check your internet connection.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 