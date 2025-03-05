
import React, { useState } from 'react';
import { Check, TrendingUp, Timer, ShieldAlert, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface PreTradeChecklistProps {
  onChecklistComplete: (isComplete: boolean) => void;
  className?: string;
}

export function PreTradeChecklist({ onChecklistComplete, className }: PreTradeChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    trend: false,
    timeframe: false,
    risk: false,
    setup: false
  });

  const checklistItems: ChecklistItem[] = [
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

  const toggleItem = (id: string) => {
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
                : "bg-tron-darkBlue hover:bg-tron-blue/5 border-tron-blue/20"
            )}
            onClick={() => toggleItem(item.id)}
          >
            <div 
              className={cn(
                "flex-shrink-0 w-5 h-5 mt-0.5 rounded-sm border flex items-center justify-center transition-colors",
                checkedItems[item.id] 
                  ? "bg-tron-blue border-tron-cyan text-white shadow-tron-sm" 
                  : "border-tron-blue/40 bg-tron-dark"
              )}
            >
              {checkedItems[item.id] && <Check size={12} className="stroke-[3px]" />}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  checkedItems[item.id] ? "text-tron-cyan" : "text-tron-blue/70"
                )}>{item.icon}</span>
                <h4 className={cn(
                  "text-sm font-medium",
                  checkedItems[item.id] ? "text-tron-cyan" : "text-foreground"
                )}>{item.label}</h4>
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
