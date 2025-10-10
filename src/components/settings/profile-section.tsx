"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import FormData from "form-data";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Camera, Circle, Square, Triangle } from "lucide-react";
import ProfilePicture from "@/components/ui/profile-picture";

// ImgBB API key
const IMGBB_API_KEY = "0614a461e2fe444df055e2f533490158";

interface User {
  id: string;
  name: string | null;
  image?: string | null;
  profileShape?: string;
}

interface ProfileSectionProps {
  user: User;
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState<string | null>(user.image || null);
  const [profileShape, setProfileShape] = useState((user as any).profileShape || "circle");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 32 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image smaller than 32MB",
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
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          name,
          image,
          profileShape,
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

  const shapeOptions = [
    { value: "circle", icon: Circle, label: "Circle" },
    { value: "square", icon: Square, label: "Square" },
    { value: "triangle", icon: Triangle, label: "Triangle" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <ProfilePicture
                src={image}
                alt="Profile"
                size="xl"
                shape={profileShape as "circle" | "square" | "triangle"}
                className="w-32 h-32"
              />
              
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
            
            {/* Shape Selector */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-medium text-center">Profile Shape</p>
              <div className="flex gap-2">
                {shapeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setProfileShape(option.value)}
                      className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        profileShape === option.value
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                      title={option.label}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">
                Upload a profile picture
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max 32MB • JPG, PNG, GIF
              </p>
            </div>
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
            
            
            <div className="pt-4">
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isSaving}
                className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-500 hover:to-green-600 text-white"
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