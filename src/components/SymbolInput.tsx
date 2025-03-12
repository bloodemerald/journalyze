
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface SymbolInputProps {
  symbol: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SymbolInput({ symbol, onChange }: SymbolInputProps) {
  return (
    <div className="w-1/3">
      <label className="block font-medium text-sm mb-2 text-tron-cyan">Symbol</label>
      <div className="relative">
        <input
          type="text"
          name="symbol"
          value={symbol || ''}
          onChange={onChange}
          placeholder="e.g. BTC/USD"
          className="input-field w-full pl-10"
          required
        />
        <TrendingUp size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tron-blue/70" />
      </div>
    </div>
  );
}
