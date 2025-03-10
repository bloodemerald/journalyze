
/**
 * Utility functions for fetching current cryptocurrency prices
 */

interface PriceResponse {
  [symbol: string]: {
    usd: number;
  };
}

/**
 * Fetches the current price for a given cryptocurrency from CoinGecko API
 * @param symbol The cryptocurrency symbol (e.g., 'btc', 'eth')
 * @returns The current price in USD
 */
export async function fetchCurrentPrice(symbol: string): Promise<number | null> {
  try {
    // Clean and normalize the symbol
    const normalizedSymbol = normalizeSymbol(symbol);
    
    // Use CoinGecko's free API to get current prices
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${normalizedSymbol}&vs_currencies=usd`
    );
    
    if (!response.ok) {
      console.error(`Error fetching price: ${response.status}`);
      return null;
    }
    
    const data = await response.json() as PriceResponse;
    
    // Check if we got price data for the requested symbol
    if (data[normalizedSymbol]?.usd) {
      return data[normalizedSymbol].usd;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching cryptocurrency price:', error);
    return null;
  }
}

/**
 * Normalizes a symbol for use with the CoinGecko API
 */
function normalizeSymbol(symbol: string): string {
  // Remove any currency pairs (e.g., BTC/USD -> btc)
  let clean = symbol.split('/')[0].toLowerCase();
  
  // Map common symbols to their CoinGecko IDs
  const mappings: {[key: string]: string} = {
    'btc': 'bitcoin',
    'eth': 'ethereum',
    'sol': 'solana',
    'ada': 'cardano',
    'xrp': 'ripple',
    'doge': 'dogecoin',
    'shib': 'shiba-inu',
    'ltc': 'litecoin',
    'dot': 'polkadot',
    'bnb': 'binancecoin',
    'link': 'chainlink',
    'matic': 'polygon',
    'avax': 'avalanche-2'
  };
  
  return mappings[clean] || clean;
}

/**
 * Gets a fallback price for a symbol when API fetch fails
 * This is used as a last resort when we can't get real-time prices
 */
export function getFallbackPrice(symbol: string): number {
  const symbolLower = symbol.toLowerCase();
  
  // Cryptocurrency fallback prices (Updated for 2024)
  if (symbolLower.includes('btc') || symbolLower.includes('bitcoin')) {
    return 82500;
  } else if (symbolLower.includes('eth') || symbolLower.includes('ethereum')) {
    return 3500;
  } else if (symbolLower.includes('sol') || symbolLower.includes('solana')) {
    return 140;
  } else if (symbolLower.includes('ada') || symbolLower.includes('cardano')) {
    return 0.55;
  } else if (symbolLower.includes('xrp') || symbolLower.includes('ripple')) {
    return 0.65;
  } else if (symbolLower.includes('doge') || symbolLower.includes('dogecoin')) {
    return 0.18;
  } else if (symbolLower.includes('shib') || symbolLower.includes('shiba')) {
    return 0.00002;
  } else if (symbolLower.includes('ltc') || symbolLower.includes('litecoin')) {
    return 95;
  } else if (symbolLower.includes('dot') || symbolLower.includes('polkadot')) {
    return 8;
  } else if (symbolLower.includes('bnb') || symbolLower.includes('binance')) {
    return 650;
  } else if (symbolLower.includes('link') || symbolLower.includes('chainlink')) {
    return 15;
  } else if (symbolLower.includes('matic') || symbolLower.includes('polygon')) {
    return 0.60;
  } else if (symbolLower.includes('avax') || symbolLower.includes('avalanche')) {
    return 35;
  }
  
  // Default fallback
  return 100;
}
