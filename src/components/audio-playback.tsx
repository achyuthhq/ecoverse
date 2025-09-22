"use client";

import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlaybackProps {
  audioBlob: Blob;
  className?: string;
}

export default function AudioPlayback({ audioBlob, className = '' }: AudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string>('');

  // Create audio URL when blob changes
  React.useEffect(() => {
    if (audioBlob) {
      // Clean up previous URL
      if (audioUrl.current) {
        URL.revokeObjectURL(audioUrl.current);
      }
      
      // Create new URL
      audioUrl.current = URL.createObjectURL(audioBlob);
      
      // Set the audio source
      if (audioRef.current) {
        audioRef.current.src = audioUrl.current;
      }
    }
    
    // Clean up on unmount
    return () => {
      if (audioUrl.current) {
        URL.revokeObjectURL(audioUrl.current);
      }
    };
  }, [audioBlob]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle audio events
  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <audio 
        ref={audioRef}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-8 w-8 rounded-full"
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Volume2 className="h-4 w-4 text-gray-400" />
    </div>
  );
} 