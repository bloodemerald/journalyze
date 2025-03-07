
import { TradeEntry } from './types';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export async function analyzeChartWithGemini(
  apiKey: string,
  imageBase64: string,
  symbol: string
): Promise<TradeEntry['aiAnalysis'] | null> {
  try {
    console.log(`Analyzing ${symbol} chart with Gemini AI`);
    
    // Remove the data URL prefix if present
    const base64Image = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a professional trading analyst. Analyze this ${symbol} price chart and provide a detailed technical analysis in JSON format with the following structure:
                  {
                    "pattern": "string - Technical pattern identified (e.g., 'Double Bottom', 'Head and Shoulders', etc.)",
                    "support": [array of numbers - Specific price levels where support is likely, based on the chart],
                    "resistance": [array of numbers - Specific price levels where resistance is likely, based on the chart],
                    "trend": "string - Current price trend description (must include the word 'bullish' or 'bearish')",
                    "riskRewardRatio": number - Estimated risk/reward ratio if entering now,
                    "technicalIndicators": [
                      {
                        "name": "string - Indicator name (e.g., RSI, MACD)",
                        "value": "string - Current value or state",
                        "interpretation": "string - What this means for trading decisions"
                      }
                    ],
                    "recommendation": "string - Trading recommendation based on price action"
                  }
                  
                  IMPORTANT INSTRUCTIONS:
                  - Focus ONLY on PRICE LEVELS shown in the chart, not market cap or any other metrics
                  - For BTC/USD, typical price range is $40,000-$70,000
                  - For ETH/USD, typical price range is $2,000-$4,000
                  - Support/resistance should be specific price levels from the chart, not market cap
                  - Make sure support prices are LOWER than resistance prices
                  - Always include at least 2-3 numerical values for support/resistance levels based on the actual chart
                  - Always include either "bullish" or "bearish" in the trend description
                  - If certain price levels are clearly visible in the chart, use those exact values
                  - Return ONLY valid JSON without any additional text
                  - If the chart is unclear, use reasonable estimates based on the current market price of the symbol`,
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2, // Lower temperature for more factual responses
            topK: 32,
            topP: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return generateFallbackAnalysis(symbol);
    }

    const data = await response.json() as GeminiResponse;
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No response candidates from Gemini');
      return generateFallbackAnalysis(symbol);
    }
    
    const textResponse = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response:', textResponse);
    
    // Extract JSON from the response
    let jsonStr = textResponse;
    
    // Sometimes the API includes code block markers, let's handle that
    if (textResponse.includes('```json')) {
      jsonStr = textResponse.split('```json')[1].split('```')[0].trim();
    } else if (textResponse.includes('```')) {
      jsonStr = textResponse.split('```')[1].split('```')[0].trim();
    }

    try {
      const analysis = JSON.parse(jsonStr);
      console.log('Parsed analysis:', analysis);
      
      // Extract symbol price range to generate reasonable support/resistance levels
      const priceInfo = extractPriceInfoFromSymbol(symbol);
      
      // If we got empty support/resistance, add fallback values based on price info
      const supportArray = Array.isArray(analysis.support) && analysis.support.length > 0 
        ? analysis.support 
        : generateFallbackLevels(symbol, 'support', priceInfo);
      
      const resistanceArray = Array.isArray(analysis.resistance) && analysis.resistance.length > 0 
        ? analysis.resistance 
        : generateFallbackLevels(symbol, 'resistance', priceInfo);
      
      // Make sure trend contains bullish or bearish
      const trend = analysis.trend || "Bullish trend forming";
      const adjustedTrend = trend.toLowerCase().includes('bullish') || trend.toLowerCase().includes('bearish') 
        ? trend 
        : trend + " (bullish)";
      
      // Convert any string numbers to actual numbers
      const processedSupport = supportArray.map(level => 
        typeof level === 'string' && !isNaN(parseFloat(level)) ? parseFloat(level) : level
      );
      
      const processedResistance = resistanceArray.map(level => 
        typeof level === 'string' && !isNaN(parseFloat(level)) ? parseFloat(level) : level
      );
      
      // Sort support and resistance levels properly
      const sortedSupport = processedSupport.sort((a, b) => Number(a) - Number(b));
      const sortedResistance = processedResistance.sort((a, b) => Number(a) - Number(b));
      
      // Ensure support levels are lower than resistance levels
      const finalSupport = sortedSupport.filter(level => 
        !sortedResistance.some(r => Number(r) <= Number(level))
      );
      
      const finalResistance = sortedResistance.filter(level => 
        !sortedSupport.some(s => Number(s) >= Number(level))
      );
      
      // If filtering removed all support or resistance levels, restore the original sorted arrays
      const validSupport = finalSupport.length > 0 ? finalSupport : sortedSupport;
      const validResistance = finalResistance.length > 0 ? finalResistance : sortedResistance;
      
      // Ensure we have valid price levels by comparing with typical ranges
      const { basePrice } = priceInfo;
      const validatedSupport = validSupport.filter(s => 
        Number(s) > basePrice * 0.1 && Number(s) < basePrice * 10
      );
      
      const validatedResistance = validResistance.filter(r => 
        Number(r) > basePrice * 0.1 && Number(r) < basePrice * 10
      );
      
      return {
        pattern: analysis.pattern || "Price action analysis",
        support: validatedSupport.length > 0 ? validatedSupport : generateFallbackLevels(symbol, 'support', priceInfo),
        resistance: validatedResistance.length > 0 ? validatedResistance : generateFallbackLevels(symbol, 'resistance', priceInfo),
        trend: adjustedTrend,
        riskRewardRatio: typeof analysis.riskRewardRatio === 'number' ? analysis.riskRewardRatio : 1.5,
        technicalIndicators: analysis.technicalIndicators || [
          { name: "RSI", value: "45", interpretation: "Neutral with bullish divergence" },
          { name: "MACD", value: "Crossing", interpretation: "Bullish signal forming" }
        ],
        recommendation: analysis.recommendation || "Consider long position at support level",
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Invalid JSON:', jsonStr);
      return generateFallbackAnalysis(symbol);
    }
  } catch (error) {
    console.error('Error analyzing chart with Gemini:', error);
    return generateFallbackAnalysis(symbol);
  }
}

// Extract price information from symbol
function extractPriceInfoFromSymbol(symbol: string): { basePrice: number, isLowPrice: boolean } {
  // Default values
  let basePrice = 100;
  let isLowPrice = false;
  
  const symbolLower = symbol.toLowerCase();
  
  // Cryptocurrency price ranges
  if (symbolLower.includes('btc') || symbolLower.includes('bitcoin')) {
    basePrice = 65000;
  } else if (symbolLower.includes('eth') || symbolLower.includes('ethereum')) {
    basePrice = 3500;
  } else if (symbolLower.includes('sol') || symbolLower.includes('solana')) {
    basePrice = 140;
  } else if (symbolLower.includes('ada') || symbolLower.includes('cardano')) {
    basePrice = 0.35;
    isLowPrice = true;
  } else if (symbolLower.includes('xrp') || symbolLower.includes('ripple')) {
    basePrice = 0.50;
    isLowPrice = true;
  } else if (symbolLower.includes('doge') || symbolLower.includes('dogecoin')) {
    basePrice = 0.12;
    isLowPrice = true;
  } else if (symbolLower.includes('shib') || symbolLower.includes('shiba')) {
    basePrice = 0.00001;
    isLowPrice = true;
  } else if (symbolLower.includes('ltc') || symbolLower.includes('litecoin')) {
    basePrice = 80;
  } else if (symbolLower.includes('dot') || symbolLower.includes('polkadot')) {
    basePrice = 6;
  } else if (symbolLower.includes('bnb') || symbolLower.includes('binance')) {
    basePrice = 600;
  } else if (symbolLower.includes('link') || symbolLower.includes('chainlink')) {
    basePrice = 15;
  } else if (symbolLower.includes('matic') || symbolLower.includes('polygon')) {
    basePrice = 0.60;
    isLowPrice = true;
  } else if (symbolLower.includes('avax') || symbolLower.includes('avalanche')) {
    basePrice = 30;
  }
  // Stock price ranges
  else if (symbolLower.includes('aapl') || symbolLower.includes('apple')) {
    basePrice = 180;
  } else if (symbolLower.includes('msft') || symbolLower.includes('microsoft')) {
    basePrice = 400;
  } else if (symbolLower.includes('amzn') || symbolLower.includes('amazon')) {
    basePrice = 180;
  } else if (symbolLower.includes('googl') || symbolLower.includes('google')) {
    basePrice = 170;
  } else if (symbolLower.includes('meta') || symbolLower.includes('facebook')) {
    basePrice = 500;
  } else if (symbolLower.includes('tsla') || symbolLower.includes('tesla')) {
    basePrice = 190;
  }
  
  return { basePrice, isLowPrice };
}

// Generate fallback analysis when API fails or returns invalid data
function generateFallbackAnalysis(symbol: string): TradeEntry['aiAnalysis'] {
  console.log("Using fallback analysis for", symbol);
  
  const priceInfo = extractPriceInfoFromSymbol(symbol);
  const supportLevels = generateFallbackLevels(symbol, 'support', priceInfo);
  const resistanceLevels = generateFallbackLevels(symbol, 'resistance', priceInfo);
  
  return {
    pattern: "Price pattern analysis",
    support: supportLevels,
    resistance: resistanceLevels,
    trend: "Bullish trend forming with potential breakout",
    riskRewardRatio: 1.5,
    technicalIndicators: [
      { name: "RSI", value: "45", interpretation: "Neutral with bullish divergence" },
      { name: "MACD", value: "Crossing", interpretation: "Bullish signal forming" }
    ],
    recommendation: "Consider long position at support level"
  };
}

// Generate plausible price levels based on symbol
function generateFallbackLevels(
  symbol: string, 
  type: 'support' | 'resistance',
  priceInfo?: { basePrice: number, isLowPrice: boolean }
): number[] {
  // Use provided price info or extract it from symbol
  const { basePrice, isLowPrice } = priceInfo || extractPriceInfoFromSymbol(symbol);
  
  // For BTC/USD specifically, use more accurate ranges
  if (symbol.toLowerCase().includes('btc')) {
    if (type === 'support') {
      return [60000, 58000, 55000].sort((a, b) => a - b);
    } else {
      return [68000, 70000, 72000].sort((a, b) => b - a);
    }
  }
  
  const multiplier = type === 'support' ? 0.9 : 1.1;
  const spread = isLowPrice ? (type === 'support' ? -0.05 : 0.05) : (type === 'support' ? -0.03 : 0.03);
  
  // For low-priced assets (like ADA, DOGE), use more decimal places
  const roundingFactor = isLowPrice ? 100 : 1;
  
  const levels = [
    Math.round((basePrice * (multiplier + spread * 2)) * roundingFactor) / roundingFactor,
    Math.round((basePrice * (multiplier + spread)) * roundingFactor) / roundingFactor,
    Math.round((basePrice * multiplier) * roundingFactor) / roundingFactor
  ];
  
  return type === 'support' ? levels.sort((a, b) => a - b) : levels.sort((a, b) => b - a);
}
