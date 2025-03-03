
import { TradeEntry, User } from './types';

// Simple temporary storage
class LocalStore {
  private readonly ENTRIES_KEY = 'trading-journal-entries';
  private readonly USER_KEY = 'trading-journal-user';

  private mockUser: User = {
    id: '1',
    name: 'Trader',
    email: 'trader@example.com'
  };

  constructor() {
    // Initialize with demo data if empty
    if (!this.getEntries().length) {
      this.initializeDemoData();
    }
  }

  private initializeDemoData() {
    const demoEntries: TradeEntry[] = [
      {
        id: '1',
        timestamp: Date.now() - 86400000 * 2, // 2 days ago
        symbol: 'BTC/USDT',
        chartImageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
        entryPrice: 43250,
        exitPrice: 45100,
        position: 'long',
        sentiment: 'bullish',
        aiAnalysis: {
          pattern: 'Double Bottom',
          support: [41200, 42800],
          resistance: [45000, 47500],
          trend: 'Upward reversal',
          riskRewardRatio: 2.8,
          technicalIndicators: [
            { name: 'RSI', value: '38', interpretation: 'Approaching oversold' },
            { name: 'MACD', value: 'Crossing', interpretation: 'Bullish signal' }
          ],
          recommendation: 'Strong entry point with clear support level'
        },
        notes: 'Followed plan, entered at support',
        profit: 1850,
        profitPercentage: 4.28
      }
    ];
    
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(demoEntries));
    localStorage.setItem(this.USER_KEY, JSON.stringify(this.mockUser));
  }

  getEntries(): TradeEntry[] {
    const storedData = localStorage.getItem(this.ENTRIES_KEY);
    return storedData ? JSON.parse(storedData) : [];
  }

  getEntry(id: string): TradeEntry | null {
    const entries = this.getEntries();
    return entries.find(entry => entry.id === id) || null;
  }

  addEntry(entry: Omit<TradeEntry, 'id'>): TradeEntry {
    const entries = this.getEntries();
    const newEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9)
    };
    
    entries.push(newEntry);
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(entries));
    return newEntry;
  }

  updateEntry(id: string, updates: Partial<TradeEntry>): TradeEntry | null {
    const entries = this.getEntries();
    const index = entries.findIndex(entry => entry.id === id);
    
    if (index === -1) return null;
    
    const updatedEntry = { ...entries[index], ...updates };
    entries[index] = updatedEntry;
    
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(entries));
    return updatedEntry;
  }

  deleteEntry(id: string): boolean {
    const entries = this.getEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    
    if (filteredEntries.length === entries.length) return false;
    
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(filteredEntries));
    return true;
  }

  getUser(): User | null {
    const storedUser = localStorage.getItem(this.USER_KEY);
    return storedUser ? JSON.parse(storedUser) : this.mockUser;
  }

  updateUser(updates: Partial<User>): User {
    const user = this.getUser();
    const updatedUser = { ...user, ...updates };
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }

  // Stats calculations
  getStats() {
    const entries = this.getEntries();
    
    // Filter only completed trades
    const completedTrades = entries.filter(
      entry => entry.entryPrice && entry.exitPrice
    );
    
    if (completedTrades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        averageProfit: 0,
        profitFactor: 0
      };
    }
    
    const winningTrades = completedTrades.filter(entry => 
      (entry.position === 'long' && entry.exitPrice! > entry.entryPrice!) ||
      (entry.position === 'short' && entry.exitPrice! < entry.entryPrice!)
    );
    
    const winRate = (winningTrades.length / completedTrades.length) * 100;
    
    const totalProfit = completedTrades.reduce(
      (sum, entry) => sum + (entry.profit || 0), 0
    );
    
    const averageProfit = totalProfit / completedTrades.length;
    
    // Sum of winning trades divided by sum of losing trades (absolute values)
    const winningSum = winningTrades.reduce(
      (sum, entry) => sum + (entry.profit || 0), 0
    );
    
    const losingSum = completedTrades
      .filter(entry => !winningTrades.includes(entry))
      .reduce((sum, entry) => sum + Math.abs(entry.profit || 0), 0);
    
    const profitFactor = losingSum === 0 ? winningSum : winningSum / losingSum;
    
    return {
      totalTrades: completedTrades.length,
      winRate: winRate.toFixed(2),
      averageProfit: averageProfit.toFixed(2),
      profitFactor: profitFactor.toFixed(2)
    };
  }
}

export const store = new LocalStore();
