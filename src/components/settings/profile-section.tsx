"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import FormData from "form-data";

import { Button } from "@/components/ui/button2";
import { Input } from "@/components/ui/input2";
import { Label } from "@/components/ui/label2";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Camera, Circle, Square, Triangle, Lock, Eye, EyeOff } from "lucide-react";
import ProfilePicture from "@/components/ui/profile-picture";

// ImgBB API key
const IMGBB_API_KEY = "0614a461e2fe444df055e2f533490158";

interface User {
  id: string;
  // Name can be null or undefined depending on auth provider
  name?: string | null;
  // Email can be null or undefined; we handle fallback in the UI
  email?: string | null;
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
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();

  // Check if user has a password (for OAuth users)
  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const response = await fetch("/api/user/password/status");
        if (response.ok) {
          const data = await response.json();
          setHasPassword(data.hasPassword);
        }
      } catch (error) {
        console.error("Error checking password status:", error);
      }
    };
    checkPasswordStatus();
  }, []);

  // Handle password change
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Password change failed",
        description: error.message || "There was a problem changing your password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

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
      <div className="glass-card p-6 rounded-xl shadow-lg border border-white/10 backdrop-blur-xl bg-[#0c0c0c]">
        <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
        
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
                fallback={
                  user.name 
                    ? user.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                    : user.email
                    ? user.email[0].toUpperCase()
                    : "👤"
                }
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
              <p className="text-sm text-gray-300 font-medium text-center">Profile Shape</p>
              <div className="flex gap-2">
                {shapeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setProfileShape(option.value)}
                      className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        profileShape === option.value
                          ? "border-emerald-400 bg-[#191919] text-emerald-400"
                          : "border-white/10 bg-[#111111] text-gray-400 hover:border-white/20"
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
              <p className="text-sm text-gray-300 font-medium">
                Upload a profile picture
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max 32MB • JPG, PNG, GIF
              </p>
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="bg-[#111111] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email Address</Label>
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="bg-[#0a0a0a] border-white/5 text-gray-400 cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isSaving}
                className="bg-white text-[#0c0c0c] hover:bg-gray-100 rounded-lg px-6 py-2 transition-all font-medium"
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

      {/* Password Change Section */}
      {hasPassword !== null && (
        <div className="glass-card p-6 rounded-xl shadow-lg border border-white/10 backdrop-blur-xl bg-[#0c0c0c]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Lock className="h-5 w-5 text-gray-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Change Password</h2>
              <p className="text-sm text-gray-400">
                {hasPassword 
                  ? "Update your password to keep your account secure" 
                  : "Set a password for your account to enable password-based login"}
              </p>
            </div>
          </div>

          {hasPassword ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="bg-[#111111] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password (min 8 characters)"
                    className="bg-[#111111] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="bg-[#111111] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="bg-white text-[#0c0c0c] hover:bg-gray-100 rounded-lg px-6 py-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-sm text-yellow-300">
                You signed in with Google OAuth. To enable password-based login, please contact support or sign out and create a new account with email/password.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 