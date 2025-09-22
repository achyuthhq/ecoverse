"use client";

import React, { useState } from "react";
import { Shield, Lock, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PrivacySection() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    shareAnalytics: true,
    showProfilePublicly: true,
    saveSearchHistory: true,
    allowPersonalization: true,
  });
  
  const handleSavePrivacy = async () => {
    try {
      setIsSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved",
      });
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your privacy settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDataExport = () => {
    toast({
      title: "Data export requested",
      description: "We'll email you when your data is ready to download",
    });
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Data</h2>
        
        {/* Privacy Settings */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-green-100">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
          </div>
          
          <div className="space-y-4 pl-12">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="share-analytics" className="text-base font-normal">Share Analytics</Label>
                <p className="text-sm text-gray-500">Help us improve by sharing anonymous usage data</p>
              </div>
              <Switch 
                id="share-analytics" 
                checked={privacySettings.shareAnalytics}
                onCheckedChange={(checked) => setPrivacySettings({...privacySettings, shareAnalytics: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public-profile" className="text-base font-normal">Public Profile</Label>
                <p className="text-sm text-gray-500">Allow others to see your profile and activity</p>
              </div>
              <Switch 
                id="public-profile" 
                checked={privacySettings.showProfilePublicly}
                onCheckedChange={(checked) => setPrivacySettings({...privacySettings, showProfilePublicly: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="save-history" className="text-base font-normal">Save Search History</Label>
                <p className="text-sm text-gray-500">Store your search history for better recommendations</p>
              </div>
              <Switch 
                id="save-history" 
                checked={privacySettings.saveSearchHistory}
                onCheckedChange={(checked) => setPrivacySettings({...privacySettings, saveSearchHistory: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="personalization" className="text-base font-normal">Personalization</Label>
                <p className="text-sm text-gray-500">Allow personalized content and recommendations</p>
              </div>
              <Switch 
                id="personalization" 
                checked={privacySettings.allowPersonalization}
                onCheckedChange={(checked) => setPrivacySettings({...privacySettings, allowPersonalization: checked})}
              />
            </div>
          </div>
        </div>
        
        {/* Data Management */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-100">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
          </div>
          
          <div className="space-y-4 pl-12">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-1">Export Your Data</h4>
              <p className="text-sm text-gray-500 mb-3">
                Download a copy of all your data, including analyses, settings, and profile information.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDataExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Request Data Export
              </Button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-base font-medium text-gray-900 mb-1">Delete Account</h4>
              <p className="text-sm text-gray-500 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => {
                        toast({
                          title: "Account deletion requested",
                          description: "Your account will be deleted within 24 hours",
                        });
                      }}
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <Button 
            onClick={handleSavePrivacy} 
            disabled={isSaving}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
          >
            {isSaving ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
} 