
export interface TradeEntry {
  id: string;
  timestamp: number;
  symbol: string;
  chartImageUrl: string;
  entryPrice?: number;
  exitPrice?: number;
  position: 'long' | 'short' | null;
  sentiment: 'bullish' | 'bearish' | null;
  aiAnalysis: {
    pattern?: string;
    support?: number[];
    resistance?: number[];
    trend?: string;
    riskRewardRatio?: number;
    technicalIndicators?: {
      name: string;
      value: string;
      interpretation: string;
    }[];
    recommendation?: string;
  };
  notes?: string;
  profit?: number;
  profitPercentage?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  apiKey?: string;
  geminiApiKey?: string;
}
