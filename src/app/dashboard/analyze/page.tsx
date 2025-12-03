"use client";

import PageTemplate from "@/components/page-template";
import { Camera, Upload, Sparkles } from "lucide-react";
import ImageUpload from "@/components/image-upload";

export default function AnalyzePage() {
  return (
    <PageTemplate 
      title="Analyze" 
      description="Upload an image to get AI-powered environmental analysis"
    >
      <div className="glass-card rounded-xl shadow-lg p-4">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
          </div>
          <p className="text-gray-300 text-xs">
            Upload an image to get instant environmental analysis and eco-friendly recommendations.
          </p>
        </div>
        
        <ImageUpload />
      </div>
    </PageTemplate>
  );
}