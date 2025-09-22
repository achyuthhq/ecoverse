"use client";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Gamepad2, Maximize2 } from "lucide-react";
import { useEffect } from "react";

import DashboardShell from "@/components/dashboard-shell";

export default function GamePage() {
  useEffect(() => {
    // Check authentication on client side
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        if (!session || !session.user) {
          window.location.href = '/auth/login';
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/auth/login';
      }
    };
    
    checkAuth();
  }, []);

  const handleFullscreen = () => {
    const iframe = document.querySelector('iframe[title="Recycling Game"]') as HTMLIFrameElement;
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen();
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen();
      }
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Gamepad2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
            Recycling Game
          </h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Test your recycling knowledge and learn about proper waste management through interactive gameplay.
          </p>
        </div>

        {/* Game Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Gamepad2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Interactive Recycling Challenge</h2>
                <p className="text-sm text-gray-600">Learn while you play and improve your eco-awareness</p>
              </div>
            </div>
          </div>
          
          {/* Iframe Container */}
          <div className="relative w-full aspect-video">
            <iframe
              src="https://cool-gnome-9f8e1b.netlify.app/"
              className="w-full h-full border-0"
              title="Recycling Game"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            
            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="absolute bottom-4 right-4 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              title="Fullscreen"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Game Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Start the Game</h4>
                <p className="text-sm text-gray-600 mt-1">Click on the game area to begin your recycling challenge</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sort Items</h4>
                <p className="text-sm text-gray-600 mt-1">Drag and drop items into the correct recycling bins</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Learn & Improve</h4>
                <p className="text-sm text-gray-600 mt-1">Discover proper recycling practices and improve your score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 