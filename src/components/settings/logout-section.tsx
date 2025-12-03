"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button2";
import { LogOut, AlertTriangle, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LogoutSection() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="space-y-8">
      <Card className="glass-card p-6 border border-white/10 shadow-lg rounded-xl overflow-hidden backdrop-blur-xl bg-[#0c0c0c]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-red-500/20 border border-red-500/30">
            <LogOut className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Account</h3>
        </div>
        
        <div className="space-y-6">
          <div className="glass-card p-4 rounded-lg border border-red-500/30 bg-red-500/10 backdrop-blur-md">
            <h4 className="text-lg font-medium text-red-300 mb-2">Log out of your account</h4>
            <p className="text-red-200/80 text-sm mb-4">
              You will be signed out of your account on this device and will need to sign in again to access your data.
            </p>
            <Button 
              variant="destructive"
              onClick={() => setShowConfirmDialog(true)}
              className="bg-white text-[#0c0c0c] hover:bg-gray-100 px-6 py-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Log out of Ecoverse?</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account on this device and will need to sign in again to access your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-white text-[#0c0c0c] hover:bg-gray-100 font-medium"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Logging out...</span>
                </>
              ) : (
                "Log out"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 