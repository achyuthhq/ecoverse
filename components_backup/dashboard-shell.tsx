"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus,
  Home, 
  Settings, 
  Search,
  Trophy,
  MapPin,
  Info,
  X,
  Upload,
  Camera,
  Loader2,
  RefreshCw,
  Check,
  MoreHorizontal,
  MessageCircle,
  Bell,
  Menu,
  PlusCircle,
  ChevronDown,
  User,
  LogOut,
  Leaf,
  MessageSquare,
  BarChart2,
  Heart,
  Trash2,
  Zap,
  Gamepad2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSession } from "next-auth/react";
import UploadModal from "@/components/upload-modal";

interface DashboardShellProps {
  children: React.ReactNode;
}

const DashboardShell = ({ children }: DashboardShellProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Reorganize navigation items - 2 on each side of the center button
  const leftNavItems = [
    {
      href: "/dashboard",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/dashboard/search",
      label: "Search",
      icon: <Search className="h-5 w-5" />,
    },
  ];

  const rightNavItems = [
    {
      href: "/dashboard/leaderboard",
      label: "Board",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  // Additional items for the "more" menu
  const moreNavItems = [
    {
      href: "/dashboard/aichat",
      label: "AI Chat",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      href: "/dashboard/game",
      label: "Game",
      icon: <Gamepad2 className="h-5 w-5" />,
    },
    {
      href: "/dashboard/events",
      label: "Events",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      href: "/dashboard/about",
      label: "About",
      icon: <Info className="h-5 w-5" />,
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.type.includes("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB.");
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

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    // Check file type
    if (!droppedFile.type.includes("image/")) {
      setError("Please drop an image file.");
      return;
    }

    // Check file size (max 5MB)
    if (droppedFile.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB.");
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
  };

  const handleRemoveImage = () => {
    setImage(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setIsCameraReady(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a File from the blob
          const capturedFile = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setFile(capturedFile);
          
          // Create data URL for preview
          const imageUrl = canvas.toDataURL('image/jpeg');
          setImage(imageUrl);
          
          // Stop the camera stream
          stopCamera();
          
          // Show a message that we're preparing the analysis
          setError(null);
          
          // Automatically start analysis after a short delay to allow UI to update
          setTimeout(() => {
            handleUpload();
          }, 500);
        }
      }, 'image/jpeg', 0.9);
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
      setUploadSuccess(true);
      
      // Reset after showing success message and redirect to analysis page
      setTimeout(() => {
        // Redirect to the analysis page
        if (data && data.id) {
          window.location.href = `/analysis/${data.id}`;
        }
        
        // Close modal and reset state after navigation has started
        setTimeout(() => {
          setIsUploadModalOpen(false);
          resetState();
        }, 500);
      }, 1000);
      
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Failed to upload image: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      clearInterval(interval);
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setImage(null);
    setFile(null);
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setActiveTab('upload');
    setIsCameraActive(false);
    setIsCameraReady(false);
    setUploadSuccess(false);
    stopCamera();
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
  };

  const switchToTab = (tab: 'upload' | 'camera') => {
    if (tab === 'camera' && !isCameraActive) {
      startCamera();
    } else if (tab === 'upload' && isCameraActive) {
      stopCamera();
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <motion.div 
          className="flex-1 p-6 md:p-10 pt-8 pb-32 overflow-y-auto bg-gray-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </motion.div>
        
        {/* Fixed bottom navigation bar */}
        <div className="fixed bottom-2 left-3 right-3 bg-white rounded-2xl shadow-lg max-w-[270px] mx-auto">
          <div className="relative">
            {/* Upload Button - Floating above nav */}
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg"
              >
                <Plus className="h-8 w-8" />
              </motion.div>
            </button>
            
            {/* Navigation Items Container */}
            <div className="flex justify-between items-center py-2 px-2">
              {/* Left Side Navigation - Always visible */}
              <div className="flex gap-2.5 justify-end" style={{ width: "calc(50% - 32px)" }}>
                {leftNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className="flex flex-col items-center gap-1">
                        <div className={`p-1.5 rounded-xl transition-colors ${
                          isActive
                            ? "text-green-600"
                            : "text-gray-400 hover:text-green-600"
                        }`}>
                          {item.icon}
                        </div>
                        <span className={`text-[10px] ${
                          isActive ? "text-green-600 font-medium" : "text-gray-400"
                        }`}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {/* Center Space for Plus Button */}
              <div className="w-[64px]"></div>
              
              {/* Right Side Navigation */}
              <div className="flex gap-2.5 justify-start" style={{ width: "calc(50% - 32px)" }}>
                {/* First right nav item always visible */}
                <Link href={rightNavItems[0].href}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`p-1.5 rounded-xl transition-colors ${
                      pathname === rightNavItems[0].href
                        ? "text-green-600"
                        : "text-gray-400 hover:text-green-600"
                    }`}>
                      {rightNavItems[0].icon}
                    </div>
                    <span className={`text-[10px] ${
                      pathname === rightNavItems[0].href ? "text-green-600 font-medium" : "text-gray-400"
                    }`}>
                      {rightNavItems[0].label}
                    </span>
                  </div>
                </Link>
                
                {/* More options button */}
                <div>
                  <div 
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                  >
                    <div className={`p-1.5 rounded-xl transition-colors ${
                      showMoreOptions ? "text-green-600" : "text-gray-400 hover:text-green-600"
                    }`}>
                      <MoreHorizontal className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] ${
                      showMoreOptions ? "text-green-600 font-medium" : "text-gray-400"
                    }`}>
                      More
                    </span>
                  </div>
                  
                  {/* Dropdown menu for more options */}
                  {showMoreOptions && (
                    <div className="absolute right-0 bottom-16 bg-white rounded-xl shadow-lg p-2 border border-gray-100 min-w-[140px]">
                      {[...rightNavItems.slice(1), ...moreNavItems].map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.href} href={item.href}>
                            <div className={`flex items-center gap-2 p-2 rounded-lg ${
                              isActive ? "bg-green-50 text-green-600" : "hover:bg-gray-50"
                            }`}>
                              {item.icon}
                              <span className="text-sm">{item.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>
      </div>

      {/* Upload Modal */}
      <UploadModal isOpen={isUploadModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default DashboardShell;