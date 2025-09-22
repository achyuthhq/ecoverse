"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  imageSrc: string;
  onConfirm: (croppedImage: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onConfirm, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      setImageLoaded(true);
      
      // Set initial crop after container size is determined
      setTimeout(() => {
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;
          setContainerSize({ width: containerWidth, height: containerHeight });
          
          const scaleX = containerWidth / img.width;
          const scaleY = containerHeight / img.height;
          const scale = Math.min(scaleX, scaleY);
          
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          
          const cropSize = Math.min(scaledWidth, scaledHeight) * 0.8;
          const cropX = (scaledWidth - cropSize) / 2;
          const cropY = (scaledHeight - cropSize) / 2;
          
          setCrop({
            x: cropX,
            y: cropY,
            width: cropSize,
            height: cropSize
          });
        }
      }, 100);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Helper function to get touch or mouse coordinates
  const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
      };
    } else {
      return {
        clientX: e.clientX,
        clientY: e.clientY
      };
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!cropRef.current) return;
    
    const rect = cropRef.current.getBoundingClientRect();
    const coords = getEventCoordinates(e);
    const x = coords.clientX - rect.left;
    const y = coords.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x: x - crop.x, y: y - crop.y });
  };

  const handleResizeMouseDown = (e: React.MouseEvent | React.TouchEvent, direction: 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    const coords = getEventCoordinates(e);
    setDragStart({ x: coords.clientX, y: coords.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = containerRef.current.getBoundingClientRect();
      const coords = getEventCoordinates(e);
      const x = coords.clientX - rect.left - dragStart.x;
      const y = coords.clientY - rect.top - dragStart.y;
      
      // Constrain crop within image bounds
      const maxX = containerSize.width - crop.width;
      const maxY = containerSize.height - crop.height;
      
      setCrop(prev => ({
        ...prev,
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY))
      }));
    } else if (isResizing && resizeDirection) {
      e.preventDefault();
      e.stopPropagation();
      
      const coords = getEventCoordinates(e);
      const deltaX = coords.clientX - dragStart.x;
      const deltaY = coords.clientY - dragStart.y;
      
      setCrop(prev => {
        let newCrop = { ...prev };
        
        switch (resizeDirection) {
          case 'nw':
            newCrop.x = Math.max(0, Math.min(prev.x + deltaX, prev.x + prev.width - 50));
            newCrop.y = Math.max(0, Math.min(prev.y + deltaY, prev.y + prev.height - 50));
            newCrop.width = Math.max(50, prev.width - deltaX);
            newCrop.height = Math.max(50, prev.height - deltaY);
            break;
          case 'ne':
            newCrop.y = Math.max(0, Math.min(prev.y + deltaY, prev.y + prev.height - 50));
            newCrop.width = Math.max(50, prev.width + deltaX);
            newCrop.height = Math.max(50, prev.height - deltaY);
            break;
          case 'sw':
            newCrop.x = Math.max(0, Math.min(prev.x + deltaX, prev.x + prev.width - 50));
            newCrop.width = Math.max(50, prev.width - deltaX);
            newCrop.height = Math.max(50, prev.height + deltaY);
            break;
          case 'se':
            newCrop.width = Math.max(50, prev.width + deltaX);
            newCrop.height = Math.max(50, prev.height + deltaY);
            break;
        }
        
        // Constrain within container bounds
        newCrop.x = Math.max(0, Math.min(newCrop.x, containerSize.width - newCrop.width));
        newCrop.y = Math.max(0, Math.min(newCrop.y, containerSize.height - newCrop.height));
        
        return newCrop;
      });
      
      setDragStart({ x: coords.clientX, y: coords.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  const handleConfirm = () => {
    if (!imageRef.current || !containerRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate the actual crop coordinates on the original image
    const imageRect = imageRef.current.getBoundingClientRect();
    
    const scaleX = imageSize.width / imageRect.width;
    const scaleY = imageSize.height / imageRect.height;
    
    const actualCropX = crop.x * scaleX;
    const actualCropY = crop.y * scaleY;
    const actualCropWidth = crop.width * scaleX;
    const actualCropHeight = crop.height * scaleY;
    
    canvas.width = actualCropWidth;
    canvas.height = actualCropHeight;
    
    ctx.drawImage(
      imageRef.current,
      actualCropX, actualCropY, actualCropWidth, actualCropHeight,
      0, 0, actualCropWidth, actualCropHeight
    );
    
    const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);
    onConfirm(croppedImageData);
  };

  const handleReset = () => {
    if (!containerRef.current) return;
    
    const scaleX = containerSize.width / imageSize.width;
    const scaleY = containerSize.height / imageSize.height;
    const scale = Math.min(scaleX, scaleY);
    
    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;
    
    const cropSize = Math.min(scaledWidth, scaledHeight) * 0.8;
    const cropX = (scaledWidth - cropSize) / 2;
    const cropY = (scaledHeight - cropSize) / 2;
    
    setCrop({
      x: cropX,
      y: cropY,
      width: cropSize,
      height: cropSize
    });
  };

  if (!imageLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-white rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Crop Image</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <RotateCcw className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>
      
      {/* Cropping Area */}
      <div className="p-4">
        <div
          ref={containerRef}
          className="relative mx-auto max-w-md max-h-96 overflow-hidden rounded-lg bg-gray-100"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{ touchAction: 'none' }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop preview"
            className="w-full h-full object-contain"
            draggable={false}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          />
          
          {/* Crop overlay */}
          <div
            ref={cropRef}
            className="absolute border-2 border-white shadow-lg cursor-move"
            style={{
              left: crop.x,
              top: crop.y,
              width: crop.width,
              height: crop.height,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            {/* Resize handles */}
            <div 
              className="absolute -top-2 -left-2 w-6 h-6 bg-white rounded-full cursor-nw-resize border-2 border-gray-300 hover:border-green-500 transition-colors touch-manipulation"
              onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
              onTouchStart={(e) => handleResizeMouseDown(e, 'nw')}
            />
            <div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full cursor-ne-resize border-2 border-gray-300 hover:border-green-500 transition-colors touch-manipulation"
              onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
              onTouchStart={(e) => handleResizeMouseDown(e, 'ne')}
            />
            <div 
              className="absolute -bottom-2 -left-2 w-6 h-6 bg-white rounded-full cursor-sw-resize border-2 border-gray-300 hover:border-green-500 transition-colors touch-manipulation"
              onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
              onTouchStart={(e) => handleResizeMouseDown(e, 'sw')}
            />
            <div 
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full cursor-se-resize border-2 border-gray-300 hover:border-green-500 transition-colors touch-manipulation"
              onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
              onTouchStart={(e) => handleResizeMouseDown(e, 'se')}
            />
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Touch and drag to move • Touch corners to resize
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 p-4 bg-gray-50">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-2 rounded-full border-gray-300 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        
        <Button
          onClick={handleConfirm}
          className="flex items-center gap-2 px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white"
        >
          <Check className="h-4 w-4" />
          Confirm
        </Button>
      </div>
    </motion.div>
  );
} 