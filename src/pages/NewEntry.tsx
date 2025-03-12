
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { UploadArea } from '@/components/UploadArea';
import { TradeEntry } from '@/lib/types';
import { store } from '@/lib/store';
import { toast } from 'sonner';
import { analyzeChartWithGemini } from '@/lib/gemini';
import { NewEntryHeader } from '@/components/NewEntryHeader';
import { SymbolInput } from '@/components/SymbolInput';
import { AnalyzeButton } from '@/components/AnalyzeButton';
import { ApiErrorMessage } from '@/components/ApiErrorMessage';
import { TradeDetailsForm } from '@/components/TradeDetailsForm';
import { AnalysisSection } from '@/components/AnalysisSection';

const NewEntry = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [user, setUser] = useState(store.getUser());
  const [apiError, setApiError] = useState<string | null>(null);
  const [checklistComplete, setChecklistComplete] = useState(false);
  const [chartCaptured, setChartCaptured] = useState(false);
  
  const uploadAreaRef = useRef<{ handleCaptureChart: () => Promise<void> }>(null);
  
  const [form, setForm] = useState<Partial<TradeEntry>>({
    timestamp: Date.now(),
    symbol: 'BTC/USD',
    position: null,
    sentiment: null,
    chartImageUrl: '',
    aiAnalysis: {
      pattern: '',
      support: [],
      resistance: [],
      trend: '',
      technicalIndicators: []
    }
  });

  useEffect(() => {
    const currentUser = store.getUser();
    if (!currentUser.geminiApiKey) {
      store.updateUser({
        ...currentUser,
        geminiApiKey: 'AIzaSyBHjClGIarRwpPH06imDJ43eSGU2rTIC6E'
      });
      setUser({...currentUser, geminiApiKey: 'AIzaSyBHjClGIarRwpPH06imDJ43eSGU2rTIC6E'});
    }
  }, []);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setApiError(null);
    setChartCaptured(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          setImagePreview(dataUrl);
          setForm(prev => ({ ...prev, chartImageUrl: dataUrl }));
          
          toast.success("Chart captured successfully");
          
          if (form.symbol) {
            setTimeout(() => analyzeChartImage(), 800);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to capture chart");
      setChartCaptured(false);
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeChartImage = async () => {
    if (!form.symbol) {
      toast.warning("Please enter a symbol before analyzing");
      return;
    }
    
    if (!imagePreview && !form.chartImageUrl && uploadAreaRef.current) {
      console.log("No image preview, attempting to capture chart");
      try {
        await uploadAreaRef.current.handleCaptureChart();
        console.log("Chart capture initiated");
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error('Error capturing chart:', error);
        toast.error("Failed to capture chart for analysis");
        return;
      }
    }

    if (!imagePreview && !form.chartImageUrl) {
      console.log("Still no chart available after capture attempt");
      toast.error("No chart available to analyze");
      return;
    }

    const currentUser = store.getUser();
    const apiKey = currentUser.geminiApiKey;
    
    if (!apiKey) {
      toast.error("No Gemini API key found. Please add one in your profile settings.");
      return;
    }
    
    setIsAnalyzing(true);
    setApiError(null);
    toast.info("Analyzing chart with Gemini AI...");
    
    try {
      const dataUrlToAnalyze = imagePreview || form.chartImageUrl as string;
      console.log("Analyzing chart", Boolean(dataUrlToAnalyze), form.symbol);
      const analysis = await analyzeChartWithGemini(apiKey, dataUrlToAnalyze, form.symbol as string);
      
      if (analysis) {
        console.log("Analysis completed:", analysis);
        
        const isBullish = analysis.trend?.toLowerCase().includes('bullish');
        const isBearish = analysis.trend?.toLowerCase().includes('bearish');
        const position = isBullish ? 'long' : isBearish ? 'short' : null;
        const sentiment = isBullish ? 'bullish' : isBearish ? 'bearish' : null;
        
        let entryPrice;
        let exitPrice;
        let profit;
        let profitPercentage;
        
        const supportLevels = (analysis.support || []).filter(level => typeof level === 'number') as number[];
        const resistanceLevels = (analysis.resistance || []).filter(level => typeof level === 'number') as number[];
        
        if (supportLevels.length > 0 && resistanceLevels.length > 0) {
          if (isBullish) {
            entryPrice = Math.min(...supportLevels);
            exitPrice = Math.max(...resistanceLevels);
          } else if (isBearish) {
            entryPrice = Math.max(...resistanceLevels);
            exitPrice = Math.min(...supportLevels);
          }
          
          if (position === 'long' && entryPrice && exitPrice) {
            profit = exitPrice - entryPrice;
            profitPercentage = (profit / entryPrice) * 100;
          } else if (position === 'short' && entryPrice && exitPrice) {
            profit = entryPrice - exitPrice;
            profitPercentage = (profit / entryPrice) * 100;
          }
        }
        
        setForm(prev => ({
          ...prev,
          aiAnalysis: analysis,
          position,
          sentiment,
          entryPrice,
          exitPrice,
          profit,
          profitPercentage
        }));
        
        toast.success("AI analysis completed and form updated");
      } else {
        throw new Error("Failed to analyze chart");
      }
    } catch (error) {
      console.error('Error during analysis:', error);
      setApiError("Failed to analyze chart. Please check your API key and try again.");
      toast.error("Error analyzing chart");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
  };

  const calculateProfit = () => {
    if (form.entryPrice === undefined || form.exitPrice === undefined || form.position === undefined) {
      return;
    }

    let profit = 0;
    let profitPercentage = 0;

    if (form.position === 'long') {
      profit = form.exitPrice - form.entryPrice;
      profitPercentage = (profit / form.entryPrice) * 100;
    } else if (form.position === 'short') {
      profit = form.entryPrice - form.exitPrice;
      profitPercentage = (profit / form.entryPrice) * 100;
    }

    setForm(prev => ({
      ...prev,
      profit,
      profitPercentage
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.symbol || !form.chartImageUrl) {
      toast.error("Please provide a symbol and upload a chart image");
      return;
    }
    
    if (!checklistComplete) {
      toast.warning("Please complete the pre-trade checklist before saving");
      return;
    }
    
    try {
      const newEntry = store.addEntry(form as TradeEntry);
      toast.success("Trade entry saved successfully");
      
      navigate(`/dashboard/${newEntry.id}`);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error("Failed to save entry");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-24 px-6 md:px-8 max-w-6xl mx-auto">
        <NewEntryHeader 
          onSave={handleSubmit} 
          checklistComplete={checklistComplete} 
        />
        
        <div className="animate-fade-in space-y-8">
          <div className="glass-card p-6 rounded-xl border border-tron-blue/30 shadow-tron-sm">
            <div className="flex justify-between items-center mb-4">
              <SymbolInput 
                symbol={form.symbol || ''} 
                onChange={handleChange} 
              />
              
              <AnalyzeButton 
                onClick={analyzeChartImage} 
                isAnalyzing={isAnalyzing} 
              />
            </div>
            
            <div className="w-full">
              <UploadArea 
                onImageUpload={handleImageUpload}
                captureChart={analyzeChartImage}
                symbol={form.symbol ? `BINANCE:${form.symbol.replace('/', '')}` : undefined}
                className="h-[500px]"
                ref={uploadAreaRef}
              />
              
              {apiError && <ApiErrorMessage error={apiError} />}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TradeDetailsForm
                form={form}
                handleChange={handleChange}
                handleNumberChange={handleNumberChange}
                calculateProfit={calculateProfit}
              />
              
              <AnalysisSection
                analysis={form.aiAnalysis}
                onChecklistComplete={setChecklistComplete}
                onAnalyzeChart={analyzeChartImage}
                isAnalyzing={isAnalyzing}
                chartCaptured={chartCaptured}
                symbol={form.symbol as string}
              />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewEntry;
