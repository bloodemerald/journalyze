
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TradingViewChart } from './TradingViewChart';
import { toast } from 'sonner';

interface UploadAreaProps {
  onImageUpload: (file: File) => void;
  symbol?: string;
  className?: string;
}

export function UploadArea({ onImageUpload, symbol = 'BINANCE:BTCUSDT', className }: UploadAreaProps) {
  const [chartMode, setChartMode] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Only process image files
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
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

  const captureChart = async () => {
    if (!containerRef.current || !chartReady) {
      toast.error("Chart is not fully loaded yet");
      return;
    }

    try {
      toast.info("Capturing chart...");
      
      // Use html2canvas to capture the chart
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(containerRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#001B29',
        scale: 2, // Higher resolution
      });
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to capture chart");
          return;
        }
        
        // Convert blob to file
        const file = new File([blob], `${symbol.replace(':', '_')}_chart.png`, { type: 'image/png' });
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPreview(e.target.result as string);
            toast.success("Chart captured successfully");
          }
        };
        reader.readAsDataURL(file);
        
        // Pass file to parent
        onImageUpload(file);
      }, 'image/png', 0.9);
    } catch (error) {
      console.error('Error capturing chart:', error);
      toast.error("Failed to capture chart");
    }
  };

  const toggleMode = () => {
    setChartMode(!chartMode);
    setPreview(null);
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
      
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">
          {chartMode ? 'TradingView Chart' : 'Upload Chart Image'}
        </h3>
        <button 
          onClick={toggleMode}
          className="flex items-center text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeftRight size={14} className="mr-1" />
          Switch to {chartMode ? 'Upload' : 'TradingView'}
        </button>
      </div>
      
      <div
        className={cn(
          "border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden",
          "border-muted hover:border-muted-foreground/50",
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
              className="absolute top-2 right-2 bg-secondary rounded-full p-1 shadow-sm hover:bg-secondary/80 transition-colors"
            >
              <X size={16} className="text-primary" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-secondary/70 backdrop-blur-sm p-2 text-center text-sm font-medium">
              {chartMode ? 'Click to capture new chart' : 'Click to upload different image'}
            </div>
          </>
        ) : chartMode ? (
          <div ref={containerRef} className="w-full h-full relative">
            <TradingViewChart 
              symbol={symbol || 'BINANCE:BTCUSDT'} 
              onChartReady={() => setChartReady(true)}
            />
            <div className="absolute bottom-4 right-4 z-10">
              <button
                onClick={captureChart}
                disabled={!chartReady}
                className="flex items-center justify-center bg-primary text-white p-2 rounded-full shadow-tron-sm hover:shadow-tron hover:bg-primary/90 transition-all duration-300"
                title="Capture Chart"
              >
                <Camera size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div onClick={triggerFileInput} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Camera size={24} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium mb-1">Drop your trading chart here</p>
            <p className="text-sm text-muted-foreground/70">or click to browse files</p>
            <p className="mt-4 text-xs text-muted-foreground/60 max-w-xs text-center">
              Supported formats: PNG, JPG, JPEG, GIF
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
