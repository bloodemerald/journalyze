
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
    // Remove the data URL prefix if present
    const base64Image = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${apiKey}`,
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
                  text: `You are a professional trading analyst. Analyze this ${symbol} trading chart and provide a detailed analysis in JSON format with the following structure:
                  {
                    "pattern": "string - Technical pattern identified",
                    "support": [array of numbers - Key support levels identified],
                    "resistance": [array of numbers - Key resistance levels identified],
                    "trend": "string - Current trend description",
                    "riskRewardRatio": number - Estimated risk/reward ratio if entering now",
                    "technicalIndicators": [
                      {
                        "name": "string - Indicator name (e.g., RSI, MACD)",
                        "value": "string - Current value or state",
                        "interpretation": "string - What this means"
                      }
                    ],
                    "recommendation": "string - Trading recommendation"
                  }
                  
                  Just provide the JSON without any additional text.`,
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
            temperature: 0.2,
            topK: 32,
            topP: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return null;
    }

    const data = await response.json() as GeminiResponse;
    
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    let jsonStr = textResponse;
    
    // Sometimes the API includes code block markers, let's handle that
    if (textResponse.includes('```json')) {
      jsonStr = textResponse.split('```json')[1].split('```')[0].trim();
    } else if (textResponse.includes('```')) {
      jsonStr = textResponse.split('```')[1].split('```')[0].trim();
    }
    
    const analysis = JSON.parse(jsonStr);
    
    return {
      pattern: analysis.pattern || undefined,
      support: analysis.support || [],
      resistance: analysis.resistance || [],
      trend: analysis.trend || undefined,
      riskRewardRatio: analysis.riskRewardRatio || undefined,
      technicalIndicators: analysis.technicalIndicators || [],
      recommendation: analysis.recommendation || undefined,
    };
  } catch (error) {
    console.error('Error analyzing chart with Gemini:', error);
    return null;
  }
}
