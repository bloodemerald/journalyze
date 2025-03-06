
import React, { useState } from 'react';
import { Check, TrendingUp, Timer, ShieldAlert, FileCheck, Camera, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  isLoading?: boolean;
}

interface PreTradeChecklistProps {
  onChecklistComplete: (isComplete: boolean) => void;
  onAnalyzeChart: () => void;
  isAnalyzing: boolean;
  chartCaptured: boolean;
  symbol: string;
  className?: string;
}

export function PreTradeChecklist({ 
  onChecklistComplete, 
  onAnalyzeChart,
  isAnalyzing,
  chartCaptured,
  symbol,
  className 
}: PreTradeChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    analyze: false,
    trend: false,
    timeframe: false,
    risk: false,
    setup: false
  });

  const handleAnalyzeChart = () => {
    if (!symbol) {
      toast.warning("Please enter a symbol before analyzing the chart");
      return;
    }
    
    onAnalyzeChart();
    
    // Mark as checked after analysis completes
    if (chartCaptured) {
      setCheckedItems(prev => ({
        ...prev,
        analyze: true
      }));
      
      // Check if all items are now checked
      const newCheckedItems = {
        ...checkedItems,
        analyze: true
      };
      
      const allChecked = Object.values(newCheckedItems).every(value => value);
      onChecklistComplete(allChecked);
    }
  };

  // Update analyze state when chartCaptured changes
  React.useEffect(() => {
    if (chartCaptured) {
      setCheckedItems(prev => ({
        ...prev,
        analyze: true
      }));
      
      // Check if all items are now checked
      const newCheckedItems = {
        ...checkedItems,
        analyze: true
      };
      
      const allChecked = Object.values(newCheckedItems).every(value => value);
      onChecklistComplete(allChecked);
    }
  }, [chartCaptured, onChecklistComplete]);

  const toggleItem = (id: string) => {
    // If it's the analyze step, handle it differently
    if (id === 'analyze') {
      if (!checkedItems.analyze) {
        handleAnalyzeChart();
      }
      return;
    }
    
    const newCheckedItems = {
      ...checkedItems,
      [id]: !checkedItems[id]
    };
    setCheckedItems(newCheckedItems);
    
    // Check if all items are checked
    const allChecked = Object.values(newCheckedItems).every(value => value);
    onChecklistComplete(allChecked);
  };

  const allChecked = Object.values(checkedItems).every(value => value);

  const checklistItems: ChecklistItem[] = [
    {
      id: 'analyze',
      label: 'Analyze Chart with AI',
      description: 'Capture and analyze the chart with Gemini AI',
      icon: <Brain size={18} className="text-tron-cyan" />,
      isLoading: isAnalyzing
    },
    {
      id: 'trend',
      label: 'Trend Alignment',
      description: 'Confirm the trade aligns with the overall market trend',
      icon: <TrendingUp size={18} className="text-tron-cyan" />
    },
    {
      id: 'timeframe',
      label: 'Timeframe Alignment',
      description: 'Verify the trade matches your target timeframe strategy',
      icon: <Timer size={18} className="text-tron-cyan" />
    },
    {
      id: 'risk',
      label: 'Risk Management',
      description: 'Ensure position size follows your risk management rules',
      icon: <ShieldAlert size={18} className="text-tron-cyan" />
    },
    {
      id: 'setup',
      label: 'Setup Validation',
      description: 'Confirm all trade entry criteria are met',
      icon: <FileCheck size={18} className="text-tron-cyan" />
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-tron-cyan tron-text-glow">Pre-Trade Checklist</h3>
        <div 
          className={cn(
            "text-xs font-medium py-1 px-3 rounded-sm", 
            allChecked 
              ? "bg-tron-blue/20 text-tron-cyan border border-tron-blue/50 shadow-tron-sm"
              : "bg-tron-darkBlue text-tron-blue/80 border border-tron-blue/30"
          )}
        >
          {allChecked ? "All Confirmed" : "Confirmation Required"}
        </div>
      </div>
      
      <div className="space-y-2">
        {checklistItems.map((item) => (
          <div 
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-sm border transition-all duration-300 cursor-pointer",
              checkedItems[item.id] 
                ? "bg-tron-blue/10 border-tron-blue/40 shadow-tron-sm" 
                : item.id === 'analyze' && item.isLoading
                  ? "bg-tron-blue/5 border-tron-blue/30 pulse-animation"
                  : "bg-tron-darkBlue hover:bg-tron-blue/5 border-tron-blue/20"
            )}
            onClick={() => toggleItem(item.id)}
          >
            <div 
              className={cn(
                "flex-shrink-0 w-5 h-5 mt-0.5 rounded-sm border flex items-center justify-center transition-colors",
                checkedItems[item.id] 
                  ? "bg-tron-blue border-tron-cyan text-white shadow-tron-sm" 
                  : item.id === 'analyze' && item.isLoading
                    ? "bg-tron-blue/30 border-tron-cyan/50"
                    : "border-tron-blue/40 bg-tron-dark"
              )}
            >
              {checkedItems[item.id] && <Check size={12} className="stroke-[3px]" />}
              {item.id === 'analyze' && item.isLoading && (
                <div className="w-2 h-2 rounded-full bg-tron-cyan animate-pulse"></div>
              )}
            </div>
            
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  checkedItems[item.id] ? "text-tron-cyan" : "text-tron-blue/70"
                )}>{item.icon}</span>
                <h4 className={cn(
                  "text-sm font-medium",
                  checkedItems[item.id] ? "text-tron-cyan" : "text-foreground"
                )}>{item.label}</h4>
                
                {item.id === 'analyze' && item.isLoading && (
                  <span className="text-xs text-tron-cyan/70 ml-auto animate-pulse">
                    Analyzing...
                  </span>
                )}
                
                {item.id === 'analyze' && !item.isLoading && !checkedItems[item.id] && (
                  <span className="text-xs text-tron-cyan ml-auto flex items-center">
                    <Camera size={12} className="mr-1" />
                    Click to capture
                  </span>
                )}
              </div>
              <p className={cn(
                "text-xs",
                checkedItems[item.id] ? "text-tron-blue/80" : "text-muted-foreground"
              )}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
