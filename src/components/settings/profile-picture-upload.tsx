"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

// ImgBB API key
const IMGBB_API_KEY = "0614a461e2fe444df055e2f533490158";

interface ProfilePictureUploadProps {
  initialImage?: string | null;
  onUploadComplete?: (imageUrl: string) => void;
}

export default function ProfilePictureUpload({ 
  initialImage = null,
  onUploadComplete
}: ProfilePictureUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.type.includes("image/")) {
      setStatusMessage({ text: "Please select an image file", type: "error" });
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setStatusMessage({ text: "File size should be less than 5MB", type: "error" });
      return;
    }

    // Preview the image
    const reader = new FileReader();

    setIsUploading(true);
    setStatusMessage(null);
    
    try {
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;
        
        // Extract base64 data (remove the prefix if present)
        let base64Data = base64Image;
        if (base64Image.startsWith('data:image')) {
          base64Data = base64Image.split(',')[1];
        }
        
        // Create form data for ImgBB API
        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', base64Data);
        
        try {
          // Upload to ImgBB
          const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload", formData);
          
          if (!imgbbResponse.data || !imgbbResponse.data.data || !imgbbResponse.data.data.url) {
            throw new Error("Failed to upload image to ImgBB");
          }
          
          const imageUrl = imgbbResponse.data.data.url;
          setImage(imageUrl);
          
          // Call the callback with the image URL from ImgBB
          onUploadComplete?.(imageUrl);
          
          // Update profile in database through API
          const response = await fetch("/api/user/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: imageUrl,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update profile");
          }
          
          toast({
            title: "Profile picture updated",
            description: "Your profile picture has been saved successfully",
          });
          
      setStatusMessage({ text: "Profile picture updated", type: "success" });
        } catch (error) {
          console.error("Error uploading to ImgBB:", error);
          setStatusMessage({ text: "Failed to update profile picture", type: "error" });
          toast({
            title: "Upload failed",
            description: "There was a problem uploading your image",
            variant: "destructive",
          });
        }
      };
      
      reader.onerror = () => {
        setStatusMessage({ text: "Failed to read image file", type: "error" });
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setStatusMessage({ text: "Failed to update profile picture", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      {/* Profile picture container */}
      <div 
        className="relative w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-white shadow-lg cursor-pointer group"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {/* Profile image or placeholder */}
        {image ? (
          <Image
            src={image}
            alt="Profile"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
            <User className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Upload button overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Status message */}
      {statusMessage && (
        <div className={`mt-2 text-center text-sm ${
          statusMessage.type === 'error' ? 'text-red-500' : 'text-green-500'
        }`}>
          {statusMessage.text}
        </div>
      )}
    </div>
  );
} 