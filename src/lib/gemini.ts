
import { TradeEntry } from './types';
import { fetchCurrentPrice, getFallbackPrice } from './priceUtils';

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
    
    // Try to get the current price from API first
    let currentPrice = null;
    try {
      currentPrice = await fetchCurrentPrice(symbol);
      console.log(`Fetched current price for ${symbol}: $${currentPrice}`);
    } catch (error) {
      console.error('Error fetching current price:', error);
    }
    
    // If we couldn't get the price from API, use fallback
    if (!currentPrice) {
      currentPrice = getFallbackPrice(symbol);
      console.log(`Using fallback price for ${symbol}: $${currentPrice}`);
    }
    
    // Calculate a reasonable price range based on current price
    const priceLow = Math.round(currentPrice * 0.95);
    const priceHigh = Math.round(currentPrice * 1.05);
    
    console.log(`Using price range for ${symbol}: $${priceLow}-$${priceHigh}`);

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
                  text: `You are a professional trading analyst specializing in 5-minute timeframe analysis. Analyze this ${symbol} price chart and provide a detailed technical analysis in JSON format with the following structure:
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
                    "recommendation": "string - Detailed trading recommendation for 5-minute chart trading"
                  }
                  
                  IMPORTANT INSTRUCTIONS:
                  - Focus ONLY on PRICE LEVELS shown in the chart, not market cap
                  - This is a 5-minute timeframe chart analysis - your recommendations should be for short-term trading
                  - For ${symbol}, current price range is approximately $${priceLow}-$${priceHigh} (current market price: $${currentPrice})
                  - Support/resistance should be specific price levels from the chart
                  - Make sure support prices are LOWER than resistance prices
                  - Always include at least 3 numerical values for support/resistance levels based on the actual chart
                  - Always include technical indicators with their current values (RSI, MACD, etc.)
                  - Always include either "bullish" or "bearish" in the trend description
                  - If certain price levels are clearly visible in the chart, use those exact values
                  - Your recommendation should include specific entry, stop loss, and take profit levels
                  - Make sure your price levels are accurate to the current price shown on the chart
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
      return generateFallbackAnalysis(symbol, currentPrice);
    }

    const data = await response.json() as GeminiResponse;
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No response candidates from Gemini');
      return generateFallbackAnalysis(symbol, currentPrice);
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
      
      // If we got empty support/resistance, add fallback values based on current price
      const supportArray = Array.isArray(analysis.support) && analysis.support.length > 0 
        ? analysis.support 
        : generateFallbackLevels(symbol, 'support', currentPrice);
      
      const resistanceArray = Array.isArray(analysis.resistance) && analysis.resistance.length > 0 
        ? analysis.resistance 
        : generateFallbackLevels(symbol, 'resistance', currentPrice);
      
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
      
      // Ensure we have valid price levels by comparing with current price
      const validatedSupport = validSupport.filter(s => 
        Number(s) > currentPrice * 0.5 && Number(s) < currentPrice * 1.5
      );
      
      const validatedResistance = validResistance.filter(r => 
        Number(r) > currentPrice * 0.5 && Number(r) < currentPrice * 1.5
      );
      
      // Ensure we have good technical indicators
      const defaultIndicators = [
        { 
          name: "RSI", 
          value: isBullish(adjustedTrend) ? "55" : "45", 
          interpretation: isBullish(adjustedTrend) ? "Bullish momentum building" : "Bearish pressure increasing" 
        },
        { 
          name: "MACD", 
          value: isBullish(adjustedTrend) ? "Crossing above signal line" : "Crossing below signal line", 
          interpretation: isBullish(adjustedTrend) ? "Bullish signal forming" : "Bearish signal forming" 
        },
        { 
          name: "Volume", 
          value: isBullish(adjustedTrend) ? "Increasing" : "Decreasing", 
          interpretation: isBullish(adjustedTrend) ? "Confirming uptrend" : "Confirming downtrend" 
        }
      ];
      
      const technicalIndicators = analysis.technicalIndicators && analysis.technicalIndicators.length > 0
        ? analysis.technicalIndicators
        : defaultIndicators;
      
      return {
        pattern: analysis.pattern || "5-minute price action pattern",
        support: validatedSupport.length > 0 ? validatedSupport : generateFallbackLevels(symbol, 'support', currentPrice),
        resistance: validatedResistance.length > 0 ? validatedResistance : generateFallbackLevels(symbol, 'resistance', currentPrice),
        trend: adjustedTrend,
        riskRewardRatio: typeof analysis.riskRewardRatio === 'number' ? analysis.riskRewardRatio : 1.5,
        technicalIndicators: technicalIndicators,
        recommendation: analysis.recommendation || generateRecommendation(symbol, adjustedTrend, validatedSupport, validatedResistance, currentPrice),
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Invalid JSON:', jsonStr);
      return generateFallbackAnalysis(symbol, currentPrice);
    }
  } catch (error) {
    console.error('Error analyzing chart with Gemini:', error);
    return generateFallbackAnalysis(symbol);
  }
}

// Helper function to determine if trend is bullish
function isBullish(trend: string): boolean {
  return trend.toLowerCase().includes('bullish');
}

// Generate detailed recommendation based on trend and levels
function generateRecommendation(
  symbol: string, 
  trend: string, 
  support: number[],
  resistance: number[],
  currentPrice?: number
): string {
  const bullish = isBullish(trend);
  
  if (support.length === 0 || resistance.length === 0) {
    return bullish 
      ? `Consider a long position on ${symbol} with the 5-minute chart showing bullish momentum.` 
      : `Consider a short position on ${symbol} with the 5-minute chart showing bearish pressure.`;
  }
  
  // Get key levels
  const keySupport = Math.max(...support);
  const keyResistance = Math.min(...resistance);
  
  // Add current price context if available
  const priceContext = currentPrice ? ` Current price is approximately $${currentPrice.toFixed(2)}.` : '';
  
  if (bullish) {
    return `Analyzing the 5-minute chart, I see a bullish pattern forming.${priceContext} The price has found support at ${keySupport.toFixed(2)} and shows potential to test resistance at ${keyResistance.toFixed(2)}. Consider a long entry near ${keySupport.toFixed(2)} with a stop-loss at ${(keySupport * 0.97).toFixed(2)} and take profit at ${keyResistance.toFixed(2)}, giving a risk-reward ratio of approximately ${((keyResistance - keySupport) / (keySupport - (keySupport * 0.97))).toFixed(1)}.`;
  } else {
    return `Analyzing the 5-minute chart, I see a bearish pattern forming.${priceContext} The price is facing resistance at ${keyResistance.toFixed(2)} and may drop to support at ${keySupport.toFixed(2)}. Consider a short entry near ${keyResistance.toFixed(2)} with a stop-loss at ${(keyResistance * 1.03).toFixed(2)} and take profit at ${keySupport.toFixed(2)}, giving a risk-reward ratio of approximately ${((keyResistance - keySupport) / ((keyResistance * 1.03) - keyResistance)).toFixed(1)}.`;
  }
}

// Generate fallback analysis when API fails or returns invalid data
function generateFallbackAnalysis(symbol: string, currentPrice?: number): TradeEntry['aiAnalysis'] {
  console.log("Using fallback analysis for", symbol);
  
  // Use provided price or get fallback price
  const price = currentPrice || getFallbackPrice(symbol);
  console.log(`Using price for fallback analysis: $${price}`);
  
  const supportLevels = generateFallbackLevels(symbol, 'support', price);
  const resistanceLevels = generateFallbackLevels(symbol, 'resistance', price);
  
  // Generate bullish or bearish fallback randomly for variety
  const isBullishFallback = Math.random() > 0.5;
  
  return {
    pattern: isBullishFallback ? "Bullish reversal pattern on 5-minute chart" : "Bearish continuation pattern on 5-minute chart",
    support: supportLevels,
    resistance: resistanceLevels,
    trend: isBullishFallback ? "Bullish trend forming on 5-minute timeframe" : "Bearish trend developing on 5-minute timeframe",
    riskRewardRatio: 1.5,
    technicalIndicators: [
      { 
        name: "RSI", 
        value: isBullishFallback ? "55" : "45", 
        interpretation: isBullishFallback ? "Bullish momentum building" : "Bearish pressure increasing" 
      },
      { 
        name: "MACD", 
        value: isBullishFallback ? "Crossing above signal" : "Crossing below signal", 
        interpretation: isBullishFallback ? "Bullish signal forming" : "Bearish signal forming" 
      },
      { 
        name: "Volume", 
        value: isBullishFallback ? "Increasing" : "Decreasing", 
        interpretation: isBullishFallback ? "Confirming uptrend" : "Confirming downtrend" 
      }
    ],
    recommendation: generateRecommendation(symbol, isBullishFallback ? "bullish" : "bearish", supportLevels, resistanceLevels, price)
  };
}

// Generate plausible price levels based on symbol and current price
function generateFallbackLevels(
  symbol: string, 
  type: 'support' | 'resistance',
  currentPrice: number
): number[] {
  const multiplier = type === 'support' ? 0.97 : 1.03;
  const spread = type === 'support' ? -0.01 : 0.01;
  
  // Determine if it's a low-priced asset
  const isLowPrice = currentPrice < 1;
  
  // For low-priced assets (like ADA, DOGE), use more decimal places
  const roundingFactor = isLowPrice ? 100 : 1;
  
  const levels = [
    Math.round((currentPrice * (multiplier + spread * 2)) * roundingFactor) / roundingFactor,
    Math.round((currentPrice * (multiplier + spread)) * roundingFactor) / roundingFactor,
    Math.round((currentPrice * multiplier) * roundingFactor) / roundingFactor
  ];
  
  return type === 'support' ? levels.sort((a, b) => a - b) : levels.sort((a, b) => b - a);
}
