
import { TradeEntry } from '@/lib/types';
import { AlertCircle, Brain, TrendingUp, TrendingDown, Check, X, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateLeveragedTradeParameters } from '@/lib/priceUtils';

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
  
  const isBullish = analysis?.trend?.toLowerCase().includes('bullish');
  const isBearish = analysis?.trend?.toLowerCase().includes('bearish');
  
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
  
  // Find support/resistance levels to calculate potential entry/exit
  const supportLevels = (analysis.support || []).filter(level => typeof level === 'number') as number[];
  const resistanceLevels = (analysis.resistance || []).filter(level => typeof level === 'number') as number[];
  
  // Extract current price from analysis or use midpoint
  const priceIndicators = analysis.technicalIndicators?.filter(
    ind => ind.name.toLowerCase().includes('price') || ind.value?.includes('$')
  );
  
  // Find approximate current price from technical indicators or support/resistance midpoint
  let currentPrice = 0;
  if (priceIndicators && priceIndicators.length > 0) {
    // Try to extract price from indicators
    const priceMatch = priceIndicators[0].value.match(/\$?(\d+(\.\d+)?)/);
    if (priceMatch) {
      currentPrice = parseFloat(priceMatch[1]);
    }
  }
  
  // If we couldn't extract price, calculate from support/resistance
  if (!currentPrice && supportLevels.length > 0 && resistanceLevels.length > 0) {
    // Use midpoint between nearest support and resistance as approximation
    const midSupport = Math.max(...supportLevels);
    const midResistance = Math.min(...resistanceLevels);
    currentPrice = (midSupport + midResistance) / 2;
  } else if (!currentPrice) {
    // Fallback - use first support or resistance value if available
    currentPrice = supportLevels[0] || resistanceLevels[0] || 100;
  }
  
  // Calculate professional trading setup with precise leverage parameters
  const tradeSetup = calculateLeveragedTradeParameters(
    analysis.trend || '',
    currentPrice,
    supportLevels,
    resistanceLevels
  );
  
  // Use provided risk/reward or calculated one
  const riskRewardRatio = analysis.riskRewardRatio || tradeSetup.riskRewardRatio;
  
  return (
    <div className={cn("bg-background p-6 rounded-lg border border-border", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <Brain size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-medium">Institutional Analysis</h3>
        </div>
        
        {/* Trade Decision - Institutional Format */}
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1",
          isBullish ? "bg-green-100 text-green-700" : isBearish ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
        )}>
          {isBullish ? "Trade Decision: Long" : isBearish ? "Trade Decision: Short" : "Analysis Pending"}
        </div>
      </div>
      
      {/* Analysis Summary */}
      {analysis.recommendation && (
        <div className="mb-6 p-3 rounded-lg bg-secondary/30 border border-border text-sm">
          <p className="italic">{analysis.recommendation}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Left Column - Pattern & Levels */}
        <div className="space-y-4">
          {analysis.pattern && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-muted-foreground">Pattern</h4>
              <p className="font-medium">{analysis.pattern}</p>
            </div>
          )}
          
          {analysis.trend && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-muted-foreground">Trend</h4>
              <div className="flex items-center gap-2">
                {isBullish ? (
                  <TrendingUp size={16} className="text-green-500" />
                ) : isBearish ? (
                  <TrendingDown size={16} className="text-red-500" />
                ) : null}
                <span className={cn("font-medium", 
                  isBullish ? "text-green-600" : 
                  isBearish ? "text-red-600" : ""
                )}>
                  {analysis.trend}
                </span>
              </div>
            </div>
          )}
          
          {supportLevels.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-muted-foreground">Support Levels</h4>
              <div className="flex flex-wrap gap-2">
                {supportLevels.map((level, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 font-medium"
                  >
                    {level.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {resistanceLevels.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-muted-foreground">Resistance Levels</h4>
              <div className="flex flex-wrap gap-2">
                {resistanceLevels.map((level, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-medium"
                  >
                    {level.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column - Trade Setup - Institutional Format */}
        <div className="space-y-4">
          <h4 className="font-semibold mb-3">Leveraged Trade Setup (10x)</h4>
          
          <div className="space-y-3">
            {tradeSetup.entryPrice && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Entry Price</span>
                <span className={cn("font-medium", isBullish ? "text-green-600" : "text-red-600")}>
                  ${tradeSetup.entryPrice.toFixed(2)}
                </span>
              </div>
            )}
            
            {tradeSetup.stopLoss && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Stop Loss (0.7%)</span>
                <span className="font-medium text-red-600">${tradeSetup.stopLoss.toFixed(2)}</span>
              </div>
            )}
            
            {tradeSetup.takeProfit && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Take Profit</span>
                <span className="font-medium text-green-600">${tradeSetup.takeProfit.toFixed(2)}</span>
              </div>
            )}
            
            {riskRewardRatio && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Risk/Reward Ratio</span>
                <span className="font-medium">1:{riskRewardRatio}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Leverage</span>
              <span className="font-medium text-amber-600">10x</span>
            </div>
          </div>
          
          {/* Technical Indicators - Professional Format */}
          {analysis.technicalIndicators && analysis.technicalIndicators.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Technical Indicators</h4>
              <div className="space-y-3">
                {analysis.technicalIndicators.map((indicator, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{indicator.name}:</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          indicator.interpretation.toLowerCase().includes('bullish') ? "text-green-600" :
                          indicator.interpretation.toLowerCase().includes('bearish') ? "text-red-600" : ""
                        )}>
                          {indicator.value}
                        </span>
                        
                        {indicator.interpretation.toLowerCase().includes('bullish') && (
                          <TrendingUp size={14} className="text-green-500" />
                        )}
                        
                        {indicator.interpretation.toLowerCase().includes('bearish') && (
                          <TrendingDown size={14} className="text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{indicator.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
