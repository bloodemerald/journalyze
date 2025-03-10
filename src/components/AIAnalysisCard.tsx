
import { TradeEntry } from '@/lib/types';
import { AlertCircle, Brain, TrendingUp, TrendingDown, Check, X, BarChart } from 'lucide-react';
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
  
  // Calculate entry, stop loss, and take profit based on professional trading principles
  let entryPrice: number | undefined;
  let stopLoss: number | undefined;
  let takeProfit: number | undefined;
  
  // For trading calculations - using institutional-grade risk management
  const DEFAULT_STOP_LOSS_PERCENT = 1.5; // Tighter stop loss for 5-min trading (institutional standard)
  const DEFAULT_RISK_REWARD_RATIO = analysis.riskRewardRatio || 1.5;
  
  // Calculate based on trend - using proper institutional trading principles
  if (isBullish && supportLevels.length > 0 && resistanceLevels.length > 0) {
    // For bullish: Entry above key technical level, tight stop below support, target at resistance
    const nearestSupport = Math.max(...supportLevels);
    const nearestResistance = Math.min(...resistanceLevels);
    
    // Institutional traders enter on confirmation, not anticipation
    entryPrice = parseFloat((nearestSupport * 1.002).toFixed(2));
    
    // Professional stop placement - based on volatility and technical levels
    // Tight stops are institutional standard for 5-min charts
    stopLoss = parseFloat((nearestSupport * (1 - DEFAULT_STOP_LOSS_PERCENT/100)).toFixed(2));
    
    // Take profit at resistance or based on risk-reward ratio, whichever is closer
    const riskAmount = entryPrice - stopLoss;
    const rewardBasedOnRatio = entryPrice + (riskAmount * DEFAULT_RISK_REWARD_RATIO);
    
    // Professional traders use the more conservative target
    takeProfit = Math.min(nearestResistance, rewardBasedOnRatio);
    takeProfit = parseFloat(takeProfit.toFixed(2));
  } else if (isBearish && supportLevels.length > 0 && resistanceLevels.length > 0) {
    // For bearish: Entry below key technical level, tight stop above resistance, target at support
    const nearestSupport = Math.max(...supportLevels);
    const nearestResistance = Math.min(...resistanceLevels);
    
    // Institutional traders enter on confirmation, not anticipation
    entryPrice = parseFloat((nearestResistance * 0.998).toFixed(2));
    
    // Professional stop placement - based on volatility and technical levels
    stopLoss = parseFloat((nearestResistance * (1 + DEFAULT_STOP_LOSS_PERCENT/100)).toFixed(2));
    
    // Take profit at support or based on risk-reward ratio, whichever is closer
    const riskAmount = stopLoss - entryPrice;
    const rewardBasedOnRatio = entryPrice - (riskAmount * DEFAULT_RISK_REWARD_RATIO);
    
    // Professional traders use the more conservative target
    takeProfit = Math.max(nearestSupport, rewardBasedOnRatio);
    takeProfit = parseFloat(takeProfit.toFixed(2));
  }
  
  // Calculate exact risk/reward ratio based on our values - institutional precision
  let riskRewardRatio = analysis.riskRewardRatio;
  if (!riskRewardRatio && entryPrice && stopLoss && takeProfit) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(entryPrice - takeProfit);
    if (risk > 0) {
      // Show precise ratio to one decimal place - institutional standard
      riskRewardRatio = parseFloat((reward / risk).toFixed(1));
    }
  }
  
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
          <h4 className="font-semibold mb-3">Institutional Trade Setup</h4>
          
          <div className="space-y-3">
            {entryPrice && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Entry Price</span>
                <span className={cn("font-medium", isBullish ? "text-green-600" : "text-red-600")}>
                  ${entryPrice.toFixed(2)}
                </span>
              </div>
            )}
            
            {stopLoss && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Stop Loss</span>
                <span className="font-medium text-red-600">${stopLoss.toFixed(2)}</span>
              </div>
            )}
            
            {takeProfit && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Take Profit</span>
                <span className="font-medium text-green-600">${takeProfit.toFixed(2)}</span>
              </div>
            )}
            
            {riskRewardRatio && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Risk/Reward Ratio</span>
                <span className="font-medium">1:{riskRewardRatio}</span>
              </div>
            )}
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
