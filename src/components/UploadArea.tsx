
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Camera, X, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TradingViewChart } from './TradingViewChart';
import { toast } from 'sonner';

interface UploadAreaProps {
  onImageUpload: (file: File) => void;
  captureChart: () => void;
  symbol?: string;
  className?: string;
}

// Use forwardRef to properly handle the ref from parent component
export const UploadArea = forwardRef<{handleCaptureChart: () => Promise<void>}, UploadAreaProps>(({ 
  onImageUpload, 
  captureChart,
  symbol = 'BINANCE:BTCUSDT', 
  className 
}, ref) => {
  const [chartMode, setChartMode] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Reset chart ready state when symbol changes
  useEffect(() => {
    setChartReady(false);
    setIsCaptured(false);
  }, [symbol]);

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
        setIsCaptured(true);
      }
    };
    reader.readAsDataURL(file);
    
    // Pass file to parent
    onImageUpload(file);
  };

  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setIsCaptured(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCaptureChart = async () => {
    if (!containerRef.current) {
      toast.error("Chart container not found");
      return;
    }

    try {
      console.log("Starting chart capture process");
      toast.info("Capturing chart...");
      
      // Delay capture slightly to ensure chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use html2canvas to capture the chart
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartContainerRef.current || containerRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#001B29',
        scale: 2, // Higher resolution
        logging: true,
      });
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to capture chart");
          return;
        }
        
        console.log("Chart captured successfully, converting to file");
        
        // Convert blob to file
        const fileName = `${symbol?.replace(':', '_') || 'chart'}_${new Date().getTime()}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPreview(e.target.result as string);
            setIsCaptured(true);
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
  
  // Expose the captureChart method through the ref using useImperativeHandle
  useImperativeHandle(ref, () => ({
    handleCaptureChart
  }));

  const toggleMode = () => {
    setChartMode(!chartMode);
    setPreview(null);
    setIsCaptured(false);
  };

  const handleChartReady = () => {
    console.log("Chart is ready in UploadArea component");
    setChartReady(true);
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
          "border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden",
          "border-muted hover:border-muted-foreground/50",
          className
        )}
        ref={containerRef}
      >
        {/* Show the preview overlay only when we have a preview */}
        {preview && (
          <div className="absolute inset-0 z-20 overflow-hidden">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-contain p-4"
            />
            <button 
              onClick={clearPreview}
              className="absolute top-2 right-2 bg-secondary rounded-full p-1 shadow-sm hover:bg-secondary/80 transition-colors z-30"
            >
              <X size={16} className="text-primary" />
            </button>
          </div>
        )}
        
        {/* Always show chart or upload UI, but with lower z-index */}
        <div className={cn("w-full h-full", isCaptured ? "opacity-0" : "opacity-100")}>
          {chartMode ? (
            <div ref={chartContainerRef} className="w-full h-full relative">
              <TradingViewChart 
                symbol={symbol || 'BINANCE:BTCUSDT'} 
                onChartReady={handleChartReady}
              />
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
        
        {/* Status indicator at bottom */}
        {isCaptured && (
          <div className="absolute bottom-0 left-0 right-0 bg-secondary/70 backdrop-blur-sm p-2 text-center text-sm font-medium z-30">
            Chart captured successfully
          </div>
        )}
      </div>
    </div>
  );
});

// Add display name for better debugging
UploadArea.displayName = 'UploadArea';
