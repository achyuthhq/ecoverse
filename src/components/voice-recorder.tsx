"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button2";
import { useToast } from "@/components/ui/use-toast";

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  className?: string;
  debug?: boolean;
}

export default function VoiceRecorder({ onTranscriptionComplete, className = "", debug = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setHasError(false);
      
      // Reset state
      audioChunksRef.current = [];
      setRecordingTime(0);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder with appropriate mime type
      let mimeType = 'audio/webm';
      
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }
      
      console.log(`Using mime type: ${mimeType}`);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`Received audio chunk: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Process the recording
        if (audioChunksRef.current.length > 0) {
          setIsProcessing(true);
          
          try {
            console.log(`Processing ${audioChunksRef.current.length} audio chunks`);
            
            // Create audio blob with the correct mime type
            const blob = new Blob(audioChunksRef.current, { type: mimeType });
            console.log(`Created audio blob: ${blob.size} bytes`);
            
            // Process the recording using our API endpoint
            const transcription = await processVoiceRecording(blob);
            console.log(`Received transcription: ${transcription}`);
            
            onTranscriptionComplete(transcription);
          } catch (error) {
            console.error("Error processing voice recording:", error);
            setHasError(true);
            toast({
              title: "Voice Recognition Error",
              description: "Failed to process your voice. Please try again.",
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        } else {
          console.warn("No audio data collected");
          setHasError(true);
          toast({
            title: "Recording Error",
            description: "No audio was captured. Please try again.",
            variant: "destructive",
          });
        }
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      setHasError(true);
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to use voice recognition.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("Stopping recording");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Function to send audio to our API endpoint
  const processVoiceRecording = async (audioBlob: Blob): Promise<string> => {
    console.log("Sending audio to API");
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    const response = await fetch('/api/voice', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error:", errorData);
      throw new Error(errorData.error || 'Failed to process voice recording');
    }
    
    const data = await response.json();
    return data.text;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full animate-pulse">
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-red-600 font-medium">{formatTime(recordingTime)}</span>
          </div>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="h-9 w-9 rounded-full"
            onClick={stopRecording}
            disabled={isProcessing}
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button
          type="button"
          size="icon"
          variant={hasError ? "destructive" : "outline"}
          className={`h-9 w-9 rounded-full ${hasError ? '' : 'border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'}`}
          onClick={startRecording}
          disabled={isProcessing}
          title="Record your voice"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasError ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
} 