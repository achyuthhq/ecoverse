"use client";

import { useState } from "react";
import { Share2, Copy, CheckCircle, Download, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { generateAnalysisPDF } from "@/lib/pdf-generator";

interface ShareAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  analysisLabel?: string;
}

export default function ShareAnalysisModal({
  isOpen,
  onClose,
  analysisId,
  analysisLabel,
}: ShareAnalysisModalProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();
  
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/analysis/public/${analysisId}`
    : '';

  const handleCopyLink = async () => {
    console.log("[SHARE] Copy link button clicked");
    console.log("[SHARE] Share URL:", shareUrl);
    try {
      await navigator.clipboard.writeText(shareUrl);
      console.log("[SHARE] Link successfully copied to clipboard");
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("[SHARE] Failed to copy link:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    console.log("[SHARE] Share to apps button clicked");
    console.log("[SHARE] Analysis ID:", analysisId);
    console.log("[SHARE] Analysis Label:", analysisLabel);
    if (navigator.share) {
      try {
        console.log("[SHARE] Using Web Share API");
        await navigator.share({
          title: `Ecoverse Analysis: ${analysisLabel || 'Waste Analysis'}`,
          text: `Check out this environmental analysis: ${analysisLabel || 'Waste Analysis'}`,
          url: shareUrl,
        });
        console.log("[SHARE] Successfully shared via Web Share API");
      } catch (error) {
        // User cancelled or error occurred
        console.error("[SHARE] Error sharing via Web Share API:", error);
      }
    } else {
      console.log("[SHARE] Web Share API not available, falling back to copy link");
      // Fallback to copy if Web Share API is not available
      handleCopyLink();
    }
  };

  const handleDownloadPDF = async () => {
    console.log("[DOWNLOAD] Download PDF button clicked");
    console.log("[DOWNLOAD] Analysis ID:", analysisId);
    setIsGeneratingPDF(true);
    try {
      console.log("[DOWNLOAD] Requesting analysis data from:", `/api/analysis/${analysisId}/public`);
      // Fetch analysis data from public endpoint
      const response = await fetch(`/api/analysis/${analysisId}/public`);
      if (!response.ok) {
        console.error("[DOWNLOAD] Failed to fetch analysis data, status:", response.status);
        throw new Error('Failed to fetch analysis data');
      }
      
      console.log("[DOWNLOAD] Analysis data fetched successfully");
      const analysis = await response.json();
      console.log("[DOWNLOAD] Parsing analysis data for PDF generation");
      
      // Parse JSON fields
      const environmentalImpact = typeof analysis.environmentalImpact === 'string' 
        ? JSON.parse(analysis.environmentalImpact || '[]') 
        : (Array.isArray(analysis.environmentalImpact) ? analysis.environmentalImpact : []);
      
      const harms = typeof analysis.harms === 'string' 
        ? JSON.parse(analysis.harms || '[]') 
        : (Array.isArray(analysis.harms) ? analysis.harms : []);
      
      const disposal = typeof analysis.disposal === 'string' 
        ? JSON.parse(analysis.disposal || '[]') 
        : (Array.isArray(analysis.disposal) ? analysis.disposal : []);
      
      const alternatives = typeof analysis.alternatives === 'string' 
        ? JSON.parse(analysis.alternatives || '[]') 
        : (Array.isArray(analysis.alternatives) ? analysis.alternatives : []);
      
      const recommendations = typeof analysis.recommendations === 'string' 
        ? JSON.parse(analysis.recommendations || '{}') 
        : (analysis.recommendations || {});

      // Generate PDF
      console.log("[DOWNLOAD] Starting PDF generation...");
      await generateAnalysisPDF({
        label: analysis.label,
        type: analysis.type,
        category: analysis.category,
        degradability: analysis.degradability,
        imageUrl: analysis.imageUrl,
        environmentalImpact,
        harms,
        disposal,
        alternatives,
        recommendations,
        potentialForReuse: analysis.potentialForReuse,
        createdAt: analysis.createdAt,
        user: analysis.user,
      });
      console.log("[DOWNLOAD] PDF generated successfully");

      toast({
        title: "PDF downloaded!",
        description: "Your analysis report has been downloaded.",
      });
    } catch (error) {
      console.error("[DOWNLOAD] Error generating PDF:", error);
      toast({
        title: "Failed to generate PDF",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
      console.log("[DOWNLOAD] PDF generation process completed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white text-center">
            Share Analysis
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Share Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <Button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleShare}
              className="w-full bg-white text-gray-900 hover:bg-gray-100 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share to Apps
            </Button>
            
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download as PDF
                </>
              )}
            </Button>
            
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white/5 text-white hover:bg-white/10 border border-white/10 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Public View
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

