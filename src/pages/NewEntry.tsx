
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { UploadArea } from '@/components/UploadArea';
import { AIAnalysisCard } from '@/components/AIAnalysisCard';
import { PreTradeChecklist } from '@/components/PreTradeChecklist';
import { TradeEntry } from '@/lib/types';
import { store } from '@/lib/store';
import { toast } from 'sonner';
import { analyzeChartWithGemini } from '@/lib/gemini';

const NewEntry = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [user, setUser] = useState(store.getUser());
  const [apiError, setApiError] = useState<string | null>(null);
  const [checklistComplete, setChecklistComplete] = useState(false);
  const [chartCaptured, setChartCaptured] = useState(false);
  
  // Fix the ref type - this is important
  const uploadAreaRef = useRef<{ handleCaptureChart: () => Promise<void> }>(null);
  
  const [form, setForm] = useState<Partial<TradeEntry>>({
    timestamp: Date.now(),
    symbol: '',
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
      // Try to capture chart first if no image preview exists
      console.log("No image preview, attempting to capture chart");
      try {
        await uploadAreaRef.current.handleCaptureChart();
        console.log("Chart capture initiated");
        // Give a moment for the chart capture to complete
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error('Error capturing chart:', error);
        toast.error("Failed to capture chart for analysis");
        return;
      }
    }

    // Check again to see if we now have a preview
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
      console.log("Analyzing chart", Boolean(dataUrlToAnalyze));
      const analysis = await analyzeChartWithGemini(apiKey, dataUrlToAnalyze, form.symbol as string);
      
      if (analysis) {
        // Update the form with the analysis results
        setForm(prev => ({
          ...prev,
          aiAnalysis: analysis,
          // Auto-populate position and sentiment based on AI analysis trend
          position: analysis.trend?.toLowerCase().includes('bullish') ? 'long' : 
                   analysis.trend?.toLowerCase().includes('bearish') ? 'short' : 
                   prev.position,
          sentiment: analysis.trend?.toLowerCase().includes('bullish') ? 'bullish' : 
                    analysis.trend?.toLowerCase().includes('bearish') ? 'bearish' : 
                    prev.sentiment,
        }));
        
        // Auto-populate entry and exit prices based on support/resistance levels
        if (analysis.support?.length > 0 && analysis.resistance?.length > 0) {
          // If trend is bullish, use first support as entry and first resistance as exit
          // If trend is bearish, use first resistance as entry and first support as exit
          const isBullish = analysis.trend?.toLowerCase().includes('bullish');
          const entryPrice = isBullish ? 
            Math.min(...analysis.support.filter(level => typeof level === 'number') as number[]) : 
            Math.max(...analysis.resistance.filter(level => typeof level === 'number') as number[]);
          
          const exitPrice = isBullish ? 
            Math.max(...analysis.resistance.filter(level => typeof level === 'number') as number[]) : 
            Math.min(...analysis.support.filter(level => typeof level === 'number') as number[]);
          
          if (!isNaN(entryPrice) && !isNaN(exitPrice)) {
            setForm(prev => ({
              ...prev,
              entryPrice,
              exitPrice
            }));
            
            // Calculate profit
            const position = isBullish ? 'long' : 'short';
            let profit = 0;
            let profitPercentage = 0;
            
            if (position === 'long') {
              profit = exitPrice - entryPrice;
              profitPercentage = (profit / entryPrice) * 100;
            } else {
              profit = entryPrice - exitPrice;
              profitPercentage = (profit / entryPrice) * 100;
            }
            
            setForm(prev => ({
              ...prev,
              position,
              profit,
              profitPercentage
            }));
          }
        }
        
        toast.success("AI analysis completed");
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
        <div className="mb-8 flex items-center justify-between">
          <Link 
            to="/dashboard" 
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Journal
          </Link>
          
          <button
            onClick={handleSubmit}
            className={`px-5 py-2.5 bg-primary text-white rounded-md flex items-center font-medium ${!checklistComplete ? 'opacity-70' : ''}`}
          >
            <Save size={16} className="mr-2" />
            Save Entry
          </button>
        </div>
        
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-center">New Trade Entry</h1>
          
          {/* Chart Section - Full Width */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <div className="w-1/3">
                <label className="block font-medium mb-2">Symbol</label>
                <input
                  type="text"
                  name="symbol"
                  value={form.symbol || ''}
                  onChange={handleChange}
                  placeholder="e.g. BINANCE:BTCUSDT"
                  className="input-field w-full"
                  required
                />
              </div>
            </div>
            
            <div className="w-full">
              <UploadArea 
                onImageUpload={handleImageUpload}
                captureChart={() => {}}
                symbol={form.symbol ? `BINANCE:${form.symbol.replace('/', '')}` : undefined}
                className="h-[500px]" // Make the chart taller
                ref={uploadAreaRef}
              />
              
              {apiError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  <p className="font-medium">API Error</p>
                  <p>{apiError}</p>
                  <p className="mt-2 text-xs">Note: Gemini Pro Vision was deprecated. The app now uses gemini-1.5-flash model.</p>
                </div>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Trade Details - Left Column */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2">Position</label>
                    <select
                      name="position"
                      value={form.position || ''}
                      onChange={handleChange}
                      className="input-field w-full"
                    >
                      <option value="">Select</option>
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-2">Sentiment</label>
                    <select
                      name="sentiment"
                      value={form.sentiment || ''}
                      onChange={handleChange}
                      className="input-field w-full"
                    >
                      <option value="">Select</option>
                      <option value="bullish">Bullish</option>
                      <option value="bearish">Bearish</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2">Entry Price</label>
                    <input
                      type="number"
                      name="entryPrice"
                      value={form.entryPrice || ''}
                      onChange={handleNumberChange}
                      onBlur={calculateProfit}
                      className="input-field w-full"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-2">Exit Price</label>
                    <input
                      type="number"
                      name="exitPrice"
                      value={form.exitPrice || ''}
                      onChange={handleNumberChange}
                      onBlur={calculateProfit}
                      className="input-field w-full"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes || ''}
                    onChange={handleChange}
                    className="input-field w-full min-h-[120px]"
                    placeholder="Add your trade notes here..."
                  />
                </div>
              </div>
              
              {/* Analysis and Checklist - Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block font-medium mb-2">AI Analysis</label>
                  <AIAnalysisCard analysis={form.aiAnalysis} />
                </div>
                
                <PreTradeChecklist 
                  onChecklistComplete={setChecklistComplete}
                  onAnalyzeChart={analyzeChartImage}
                  isAnalyzing={isAnalyzing}
                  chartCaptured={chartCaptured}
                  symbol={form.symbol as string}
                  className="mt-6 bg-card rounded-lg p-4 border"
                />
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewEntry;
