
import React from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import { TradeEntry } from '@/lib/types';

interface TradeDetailsFormProps {
  form: Partial<TradeEntry>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  calculateProfit: () => void;
}

export function TradeDetailsForm({
  form,
  handleChange,
  handleNumberChange,
  calculateProfit
}: TradeDetailsFormProps) {
  return (
    <div className="space-y-6 glass-card p-6 rounded-xl border border-tron-blue/30 shadow-tron-sm">
      <h2 className="text-xl font-semibold text-tron-cyan mb-4 flex items-center">
        <Zap size={18} className="mr-2" />
        Trade Details
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-sm mb-2 text-foreground">Position</label>
          <select
            name="position"
            value={form.position || ''}
            onChange={handleChange}
            className="input-field w-full bg-tron-darkBlue"
          >
            <option value="">Select</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
        
        <div>
          <label className="block font-medium text-sm mb-2 text-foreground">Sentiment</label>
          <select
            name="sentiment"
            value={form.sentiment || ''}
            onChange={handleChange}
            className="input-field w-full bg-tron-darkBlue"
          >
            <option value="">Select</option>
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-sm mb-2 text-foreground">Entry Price</label>
          <input
            type="number"
            name="entryPrice"
            value={form.entryPrice || ''}
            onChange={handleNumberChange}
            onBlur={calculateProfit}
            className="input-field w-full bg-tron-darkBlue"
            step="0.01"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block font-medium text-sm mb-2 text-foreground">Exit Price</label>
          <input
            type="number"
            name="exitPrice"
            value={form.exitPrice || ''}
            onChange={handleNumberChange}
            onBlur={calculateProfit}
            className="input-field w-full bg-tron-darkBlue"
            step="0.01"
            placeholder="0.00"
          />
        </div>
      </div>
      
      {form.profit !== undefined && form.profitPercentage !== undefined && (
        <div className={`p-3 rounded-md text-sm flex items-center ${
          form.profit > 0 
            ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
            : 'bg-red-900/20 border border-red-500/30 text-red-400'
        }`}>
          <TrendingUp size={16} className="mr-2" />
          <span>
            Potential {form.profit > 0 ? 'Profit' : 'Loss'}: {form.profit.toFixed(2)} ({form.profitPercentage.toFixed(2)}%)
          </span>
        </div>
      )}
      
      <div>
        <label className="block font-medium text-sm mb-2 text-foreground">Notes</label>
        <textarea
          name="notes"
          value={form.notes || ''}
          onChange={handleChange}
          className="input-field w-full min-h-[120px] bg-tron-darkBlue"
          placeholder="Add your trade notes here..."
        />
      </div>
    </div>
  );
}
