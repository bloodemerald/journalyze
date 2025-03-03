
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
      icon: <TrendingUp size={18} />
    },
    {
      id: 'timeframe',
      label: 'Timeframe Alignment',
      description: 'Verify the trade matches your target timeframe strategy',
      icon: <Timer size={18} />
    },
    {
      id: 'risk',
      label: 'Risk Management',
      description: 'Ensure position size follows your risk management rules',
      icon: <ShieldAlert size={18} />
    },
    {
      id: 'setup',
      label: 'Setup Validation',
      description: 'Confirm all trade entry criteria are met',
      icon: <FileCheck size={18} />
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
        <h3 className="text-lg font-semibold">Pre-Trade Checklist</h3>
        <div 
          className={cn(
            "text-xs font-medium py-1 px-3 rounded-full", 
            allChecked 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
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
              "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
              checkedItems[item.id] 
                ? "bg-secondary border-primary/20 dark:bg-secondary/70" 
                : "bg-white hover:bg-secondary/50 dark:bg-card dark:hover:bg-secondary/30"
            )}
            onClick={() => toggleItem(item.id)}
          >
            <div 
              className={cn(
                "flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center transition-colors",
                checkedItems[item.id] 
                  ? "bg-primary border-primary text-white" 
                  : "border-input bg-background"
              )}
            >
              {checkedItems[item.id] && <Check size={12} className="stroke-[3px]" />}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{item.icon}</span>
                <h4 className="text-sm font-medium">{item.label}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
