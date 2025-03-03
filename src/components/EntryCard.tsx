
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ExternalLink } from 'lucide-react';
import { TradeEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EntryCardProps {
  entry: TradeEntry;
  className?: string;
}

export function EntryCard({ entry, className }: EntryCardProps) {
  const date = new Date(entry.timestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const isProfit = entry.profit !== undefined && entry.profit > 0;
  
  return (
    <Link 
      to={`/dashboard/${entry.id}`}
      className={cn(
        "block glass-card p-5 transition-all duration-300 hover:shadow-subtle-lg group",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden bg-muted">
          <img 
            src={entry.chartImageUrl}
            alt={entry.symbol}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="absolute bottom-1 left-1 right-1 text-xs font-medium text-white/90 truncate">
            {entry.symbol}
          </div>
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">
                  {entry.symbol}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {entry.position === 'long' ? 'Long' : entry.position === 'short' ? 'Short' : 'Unspecified'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formattedDate}
              </p>
            </div>
            
            {entry.profit !== undefined && (
              <div className={cn(
                "text-right flex-shrink-0 px-3 py-1 rounded-md text-sm font-medium",
                isProfit ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                <div className="flex items-center gap-1">
                  {isProfit ? (
                    <ArrowUp size={14} className="text-green-600" />
                  ) : (
                    <ArrowDown size={14} className="text-red-600" />
                  )}
                  {isProfit ? '+' : ''}{entry.profit.toFixed(2)}
                </div>
                <div className="text-xs opacity-80">
                  {entry.profitPercentage !== undefined && (
                    <>{isProfit ? '+' : ''}{entry.profitPercentage.toFixed(2)}%</>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {entry.aiAnalysis?.pattern && (
            <div className="mt-2 flex items-center flex-wrap gap-2">
              <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {entry.aiAnalysis.pattern}
              </span>
              
              {entry.aiAnalysis.technicalIndicators?.slice(0, 2).map((indicator, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
                >
                  {indicator.name}: {indicator.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink size={14} className="text-muted-foreground" />
      </div>
    </Link>
  );
}
