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
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">AI Analysis</h2>
          </div>
          <p className="text-gray-600">
            Upload an image to get instant environmental analysis and eco-friendly recommendations.
          </p>
        </div>
        
        <ImageUpload />
      </div>
    </PageTemplate>
  );
}