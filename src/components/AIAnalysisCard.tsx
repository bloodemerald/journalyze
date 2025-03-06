
import { TradeEntry } from '@/lib/types';
import { AlertCircle, Brain, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAnalysisCardProps {
  analysis: TradeEntry['aiAnalysis'];
  className?: string;
}

export function AIAnalysisCard({ analysis, className }: AIAnalysisCardProps) {
  // Enhanced empty state check
  const isEmpty = !analysis || 
    (!analysis.pattern && 
     !analysis.trend && 
     (!analysis.support || analysis.support.length === 0) && 
     (!analysis.resistance || analysis.resistance.length === 0) &&
     (!analysis.technicalIndicators || analysis.technicalIndicators.length === 0) &&
     !analysis.recommendation);
  
  if (isEmpty) {
    return (
      <div className={cn("bg-muted p-6 rounded-xl", className)}>
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-muted-foreground" />
          <h3 className="text-lg font-medium">No Analysis Available</h3>
        </div>
        <p className="mt-2 text-muted-foreground">
          Upload a chart image to get AI-powered analysis.
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn("glass-card p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <Brain size={18} className="text-primary" />
        </div>
        <h3 className="text-lg font-medium">AI Analysis</h3>
      </div>
      
      <div className="space-y-4">
        {analysis.pattern && (
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-24 text-sm text-muted-foreground">Pattern</span>
            <span className="text-sm font-medium">{analysis.pattern}</span>
          </div>
        )}
        
        {analysis.trend && (
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-24 text-sm text-muted-foreground">Trend</span>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-sm font-medium">{analysis.trend}</span>
            </div>
          </div>
        )}
        
        {analysis.support && analysis.support.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-24 text-sm text-muted-foreground">Support</span>
            <div className="flex flex-wrap gap-2">
              {analysis.support.map((level, index) => (
                <span 
                  key={index}
                  className="text-sm px-2 py-0.5 rounded-md bg-green-50 text-green-700 font-medium"
                >
                  {typeof level === 'number' ? level.toFixed(2) : level}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {analysis.resistance && analysis.resistance.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-24 text-sm text-muted-foreground">Resistance</span>
            <div className="flex flex-wrap gap-2">
              {analysis.resistance.map((level, index) => (
                <span 
                  key={index}
                  className="text-sm px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-medium"
                >
                  {typeof level === 'number' ? level.toFixed(2) : level}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {analysis.riskRewardRatio && (
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-24 text-sm text-muted-foreground">Risk/Reward</span>
            <span className="text-sm font-medium">1:{analysis.riskRewardRatio.toFixed(1)}</span>
          </div>
        )}
        
        {analysis.technicalIndicators && analysis.technicalIndicators.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-24 text-sm text-muted-foreground">Indicators</span>
            <div className="space-y-2">
              {analysis.technicalIndicators.map((indicator, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {indicator.name}: {indicator.value}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {indicator.interpretation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {analysis.recommendation && (
          <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm">{analysis.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
