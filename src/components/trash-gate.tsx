"use client";

import { useEffect, useState, useRef } from "react";

export default function TrashGate() {
  const [showGate, setShowGate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShowGate(true);

    // Listen for unlock message from the game
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "ecoverse-unlock") {
        setShowSuccess(true);
        // Close after showing success message
        setTimeout(() => {
          setShowGate(false);
        }, 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!showGate) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-2xl rounded-2xl p-6 overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, rgba(25, 25, 25, 0.85) 0%, rgba(12, 12, 12, 0.9) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <img
              src="https://i.ibb.co/GjTWf09/image-removebg-preview-6.png"
              alt="Success"
              className="max-w-[100px] h-auto"
              style={{ 
                animation: "fadeIn 0.5s ease-in forwards",
                opacity: 0
              }}
            />
            <div className="text-center space-y-2" style={{ 
              animation: "fadeIn 0.5s ease-in 0.2s forwards",
              opacity: 0
            }}>
              <h3 className="text-2xl font-bold text-white">
                Welcome to Ecoverse!
              </h3>
              <p className="text-sm text-gray-300 max-w-md">
                You've unlocked access. Start making a real impact on waste management.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                Recycle Sorter
              </p>
              <p className="mt-2 text-xs text-emerald-100/80">
                Sort 3 items correctly to unlock Ecoverse
              </p>
            </div>
            
            <div className="relative w-full" style={{ aspectRatio: "400/240" }}>
              <iframe
                ref={iframeRef}
                src="/game-code/index.html?mode=gate"
                className="w-full h-full border-0 rounded-lg"
                style={{ imageRendering: "pixelated" }}
                allow="fullscreen"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

