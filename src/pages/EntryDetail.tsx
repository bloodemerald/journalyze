
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  Save, 
  Trash2, 
  ArrowDown, 
  ArrowUp
} from 'lucide-react';
import { Header } from '@/components/Header';
import { AIAnalysisCard } from '@/components/AIAnalysisCard';
import { store } from '@/lib/store';
import { TradeEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

const EntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<TradeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<TradeEntry>>({});

  useEffect(() => {
    if (id) {
      try {
        const entryData = store.getEntry(id);
        if (entryData) {
          setEntry(entryData);
          setForm(entryData);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error loading entry:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [id, navigate]);

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

  const handleSave = () => {
    if (id && form) {
      const updatedEntry = store.updateEntry(id, form as TradeEntry);
      if (updatedEntry) {
        setEntry(updatedEntry);
        setIsEditing(false);
      }
    }
  };

  const handleDelete = () => {
    if (id && window.confirm('Are you sure you want to delete this entry?')) {
      store.deleteEntry(id);
      navigate('/dashboard');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 px-6 md:px-8 max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-4 bg-muted rounded w-40"></div>
            <div className="h-64 bg-muted rounded w-full mt-8"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 px-6 md:px-8 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Entry Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The trade entry you're looking for doesn't exist.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center text-primary hover:underline"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

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
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
                >
                  <Save size={16} className="mr-2" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setForm(entry);
                  }}
                  className="px-4 py-2 bg-secondary text-foreground rounded-md"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-secondary text-foreground rounded-md flex items-center"
                >
                  <Pencil size={16} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="space-y-8 animate-fade-in">
          {/* Header info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">
                {isEditing ? (
                  <input
                    type="text"
                    name="symbol"
                    value={form.symbol || ''}
                    onChange={handleChange}
                    className="input-field w-full text-3xl font-bold"
                  />
                ) : (
                  entry.symbol
                )}
              </h1>
              
              <div className={cn(
                "px-3 py-1 rounded-md text-sm font-medium",
                entry.position === 'long' ? "bg-green-100 text-green-800" : 
                entry.position === 'short' ? "bg-red-100 text-red-800" : 
                "bg-secondary text-secondary-foreground"
              )}>
                {isEditing ? (
                  <select
                    name="position"
                    value={form.position || ''}
                    onChange={handleChange}
                    className="bg-transparent border-none p-0 focus:ring-0"
                  >
                    <option value="">Select</option>
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                ) : (
                  entry.position === 'long' ? 'Long' : 
                  entry.position === 'short' ? 'Short' : 
                  'Unspecified'
                )}
              </div>
              
              {entry.sentiment && (
                <div className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium",
                  entry.sentiment === 'bullish' ? "bg-green-50 text-green-700" : 
                  "bg-red-50 text-red-700"
                )}>
                  {isEditing ? (
                    <select
                      name="sentiment"
                      value={form.sentiment || ''}
                      onChange={handleChange}
                      className="bg-transparent border-none p-0 focus:ring-0"
                    >
                      <option value="">Select</option>
                      <option value="bullish">Bullish</option>
                      <option value="bearish">Bearish</option>
                    </select>
                  ) : (
                    entry.sentiment === 'bullish' ? 'Bullish' : 'Bearish'
                  )}
                </div>
              )}
            </div>
            
            <p className="text-muted-foreground">
              {formatDate(entry.timestamp)}
            </p>
          </div>
          
          {/* Chart image */}
          <div className="glass-card p-4 md:p-6 overflow-hidden">
            <div className="rounded-lg overflow-hidden bg-muted max-h-[500px] flex items-center justify-center">
              <img 
                src={entry.chartImageUrl} 
                alt={`${entry.symbol} chart`}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          
          {/* Trade details */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 md:col-span-1">
              <h3 className="text-lg font-medium mb-4">Trade Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Entry Price
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="entryPrice"
                      value={form.entryPrice || ''}
                      onChange={handleNumberChange}
                      onBlur={calculateProfit}
                      className="input-field w-full"
                      step="0.01"
                    />
                  ) : (
                    <p className="font-medium">
                      {entry.entryPrice !== undefined ? entry.entryPrice.toFixed(2) : 'Not specified'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Exit Price
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="exitPrice"
                      value={form.exitPrice || ''}
                      onChange={handleNumberChange}
                      onBlur={calculateProfit}
                      className="input-field w-full"
                      step="0.01"
                    />
                  ) : (
                    <p className="font-medium">
                      {entry.exitPrice !== undefined ? entry.exitPrice.toFixed(2) : 'Not specified'}
                    </p>
                  )}
                </div>
                
                {(entry.profit !== undefined || isEditing) && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Profit/Loss
                    </label>
                    <div className="flex items-center">
                      {entry.profit !== undefined && (
                        <>
                          {entry.profit > 0 ? (
                            <ChevronUp size={16} className="text-green-500 mr-1" />
                          ) : entry.profit < 0 ? (
                            <ChevronDown size={16} className="text-red-500 mr-1" />
                          ) : null}
                          <p className={cn(
                            "font-medium",
                            entry.profit > 0 ? "text-green-600" : 
                            entry.profit < 0 ? "text-red-600" : ""
                          )}>
                            {entry.profit > 0 ? '+' : ''}
                            {entry.profit.toFixed(2)}
                            {entry.profitPercentage !== undefined && (
                              <span className="text-muted-foreground ml-1 text-sm">
                                ({entry.profitPercentage > 0 ? '+' : ''}
                                {entry.profitPercentage.toFixed(2)}%)
                              </span>
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Notes
                  </label>
                  {isEditing ? (
                    <textarea
                      name="notes"
                      value={form.notes || ''}
                      onChange={handleChange}
                      className="input-field w-full min-h-[100px]"
                      placeholder="Add your notes here..."
                    />
                  ) : (
                    <p className="text-sm">
                      {entry.notes || 'No notes added'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <AIAnalysisCard analysis={entry.aiAnalysis} />
              
              {/* Performance Summary */}
              {entry.profit !== undefined && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-medium mb-4">Performance Summary</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-sm text-muted-foreground mb-1">Profit/Loss</p>
                      <div className="flex items-center">
                        {entry.profit > 0 ? (
                          <ArrowUp size={16} className="text-green-500 mr-1" />
                        ) : (
                          <ArrowDown size={16} className="text-red-500 mr-1" />
                        )}
                        <p className={cn(
                          "font-medium",
                          entry.profit > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {entry.profit > 0 ? '+' : ''}
                          {entry.profit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-sm text-muted-foreground mb-1">Return %</p>
                      <div className="flex items-center">
                        {entry.profitPercentage !== undefined && entry.profitPercentage > 0 ? (
                          <ArrowUp size={16} className="text-green-500 mr-1" />
                        ) : (
                          <ArrowDown size={16} className="text-red-500 mr-1" />
                        )}
                        <p className={cn(
                          "font-medium",
                          entry.profitPercentage !== undefined && entry.profitPercentage > 0 
                            ? "text-green-600" 
                            : "text-red-600"
                        )}>
                          {entry.profitPercentage !== undefined ? (
                            <>
                              {entry.profitPercentage > 0 ? '+' : ''}
                              {entry.profitPercentage.toFixed(2)}%
                            </>
                          ) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EntryDetail;
