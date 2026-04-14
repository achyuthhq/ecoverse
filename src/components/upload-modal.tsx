"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Loader2, Camera, Sparkles, Zap, Target, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button2";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CameraCapture from "@/components/CameraCapture";
import ImageCropper from "@/components/image-cropper";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ShaderAnimation } from "@/components/shader-animation";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const modelOptions = {
  'openai': 'GPT-5.2 (Max)',
  'openai-large': 'GPT-5',
  'claude': 'Claude 4.5 Sonnet',
  'claude-large': 'Claude 4.5 Opus',
  'gemini': 'Gemini 3.0 Pro',
  'gemini-large': 'Gemini 3.0 Ultra',
  'gemini-search': 'Gemini Search',
  'mistral': 'Mistral 7B',
  'grok': 'Grok 4',
  'perplexity-fast': 'Perplexity Sonar',
  'perplexity-reasoning': 'Perplexity Reasoning',
  'deepseek': 'DeepSeek R1',
  'kimi-k2-thinking': 'Kimi K2',
  'openai-fast': 'GPT-4o Mini',

};


export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { data: session } = useSession();
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('openai');
  const [enableReadOut, setEnableReadOut] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('nova');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const voiceOptions = [
    { value: 'nova', label: 'Nova' },
    { value: 'shimmer', label: 'Shimmer' },
    { value: 'alloy', label: 'Alloy' },
    { value: 'echo', label: 'Echo' },
    { value: 'fable', label: 'Fable' },
    { value: 'onyx', label: 'Onyx' },
  ];


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
      const imageData = reader.result as string;
      setOriginalImage(imageData);
      setImage(imageData);
      setShowCropper(true);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

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
      const imageData = reader.result as string;
      setOriginalImage(imageData);
      setImage(imageData);
      setShowCropper(true);
    };
    reader.readAsDataURL(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveImage = () => {
    setImage(null);
    setFile(null);
    setOriginalImage(null);
    setShowCropper(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCameraCapture = (imageData: string, capturedFile: File) => {
    setOriginalImage(imageData);
    setImage(imageData);
    setFile(capturedFile);
    setError(null);
    setShowCropper(true);
  };

  const handleCameraError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleCropConfirm = (croppedImageData: string) => {
    setImage(croppedImageData);
    setShowCropper(false);
    
    // Convert cropped image data to File object
    const base64Data = croppedImageData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const croppedFile = new File([byteArray], 'cropped-image.jpg', { type: 'image/jpeg' });
    setFile(croppedFile);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (originalImage) {
      setImage(originalImage);
    }
  };

  const handleUpload = async () => {
    console.log("[UPLOAD] Analyze Image button clicked");
    if (!file) {
      console.warn("[UPLOAD] No file selected, aborting upload");
      return;
    }

    console.log("[UPLOAD] Starting image upload and analysis");
    console.log("[UPLOAD] Selected model:", selectedModel);
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
      console.log("[UPLOAD] Converting file to base64...");
      const reader = new FileReader();
      const fileReadPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Image = await fileReadPromise;
      console.log("[UPLOAD] File converted to base64, length:", base64Image.length);
      
      // Check authentication
      if (!session?.user?.id) {
        console.error("[UPLOAD] User not authenticated");
        throw new Error("User not found. Please log in again.");
      }
      console.log("[UPLOAD] User authenticated, ID:", session.user.id);

      // Map model selection to actual API parameter
      // GPT-5 uses 'openai' parameter but different display name
      const apiModel = selectedModel === 'openai-gpt5' ? 'openai' : selectedModel;
      console.log("[UPLOAD] Mapped model:", selectedModel, "-> API model:", apiModel);
      
      // Submit to analysis API with selected model and TTS options
      console.log("[UPLOAD] Requesting /api/analyze with model:", apiModel);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: base64Image, 
          model: apiModel,
          enableReadOut: enableReadOut,
          voice: enableReadOut ? selectedVoice : undefined
        }),
      });

      console.log("[UPLOAD] API response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[UPLOAD] API request failed:", errorData);
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      console.log('[UPLOAD] Analysis result received:', data);
      console.log('[UPLOAD] Analysis ID:', data.id);
      
      setUploadProgress(100);
      clearInterval(interval);
      
      // Close modal first
      onClose();
      
      // Clear upload state and wait a bit to ensure modal is closed
      setTimeout(() => {
        setIsUploading(false);
        
        // Redirect to analysis page after successful upload
        if (data && data.id) {
          console.log("[UPLOAD] Redirecting to analysis page:", `/dashboard/analysis/${data.id}`);
          router.push(`/dashboard/analysis/${data.id}`);
        } else {
          console.error("[UPLOAD] No analysis ID returned from server");
          throw new Error('No analysis ID returned from server');
        }
      }, 100);
      
    } catch (err) {
      console.error("[UPLOAD] Upload error:", err);
      setError(`Failed to upload image: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsUploading(false);
      clearInterval(interval);
    } finally {
      console.log("[UPLOAD] Upload process completed");
    }
  };

  const resetState = () => {
    setImage(null);
    setFile(null);
    setOriginalImage(null);
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setActiveTab('upload');
    setShowCropper(false);
    setSelectedModel('');
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation completes
    setTimeout(resetState, 300);
  };

  return (
    <>
      {isUploading && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[9999]">
          <ShaderAnimation />
          <div className="absolute inset-0 flex items-center justify-center z-[10000]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center px-4"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8">AI Analysis in Progress</h2>
              <motion.p
                key={uploadProgress < 30 ? "Uploading..." : uploadProgress < 60 ? "Recognizing..." : uploadProgress < 95 ? "Thinking..." : "Generating..."}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-lg sm:text-xl md:text-2xl font-semibold text-emerald-300/90 tracking-wide"
              >
                {uploadProgress < 30 ? "Uploading..." : 
                 uploadProgress < 60 ? "Recognizing..." : 
                 uploadProgress < 95 ? "Thinking..." : "Generating..."}
              </motion.p>
            </motion.div>
          </div>
        </div>,
        document.body
      )}
      <Dialog open={isOpen && !isUploading} onOpenChange={(open: boolean) => !open && handleClose()}>
        <DialogContent className={cn(
          "sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] glass-card backdrop-blur-xl rounded-3xl p-0 border overflow-hidden shadow-2xl"
        )} style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="relative">
          {/* Enhanced Header with modern design */}
          <div className="relative p-4 border-b bg-gradient-to-r from-white/5 to-transparent" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/10 to-white/5 rounded-full translate-y-10 -translate-x-10 blur-xl" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-white font-montserrat">
                    {showCropper ? 'Crop Image' : 'Upload Image'}
                  </DialogTitle>
                  <p className="text-xs text-gray-300 mt-0.5 font-montserrat">
                    {showCropper ? 'Adjust your image for better analysis' : 'Upload or capture an image for AI analysis'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-8 w-8 hover:bg-white/10 text-white transition-all duration-300">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Tabs - only show when not cropping */}
          {!showCropper && (
            <div className="flex border-b bg-white/5" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 font-montserrat ${
                  activeTab === 'upload' 
                    ? 'text-white border-b-2 border-white bg-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 font-montserrat ${
                  activeTab === 'camera' 
                    ? 'text-white border-b-2 border-white bg-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </button>
            </div>
          )}

          {/* Enhanced Content */}
          <div className={`p-4 ${showCropper ? 'max-h-[70vh] overflow-hidden' : 'max-h-[60vh] overflow-y-auto'}`}>
            <AnimatePresence mode="wait">
              {showCropper && originalImage ? (
                <motion.div
                  key="cropper"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImageCropper
                    imageSrc={originalImage}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                  />
                </motion.div>
              ) : activeTab === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {!image ? (
                    <motion.div
                      className="relative border-2 border-dashed rounded-2xl p-8 glass-card hover:border-white/40 transition-all duration-300 group bg-gradient-to-br from-white/5 to-white/0"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      whileHover={{ scale: 1.01, borderColor: "rgba(255, 255, 255, 0.4)" }}
                    >
                      <div className="flex flex-col items-center justify-center text-center relative z-10">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 shadow-lg border border-white/20">
                          <ImageIcon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 font-montserrat">
                          Upload an image
                        </h3>
                        <p className="text-xs text-gray-300 mb-6 max-w-md leading-relaxed font-montserrat">
                          Drag and drop an image here, or click to select a file from your
                          device. We accept JPG, PNG, and GIF files up to <span className="font-semibold text-white">32MB</span>.
                        </p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="h-10 px-6 rounded-lg bg-white text-gray-900 hover:bg-gray-100 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-montserrat border-0"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select Image
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        {error && (
                          <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 text-xs text-red-400 px-3 py-2 rounded-lg glass-card border border-red-500/30 font-montserrat"
                          >
                            {error}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      <div className="relative aspect-square max-h-64 rounded-2xl overflow-hidden border-2 shadow-xl glass-card flex items-center justify-center" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <Image
                          src={image}
                          alt="Preview"
                          fill
                          className="object-contain"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-3 right-3 p-1.5 glass-card backdrop-blur-sm rounded-full shadow-lg hover:bg-white/10 transition-all duration-300 hover:scale-110"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                      
                      <div className="mt-3 space-y-3">
                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-2.5 text-red-400 rounded-lg text-xs glass-card border border-red-500/30 font-montserrat"
                          >
                            {error}
                          </motion.div>
                        )}
                        
                        {/* Model Selector */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-white/90 font-montserrat">
                            AI Model <span className="text-red-400">*</span>
                          </label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  "flex h-9 w-full items-center justify-between gap-2 px-3 rounded-lg text-xs font-medium transition-colors hover:bg-white/10 focus-visible:outline-none border glass-card font-montserrat",
                                  selectedModel 
                                    ? "text-white border-white/20" 
                                    : "text-white/50 border-yellow-400/50 bg-yellow-400/10"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span>
                                    {selectedModel 
                                      ? modelOptions[selectedModel as keyof typeof modelOptions] 
                                      : "Select AI Model (Required)"}
                                  </span>
                                </div>
                                <ChevronDown className="h-3 w-3 opacity-70" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="start" 
                              className="glass-card border border-white/10 min-w-[200px] p-1"
                            >
                              {Object.entries(modelOptions).map(([key, displayName]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => setSelectedModel(key)}
                                  className={cn(
                                    "cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 rounded-md px-3 py-2 text-xs font-montserrat",
                                    selectedModel === key && "bg-white/10"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span>{displayName}</span>
                                    {selectedModel === key && (
                                      <span className="text-white/60 text-[10px]">✓</span>
                                    )}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Read Out Option */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="readOut"
                              checked={enableReadOut}
                              onChange={(e) => setEnableReadOut(e.target.checked)}
                              className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-400 focus:ring-emerald-400 focus:ring-2"
                            />
                            <label htmlFor="readOut" className="text-xs font-medium text-white/90 font-montserrat cursor-pointer">
                              Read Out Analysis
                            </label>
                          </div>
                          {enableReadOut && (
                            <div className="ml-6 space-y-2">
                              <label className="text-xs font-medium text-white/70 font-montserrat">
                                Voice
                              </label>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className={cn(
                                      "flex h-8 w-full items-center justify-between gap-2 px-3 rounded-lg text-xs font-medium transition-colors hover:bg-white/10 focus-visible:outline-none border glass-card font-montserrat text-white border-white/20"
                                    )}
                                  >
                                    <span>{voiceOptions.find(v => v.value === selectedVoice)?.label || 'Nova'}</span>
                                    <ChevronDown className="h-3 w-3 opacity-70" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="start" 
                                  className="glass-card border border-white/10 min-w-[150px] p-1"
                                >
                                  {voiceOptions.map((voice) => (
                                    <DropdownMenuItem
                                      key={voice.value}
                                      onClick={() => setSelectedVoice(voice.value)}
                                      className={cn(
                                        "cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 rounded-md px-3 py-2 text-xs font-montserrat",
                                        selectedVoice === voice.value && "bg-white/10"
                                      )}
                                    >
                                      <div className="flex items-center justify-between w-full gap-2">
                                        <span>{voice.label}</span>
                                        {selectedVoice === voice.value && (
                                          <span className="text-white/60 text-[10px]">✓</span>
                                        )}
                                      </div>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 sticky bottom-0 glass-card backdrop-blur-sm p-2 -mx-2 rounded-lg">
                          <Button
                            variant="outline"
                            onClick={handleRemoveImage}
                            disabled={isUploading}
                            className="flex-1 h-9 rounded-lg border-2 border-white/20 hover:bg-white/10 hover:border-white/30 text-white text-xs font-semibold font-montserrat transition-all duration-300"
                          >
                            Change Image
                          </Button>
                          <Button
                            onClick={handleUpload}
                            disabled={isUploading || !selectedModel}
                            className={cn(
                              "flex-1 h-9 rounded-lg text-xs font-semibold shadow-lg transition-all duration-300 font-montserrat border-0",
                              selectedModel
                                ? "bg-white text-gray-900 hover:bg-gray-100 hover:shadow-xl hover:scale-105"
                                : "bg-white/30 text-white/50 cursor-not-allowed"
                            )}
                          >
                            {isUploading ? (
                              <div className="flex items-center">
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Zap className="h-3.5 w-3.5 mr-1.5" />
                                <span>Analyze Image</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'camera' && !showCropper && (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {!image ? (
                    <CameraCapture 
                      onCapture={handleCameraCapture}
                      onError={handleCameraError}
                    />
                  ) : (
                    <motion.div
                      key="camera-preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 space-y-6"
                    >
                      <div className="relative aspect-square max-h-64 rounded-2xl overflow-hidden border-2 shadow-xl glass-card flex items-center justify-center" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <Image
                          src={image}
                          alt="Captured photo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        {isUploading && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium text-gray-300 font-montserrat">
                              <span>Upload progress</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-white transition-all duration-300 ease-out rounded-full shadow-lg"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-2.5 text-red-400 rounded-lg text-xs glass-card border border-red-500/30 font-montserrat"
                          >
                            {error}
                          </motion.div>
                        )}
                        
                        {/* Model Selector */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-white/90 font-montserrat">
                            AI Model <span className="text-red-400">*</span>
                          </label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  "flex h-9 w-full items-center justify-between gap-2 px-3 rounded-lg text-xs font-medium transition-colors hover:bg-white/10 focus-visible:outline-none border glass-card font-montserrat",
                                  selectedModel 
                                    ? "text-white border-white/20" 
                                    : "text-white/50 border-yellow-400/50 bg-yellow-400/10"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span>
                                    {selectedModel 
                                      ? modelOptions[selectedModel as keyof typeof modelOptions] 
                                      : "Select AI Model (Required)"}
                                  </span>
                                </div>
                                <ChevronDown className="h-3 w-3 opacity-70" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="start" 
                              className="glass-card border border-white/10 min-w-[200px] p-1"
                            >
                              {Object.entries(modelOptions).map(([key, displayName]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => setSelectedModel(key)}
                                  className={cn(
                                    "cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 rounded-md px-3 py-2 text-xs font-montserrat",
                                    selectedModel === key && "bg-white/10"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span>{displayName}</span>
                                    {selectedModel === key && (
                                      <span className="text-white/60 text-[10px]">✓</span>
                                    )}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex gap-2 sticky bottom-0 glass-card backdrop-blur-sm p-2 -mx-2 rounded-lg">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setImage(null);
                              setFile(null);
                              setOriginalImage(null);
                              setError(null);
                            }}
                            disabled={isUploading}
                            className="flex-1 h-9 rounded-lg border-2 border-white/20 hover:bg-white/10 hover:border-white/30 text-white text-xs font-semibold font-montserrat transition-all duration-300"
                          >
                            Retake Photo
                          </Button>
                          <Button
                            onClick={handleUpload}
                            disabled={isUploading || !selectedModel}
                            className={cn(
                              "flex-1 h-9 rounded-lg text-xs font-semibold shadow-lg transition-all duration-300 font-montserrat border-0",
                              selectedModel
                                ? "bg-white text-gray-900 hover:bg-gray-100 hover:shadow-xl hover:scale-105"
                                : "bg-white/30 text-white/50 cursor-not-allowed"
                            )}
                          >
                            {isUploading ? (
                              <div className="flex items-center">
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Zap className="h-3.5 w-3.5 mr-1.5" />
                                <span>Analyze Image</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
} 