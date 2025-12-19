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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-emerald-400/30 bg-[#020617]/98 p-6 shadow-2xl overflow-hidden">
        {showSuccess ? (
          <div className="flex items-center justify-center py-12">
            <img
              src="https://i.ibb.co/GjTWf09/image-removebg-preview-6.png"
              alt="Success"
              className="animate-pulse max-w-[100px] h-auto"
              style={{ animation: "pulse 1.5s ease-in-out infinite" }}
            />
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

