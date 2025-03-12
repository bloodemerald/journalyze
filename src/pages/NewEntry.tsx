import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Save, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
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

  useEffect(() => {
    console.log("Current form state:", form);
  }, [form]);

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
            className={`px-5 py-2.5 rounded-md flex items-center font-medium transition-all duration-300 ${
              !checklistComplete 
                ? 'bg-primary/30 text-white/70 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary/90 hover:shadow-tron-sm'
            }`}
            disabled={!checklistComplete}
          >
            <Save size={16} className="mr-2" />
            Save Entry
          </button>
        </div>
        
        <div className="animate-fade-in space-y-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2 tron-text-glow">New Trade Entry</h1>
            <p className="text-muted-foreground">Capture and analyze your trading opportunity</p>
          </div>
          
          <div className="glass-card p-6 rounded-xl border border-tron-blue/30 shadow-tron-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="w-1/3">
                <label className="block font-medium text-sm mb-2 text-tron-cyan">Symbol</label>
                <div className="relative">
                  <input
                    type="text"
                    name="symbol"
                    value={form.symbol || ''}
                    onChange={handleChange}
                    placeholder="e.g. BTC/USD"
                    className="input-field w-full pl-10"
                    required
                  />
                  <TrendingUp size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tron-blue/70" />
                </div>
              </div>
              
              <button
                type="button"
                onClick={analyzeChartImage}
                className={`flex items-center py-2 px-4 rounded-md transition-all duration-300 ${
                  isAnalyzing 
                    ? 'bg-tron-blue/20 border border-tron-blue/40 cursor-wait'
                    : 'bg-tron-blue/80 hover:bg-tron-blue border border-tron-cyan/50 hover:shadow-tron-sm'
                }`}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 mr-2 rounded-full border-2 border-tron-cyan border-t-transparent animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain size={16} className="mr-2" />
                    Analyze Chart
                  </>
                )}
              </button>
            </div>
            
            <div className="w-full">
              <UploadArea 
                onImageUpload={handleImageUpload}
                captureChart={analyzeChartImage}
                symbol={form.symbol ? `BINANCE:${form.symbol.replace('/', '')}` : undefined}
                className="h-[500px]"
                ref={uploadAreaRef}
              />
              
              {apiError && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md text-red-400 text-sm">
                  <div className="flex items-start">
                    <AlertTriangle size={16} className="mr-2 mt-0.5 text-red-400" />
                    <div>
                      <p className="font-medium">API Error</p>
                      <p>{apiError}</p>
                      <p className="mt-2 text-xs">Note: Gemini Pro Vision was deprecated. The app now uses gemini-1.5-flash model.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 glass-card p-6 rounded-xl border border-tron-blue/30 shadow-tron-sm">
                <h2 className="text-xl font-semibold text-tron-cyan mb-4 flex items-center">
                  <Zap size={18} className="mr-2" />
                  Trade Details
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-sm mb-2 text-foreground">Position</label>
                    <select
                      name="position"
                      value={form.position || ''}
                      onChange={handleChange}
                      className="input-field w-full bg-tron-darkBlue"
                    >
                      <option value="">Select</option>
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block font-medium text-sm mb-2 text-foreground">Sentiment</label>
                    <select
                      name="sentiment"
                      value={form.sentiment || ''}
                      onChange={handleChange}
                      className="input-field w-full bg-tron-darkBlue"
                    >
                      <option value="">Select</option>
                      <option value="bullish">Bullish</option>
                      <option value="bearish">Bearish</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-sm mb-2 text-foreground">Entry Price</label>
                    <input
                      type="number"
                      name="entryPrice"
                      value={form.entryPrice || ''}
                      onChange={handleNumberChange}
                      onBlur={calculateProfit}
                      className="input-field w-full bg-tron-darkBlue"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium text-sm mb-2 text-foreground">Exit Price</label>
                    <input
                      type="number"
                      name="exitPrice"
                      value={form.exitPrice || ''}
                      onChange={handleNumberChange}
                      onBlur={calculateProfit}
                      className="input-field w-full bg-tron-darkBlue"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {form.profit !== undefined && form.profitPercentage !== undefined && (
                  <div className={`p-3 rounded-md text-sm flex items-center ${
                    form.profit > 0 
                      ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
                      : 'bg-red-900/20 border border-red-500/30 text-red-400'
                  }`}>
                    <TrendingUp size={16} className="mr-2" />
                    <span>
                      Potential {form.profit > 0 ? 'Profit' : 'Loss'}: {form.profit.toFixed(2)} ({form.profitPercentage.toFixed(2)}%)
                    </span>
                  </div>
                )}
                
                <div>
                  <label className="block font-medium text-sm mb-2 text-foreground">Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes || ''}
                    onChange={handleChange}
                    className="input-field w-full min-h-[120px] bg-tron-darkBlue"
                    placeholder="Add your trade notes here..."
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-xl border border-tron-blue/30 shadow-tron-sm">
                  <h2 className="text-xl font-semibold text-tron-cyan mb-4 flex items-center">
                    <Brain size={18} className="mr-2" />
                    AI Analysis
                  </h2>
                  <AIAnalysisCard analysis={form.aiAnalysis} />
                </div>
                
                <PreTradeChecklist 
                  onChecklistComplete={setChecklistComplete}
                  onAnalyzeChart={analyzeChartImage}
                  isAnalyzing={isAnalyzing}
                  chartCaptured={chartCaptured}
                  symbol={form.symbol as string}
                  className="glass-card rounded-xl p-6 border border-tron-blue/30 shadow-tron-sm"
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
