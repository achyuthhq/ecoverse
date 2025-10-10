"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Sparkles, Camera, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCodeAuth } from "@/lib/auth-utils";

export function ImageUpload() {
  const { user, isLoading } = useCodeAuth();
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.type.includes("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Check file size (max 32MB)
    if (selectedFile.size > 32 * 1024 * 1024) {
      setError("File size should be less than 32MB.");
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    // Check file type
    if (!droppedFile.type.includes("image/")) {
      setError("Please drop an image file.");
      return;
    }

    // Check file size (max 32MB)
    if (droppedFile.size > 32 * 1024 * 1024) {
      setError("File size should be less than 32MB.");
      return;
    }

    setFile(droppedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    try {
      // Convert file to base64 for API submission
      const reader = new FileReader();
      const fileReadPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Image = await fileReadPromise;
      
      // Get user from useCodeAuth hook
      console.log("User from useCodeAuth:", user);
      
      if (!user) {
        console.error("No user found from useCodeAuth hook");
        throw new Error("User not found. Please log in again.");
      }
      
      if (!user.id) {
        console.error("User ID is missing from user object:", user);
        throw new Error("User ID not found. Please log in again.");
      }
      
      console.log("Using user ID:", user.id);

      // Submit to analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      console.log('Analysis result:', data);
      
      setUploadProgress(100);
      
      // Redirect to analysis page after successful upload
      setTimeout(() => {
        if (data && data.id) {
          router.push(`/dashboard/analysis/${data.id}`);
        } else {
          throw new Error('No analysis ID returned from server');
        }
      }, 500);
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Failed to upload image: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsUploading(false);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!image ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-3xl transition-all duration-300 ${
              isDragOver 
                ? "bg-gradient-to-br from-blue-50/80 to-purple-50/80 border-2 border-dashed border-blue-300/60" 
                : "bg-gradient-to-br from-gray-50/80 to-white/80 border-2 border-dashed border-gray-300/60"
            } backdrop-blur-xl`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-3xl"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 opacity-20">
              <Camera className="h-6 w-6 text-purple-400" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                {/* Icon container */}
                <div className={`relative mb-6 p-6 rounded-2xl transition-all duration-300 ${
                  isDragOver 
                    ? "bg-gradient-to-br from-blue-100/80 to-purple-100/80 shadow-lg scale-110" 
                    : "bg-gradient-to-br from-gray-100/80 to-white/80 shadow-md"
                } backdrop-blur-sm`}>
                  <div className="relative">
                    <Upload className={`h-12 w-12 transition-all duration-300 ${
                      isDragOver ? "text-blue-500 scale-110" : "text-gray-500"
                    }`} />
                    {isDragOver && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-1 -right-1"
                      >
                        <Zap className="h-5 w-5 text-yellow-500" />
                      </motion.div>
                    )}
                  </div>
              </div>
                
                {/* Text content */}
                <div className="space-y-4 max-w-md">
                  <h3 className={`text-2xl font-bold transition-all duration-300 ${
                    isDragOver ? "text-blue-600" : "text-gray-800"
                  }`}>
                    {isDragOver ? "Drop your image here!" : "Upload your image"}
              </h3>
                  <p className={`text-sm transition-all duration-300 ${
                    isDragOver ? "text-blue-600" : "text-gray-600"
                  } leading-relaxed`}>
                    {isDragOver 
                      ? "Release to upload and analyze your waste item"
                      : "Drag and drop an image here, or click to browse. We'll analyze it for eco-friendly insights."
                    }
                  </p>
                </div>
                
                {/* Upload button */}
                <div className="mt-8">
              <Button
                onClick={() => fileInputRef.current?.click()}
                    className={`relative overflow-hidden transition-all duration-300 ${
                      isDragOver 
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg scale-105" 
                        : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md"
                    } rounded-2xl px-8 py-3 text-white font-semibold`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Browse Files
                    </span>
                    {/* Button gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
                </div>
                
                {/* File input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
                
                {/* Error message */}
              {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-sm text-red-500 bg-red-50/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-red-200/50"
                  >
                    {error}
                  </motion.p>
              )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Image preview */}
            <div className="relative overflow-hidden rounded-3xl border border-gray-200/50 backdrop-blur-xl bg-white/80">
              <div className="relative aspect-square">
              <Image
                src={image}
                alt="Preview"
                fill
                className="object-cover"
              />
                {/* Remove button */}
              <button
                onClick={handleRemoveImage}
                  className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
              >
                  <X className="h-5 w-5 text-gray-600" />
              </button>
              </div>
            </div>
            
            {/* Upload progress and actions */}
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Upload Progress</span>
                  <span className="font-semibold text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="relative h-3 bg-gray-100/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200/50">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="flex-1 rounded-2xl border-gray-300/50 bg-white/80 backdrop-blur-sm hover:bg-gray-50/80 transition-all duration-200 font-medium"
                >
                  Change Image
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-white"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="h-5 w-5" />
                      <span>Analyze Image</span>
                    </div>
                  )}
                </Button>
              </div>
              
              {/* Error message */}
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 bg-red-50/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-red-200/50"
                >
                  {error}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export as default as well
export default ImageUpload; 