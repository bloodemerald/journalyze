
import { Brain } from 'lucide-react';
import { AIAnalysisCard } from '@/components/AIAnalysisCard';
import { TradeEntry } from '@/lib/types';
import { PreTradeChecklist } from '@/components/PreTradeChecklist';

interface AnalysisSectionProps {
  analysis: TradeEntry['aiAnalysis'];
  onChecklistComplete: (isComplete: boolean) => void;
  onAnalyzeChart: () => void;
  isAnalyzing: boolean;
  chartCaptured: boolean;
  symbol: string;
}

export function AnalysisSection({
  analysis,
  onChecklistComplete,
  onAnalyzeChart,
  isAnalyzing,
  chartCaptured,
  symbol
}: AnalysisSectionProps) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl border border-tron-blue/30 shadow-tron-sm">
        <h2 className="text-xl font-semibold text-tron-cyan mb-4 flex items-center">
          <Brain size={18} className="mr-2" />
          AI Analysis
        </h2>
        <AIAnalysisCard analysis={analysis} />
      </div>
      
      <PreTradeChecklist 
        onChecklistComplete={onChecklistComplete}
        onAnalyzeChart={onAnalyzeChart}
        isAnalyzing={isAnalyzing}
        chartCaptured={chartCaptured}
        symbol={symbol}
        className="glass-card rounded-xl p-6 border border-tron-blue/30 shadow-tron-sm"
      />
    </div>
  );
}
