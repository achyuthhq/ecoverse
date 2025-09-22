"use client";

import { useState } from "react";
import { Share2, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ShareButtonProps {
  analysisId: string;
  label: string;
  diyIdea?: string;
}

export default function ShareButton({ analysisId, label, diyIdea }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    setIsSharing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/share-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: analysisId,
          diyIdea: diyIdea
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to share analysis');
      }

      setIsShared(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsShared(false);
      }, 2000);
    } catch (error) {
      console.error('Error sharing analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to share analysis');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Share</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            Share to Gallery
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Share your analysis with the Ecoverse community
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-gray-900 mb-2">What will be shared:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Your analysis image</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>DIY idea recommendation as title</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-700 rounded-full"></div>
                <span>Complete step-by-step DIY guide</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                <span>Your username and sharing time</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isShared && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Successfully shared to gallery!</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleShare}
              disabled={isSharing || isShared}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              {isSharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sharing...
                </>
              ) : isShared ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Shared!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share to Gallery
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSharing}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 