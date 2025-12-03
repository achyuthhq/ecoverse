"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import axios from "axios";
import FormData from "form-data";

import { Button } from "@/components/ui/button2";
import { Input } from "@/components/ui/input2";
import { Label } from "@/components/ui/label2";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Camera } from "lucide-react";

// ImgBB API key
const IMGBB_API_KEY = "0614a461e2fe444df055e2f533490158";

interface ProfileSectionProps {
  user: User;
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState<string | null>(user.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        // Extract base64 data (remove the prefix if present)
        let base64Data = base64Image;
        if (base64Image.startsWith('data:image')) {
          base64Data = base64Image.split(',')[1];
        }
        
        // Create form data for ImgBB API
        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', base64Data);
        
        // Upload to ImgBB
        const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload", formData, {
          headers: {
            ...formData.getHeaders?.() || {}
          }
        });
        
        if (!imgbbResponse.data || !imgbbResponse.data.data || !imgbbResponse.data.data.url) {
          throw new Error("Failed to upload image to ImgBB");
        }
        
        const imageUrl = imgbbResponse.data.data.url;
        setImage(imageUrl);
        
        toast({
          title: "Image uploaded",
          description: "Your profile picture has been uploaded",
        });
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({
          title: "Upload failed",
          description: "There was a problem reading your image file",
          variant: "destructive",
        });
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                {image ? (
                  <Image 
                    src={image} 
                    alt="Profile" 
                    width={128} 
                    height={128} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">👤</span>
                  </div>
                )}
              </div>
              
              <label 
                htmlFor="profile-upload" 
                className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-green-600 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Upload a profile picture (max 5MB)
            </p>
          </div>
          
          {/* Profile Details */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Email address cannot be changed
              </p>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isSaving}
                className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-blue-600 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 