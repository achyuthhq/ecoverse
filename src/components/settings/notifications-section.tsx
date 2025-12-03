"use client";

import React, { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button2";
import { Switch } from "@/components/ui/switch2";
import { Label } from "@/components/ui/label2";
import { useToast } from "@/components/ui/use-toast";

export default function NotificationsSection() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState({
    newAnalysis: true,
    weeklyReport: true,
    tips: false,
    marketing: false,
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    newAnalysis: true,
    weeklyReport: false,
    tips: true,
    marketing: false,
  });
  
  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your notification settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
        
        {/* Email Notifications */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-100">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
          </div>
          
          <div className="space-y-4 pl-12">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-new-analysis" className="text-base font-normal">New Analysis Results</Label>
                <p className="text-sm text-gray-500">Receive an email when your analysis is complete</p>
              </div>
              <Switch 
                id="email-new-analysis" 
                checked={emailNotifications.newAnalysis}
                onCheckedChange={(checked) => setEmailNotifications({...emailNotifications, newAnalysis: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-weekly-report" className="text-base font-normal">Weekly Report</Label>
                <p className="text-sm text-gray-500">Get a summary of your activity each week</p>
              </div>
              <Switch 
                id="email-weekly-report" 
                checked={emailNotifications.weeklyReport}
                onCheckedChange={(checked) => setEmailNotifications({...emailNotifications, weeklyReport: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-tips" className="text-base font-normal">Eco Tips & Guides</Label>
                <p className="text-sm text-gray-500">Helpful sustainability tips and guides</p>
              </div>
              <Switch 
                id="email-tips" 
                checked={emailNotifications.tips}
                onCheckedChange={(checked) => setEmailNotifications({...emailNotifications, tips: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-marketing" className="text-base font-normal">Marketing & Promotions</Label>
                <p className="text-sm text-gray-500">Updates about new features and special offers</p>
              </div>
              <Switch 
                id="email-marketing" 
                checked={emailNotifications.marketing}
                onCheckedChange={(checked) => setEmailNotifications({...emailNotifications, marketing: checked})}
              />
            </div>
          </div>
        </div>
        
        {/* Push Notifications */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-purple-100">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
          </div>
          
          <div className="space-y-4 pl-12">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-new-analysis" className="text-base font-normal">New Analysis Results</Label>
                <p className="text-sm text-gray-500">Receive a notification when your analysis is complete</p>
              </div>
              <Switch 
                id="push-new-analysis" 
                checked={pushNotifications.newAnalysis}
                onCheckedChange={(checked) => setPushNotifications({...pushNotifications, newAnalysis: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-weekly-report" className="text-base font-normal">Weekly Report</Label>
                <p className="text-sm text-gray-500">Get a summary of your activity each week</p>
              </div>
              <Switch 
                id="push-weekly-report" 
                checked={pushNotifications.weeklyReport}
                onCheckedChange={(checked) => setPushNotifications({...pushNotifications, weeklyReport: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-tips" className="text-base font-normal">Eco Tips & Guides</Label>
                <p className="text-sm text-gray-500">Helpful sustainability tips and guides</p>
              </div>
              <Switch 
                id="push-tips" 
                checked={pushNotifications.tips}
                onCheckedChange={(checked) => setPushNotifications({...pushNotifications, tips: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-marketing" className="text-base font-normal">Marketing & Promotions</Label>
                <p className="text-sm text-gray-500">Updates about new features and special offers</p>
              </div>
              <Switch 
                id="push-marketing" 
                checked={pushNotifications.marketing}
                onCheckedChange={(checked) => setPushNotifications({...pushNotifications, marketing: checked})}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <Button 
            onClick={handleSaveNotifications} 
            disabled={isSaving}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
} 