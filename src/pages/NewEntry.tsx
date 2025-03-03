
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { UploadArea } from '@/components/UploadArea';
import { AIAnalysisCard } from '@/components/AIAnalysisCard';
import { TradeEntry } from '@/lib/types';
import { store } from '@/lib/store';
import { toast } from 'sonner';

const NewEntry = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
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

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      // For demo purposes, we'll just create a data URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          setImagePreview(dataUrl);
          setForm(prev => ({ ...prev, chartImageUrl: dataUrl }));
          
          // Show uploading toast
          toast.success("Chart uploaded successfully");
          
          // Simulate AI analysis
          simulateAIAnalysis();
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload chart");
    } finally {
      setIsUploading(false);
    }
  };

  const simulateAIAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const mockAnalysis = {
        pattern: 'Bullish Flag',
        support: [38750, 37900],
        resistance: [42500, 45000],
        trend: 'Bullish continuation pattern',
        riskRewardRatio: 3.2,
        technicalIndicators: [
          { 
            name: 'RSI', 
            value: '58', 
            interpretation: 'Neutral with bullish momentum' 
          },
          { 
            name: 'MACD', 
            value: 'Crossover', 
            interpretation: 'Bullish signal confirmed' 
          },
          { 
            name: 'Moving Averages', 
            value: 'Above 50 EMA', 
            interpretation: 'Price above key moving averages' 
          }
        ],
        recommendation: 'Potential entry opportunity. The chart shows a bullish flag pattern with strong support at 37900. Consider a stop loss below the support level.'
      };
      
      setForm(prev => ({
        ...prev,
        symbol: 'BTC/USD',
        aiAnalysis: mockAnalysis
      }));
      
      setIsAnalyzing(false);
      toast.success("AI analysis completed");
    }, 2500);
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
    
    // Check if minimum required fields are filled
    if (!form.symbol || !form.chartImageUrl) {
      toast.error("Please provide a symbol and upload a chart image");
      return;
    }
    
    try {
      // Save entry
      const newEntry = store.addEntry(form as TradeEntry);
      toast.success("Trade entry saved successfully");
      
      // Navigate to the entry detail page
      navigate(`/dashboard/${newEntry.id}`);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error("Failed to save entry");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-24 px-6 md:px-8 max-w-5xl mx-auto">
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
            className="px-5 py-2.5 bg-primary text-white rounded-md flex items-center font-medium"
          >
            <Save size={16} className="mr-2" />
            Save Entry
          </button>
        </div>
        
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-6">New Trade Entry</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Trade Details */}
              <div className="space-y-6">
                <div>
                  <label className="block font-medium mb-2">Symbol</label>
                  <input
                    type="text"
                    name="symbol"
                    value={form.symbol || ''}
                    onChange={handleChange}
                    placeholder="e.g. BTC/USD"
                    className="input-field w-full"
                    required
                  />
                </div>
                
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
              
              {/* Right Column - Chart Upload & AI Analysis */}
              <div className="space-y-6">
                <div>
                  <label className="block font-medium mb-2">Chart Image</label>
                  <UploadArea 
                    onImageUpload={handleImageUpload} 
                    className="h-48"
                  />
                  
                  {isAnalyzing && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                      <Brain size={14} />
                      <span>Analyzing chart...</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block font-medium mb-2">AI Analysis</label>
                  <AIAnalysisCard analysis={form.aiAnalysis} />
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewEntry;
