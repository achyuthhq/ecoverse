"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Loader2, Camera, Sparkles, Zap, Target } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import CameraCapture from "@/components/CameraCapture";
import ImageCropper from "@/components/image-cropper";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  
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
      
      // Submit to analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      
      // Close modal first
      onClose();
      
      // Redirect to analysis page after successful upload
      setTimeout(() => {
        if (data && data.id) {
          router.push(`/analysis/${data.id}`);
        } else {
          throw new Error('No analysis ID returned from server');
        }
      }, 300);
      
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Failed to upload image: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsUploading(false);
    } finally {
      clearInterval(interval);
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
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation completes
    setTimeout(resetState, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] bg-white/95 backdrop-blur-xl rounded-3xl p-0 border-0 overflow-hidden shadow-2xl">
        <div className="relative">
          {/* Enhanced Header with modern design */}
          <div className="relative p-6 border-b border-gray-100/50 bg-gradient-to-r from-green-50/50 to-blue-50/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/10 to-green-400/10 rounded-full translate-y-12 -translate-x-12 blur-xl" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-teal-600 bg-clip-text text-transparent">
                    {showCropper ? 'Crop Image' : 'Upload Image'}
                  </DialogTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {showCropper ? 'Adjust your image for better analysis' : 'Upload or capture an image for AI analysis'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-10 w-10 hover:bg-gray-100/50">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Tabs - only show when not cropping */}
          {!showCropper && (
            <div className="flex border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                  activeTab === 'upload' 
                    ? 'text-green-600 border-b-2 border-green-500 bg-green-50/50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <Upload className="h-5 w-5" />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                  activeTab === 'camera' 
                    ? 'text-green-600 border-b-2 border-green-500 bg-green-50/50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <Camera className="h-5 w-5" />
                Take Photo
              </button>
            </div>
          )}

          {/* Enhanced Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
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
                      className="relative border-2 border-dashed border-gray-200 rounded-3xl p-12 bg-gradient-to-br from-white via-gray-50/50 to-white hover:border-green-300 transition-all duration-300 group"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      whileHover={{ scale: 1.02, borderColor: "#10b981" }}
                    >
                      <div className="flex flex-col items-center justify-center text-center relative z-10">
                        <div className="p-6 bg-gradient-to-br from-green-100 to-teal-100 rounded-3xl mb-6 shadow-lg">
                          <ImageIcon className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          Upload an image
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
                          Drag and drop an image here, or click to select a file from your
                          device. We accept JPG, PNG, and GIF files up to <span className="font-semibold text-green-600">32MB</span>.
                        </p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="h-12 px-8 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <Upload className="h-5 w-5 mr-2" />
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
                            className="mt-6 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg"
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
                      <div className="relative aspect-square max-h-80 rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl">
                        <Image
                          src={image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
                        >
                          <X className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                      
                      <div className="mt-4 space-y-4">
                        {isUploading && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-gray-600">
                              <span>Upload progress</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-teal-600 transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200"
                          >
                            {error}
                          </motion.div>
                        )}
                        
                        <div className="flex gap-3 sticky bottom-0 bg-white/95 backdrop-blur-sm p-2 -mx-2 rounded-lg">
                          <Button
                            variant="outline"
                            onClick={handleRemoveImage}
                            disabled={isUploading}
                            className="flex-1 h-11 rounded-lg border-2 hover:bg-gray-50"
                          >
                            Change Image
                          </Button>
                          <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="flex-1 h-11 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            {isUploading ? (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Zap className="h-4 w-4 mr-2" />
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
                      <div className="relative aspect-square max-h-80 rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl">
                        <Image
                          src={image}
                          alt="Captured photo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        {isUploading && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-gray-600">
                              <span>Upload progress</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-teal-600 transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200"
                          >
                            {error}
                          </motion.div>
                        )}
                        
                        <div className="flex gap-3 sticky bottom-0 bg-white/95 backdrop-blur-sm p-2 -mx-2 rounded-lg">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setImage(null);
                              setFile(null);
                              setOriginalImage(null);
                              setError(null);
                            }}
                            disabled={isUploading}
                            className="flex-1 h-11 rounded-lg border-2 hover:bg-gray-50"
                          >
                            Retake Photo
                          </Button>
                          <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="flex-1 h-11 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            {isUploading ? (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Zap className="h-4 w-4 mr-2" />
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
  );
} 