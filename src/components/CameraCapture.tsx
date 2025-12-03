"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button2";
import Image from "next/image";

interface CameraCaptureProps {
  onCapture: (imageData: string, file: File) => void;
  onError?: (error: string) => void;
}

export default function CameraCapture({
  onCapture,
  onError,
}: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);
  
  // Handle camera errors
  const handleCameraError = useCallback((err: string | Error | unknown) => {
    console.error("Camera error:", err);
    let errorMessage = "Could not access camera. Please check permissions.";
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === "string") {
      errorMessage = err;
    }
    
    setError(errorMessage);
    if (onError) onError(errorMessage);
  }, [onError]);
  
  // Handle camera success
  const handleCameraStart = useCallback(() => {
    setIsCameraReady(true);
    setError(null);
  }, []);
  
  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return;
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error("Failed to capture image");
      }
      
      setPhoto(imageSrc);
      
      // Convert base64 to file
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          onCapture(imageSrc, file);
        })
        .catch(err => {
          console.error("Error converting image:", err);
          setError("Failed to process captured image");
          if (onError) onError("Failed to process captured image");
        });
    } catch (err) {
      console.error("Error capturing photo:", err);
      setError("Failed to capture image");
      if (onError) onError("Failed to capture image");
    }
  }, [webcamRef, onCapture, onError]);
  
  // Switch camera between front and back
  const switchCamera = useCallback(() => {
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
    setIsCameraReady(false); // Reset camera ready state when switching
  }, []);
  
  // Flip camera (rotate)
  const flipCamera = useCallback(() => {
    // This would be implemented if we had access to device orientation
    // For now, we'll just use it as an alternative way to switch cameras
    switchCamera();
  }, [switchCamera]);
  
  // Retry camera access
  const retryCamera = useCallback(() => {
    setError(null);
    setIsCameraReady(false);
    // The Webcam component will automatically try to reconnect
  }, []);

  // Request camera access explicitly
  const requestCameraAccess = useCallback(async () => {
    try {
      // Use the same constraints as the Webcam component
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: facingMode }
        }
      });
      
      // Stop the stream immediately as Webcam component will request it again
      stream.getTracks().forEach(track => {
        track.stop();
      });
      
      // Reset component state to trigger webcam reinitialize
      setError(null);
      setIsCameraReady(false);
      
      // Force a browser permission prompt by removing all stored permissions
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'denied') {
          // If permission is denied, we need to tell the user to change browser settings
          setError("Camera access denied. Please enable camera access in your browser settings.");
          return;
        }
      }
    } catch (err) {
      console.error("Failed to request camera access:", err);
      handleCameraError("Please allow camera access when prompted by your browser.");
    }
  }, [facingMode, handleCameraError]);
  
  // Retake photo
  const retakePhoto = useCallback(() => {
    setPhoto(null);
  }, []);
  
  // Video constraints for the webcam
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {!photo ? (
        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {!isCameraReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Accessing camera...</p>
                </div>
              </div>
            )}
            
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={handleCameraStart}
              onUserMediaError={handleCameraError}
              mirrored={facingMode === "user"}
              className="w-full h-full object-cover"
              style={{ display: isCameraReady ? "block" : "none" }}
            />
          </div>
          
          {error ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-red-500 mb-2">{error}</p>
              <div className="flex justify-center gap-2">
                <Button
                  onClick={retryCamera}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  Try Again
                </Button>
                <Button
                  onClick={requestCameraAccess}
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-50"
                >
                  Request Access
                </Button>
              </div>
            </div>
          ) : isCameraReady ? (
            <div className="flex justify-center items-center gap-6">
              {/* Camera flip button (left) */}
              <Button
                onClick={flipCamera}
                className="bg-white/90 text-gray-800 hover:bg-white rounded-full h-12 w-12 flex items-center justify-center shadow-lg"
                aria-label="Flip camera"
              >
                <RefreshCw className="h-6 w-6" />
              </Button>
              
              {/* Capture button (center) */}
              <Button
                onClick={capturePhoto}
                className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white rounded-full h-20 w-20 flex items-center justify-center shadow-xl"
                aria-label="Take photo"
              >
                <div className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-white/20"></div>
                </div>
              </Button>
              
              {/* Front/back camera toggle (right) */}
              <Button
                onClick={switchCamera}
                className="bg-white/90 text-gray-800 hover:bg-white rounded-full h-12 w-12 flex items-center justify-center shadow-lg"
                aria-label={`Switch to ${facingMode === "user" ? "back" : "front"} camera`}
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={photo}
              alt="Captured photo"
              fill
              className="object-cover"
            />
          </div>
          
          <Button
            onClick={retakePhoto}
            variant="outline"
            className="w-full"
          >
            Retake Photo
          </Button>
        </div>
      )}
    </div>
  );
} 