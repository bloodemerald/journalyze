
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
  onImageUpload: (file: File) => void;
  className?: string;
}

export function UploadArea({ onImageUpload, className }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Only process image files
    if (!file.type.match('image.*')) {
      alert('Please upload an image file');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    // Pass file to parent
    onImageUpload(file);
  };

  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      <div
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-muted hover:border-muted-foreground/50 hover:bg-muted/30",
          className
        )}
      >
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-contain p-4"
            />
            <button 
              onClick={clearPreview}
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow-sm hover:bg-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-2 text-center text-sm font-medium">
              Click to change image
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Upload size={24} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium mb-1">Drop your trading chart here</p>
            <p className="text-sm text-muted-foreground/70">or click to browse files</p>
            <p className="mt-4 text-xs text-muted-foreground/60 max-w-xs text-center">
              Supported formats: PNG, JPG, JPEG, GIF
            </p>
          </>
        )}
      </div>
    </div>
  );
}
