
import { useState, useEffect } from 'react';
import { ArrowUpRight, BarChart3, Calendar, Search, SlidersHorizontal } from 'lucide-react';
import { Header } from '@/components/Header';
import { EntryCard } from '@/components/EntryCard';
import { EmptyState } from '@/components/EmptyState';
import { TradeEntry } from '@/lib/types';
import { store } from '@/lib/store';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: '0',
    averageProfit: '0',
    profitFactor: '0'
  });

  useEffect(() => {
    // Load entries
    const loadData = () => {
      setIsLoading(true);
      try {
        const entriesData = store.getEntries();
        const statsData = store.getStats();
        
        setEntries(entriesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Setup listener for storage changes from other tabs
    const handleStorageChange = () => {
      loadData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filteredEntries = entries.filter(entry => 
    entry.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Header />
      
      <main className="pt-24 px-6 md:px-8 max-w-6xl mx-auto">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Trading Journal</h1>
          <p className="text-muted-foreground">
            Keep track of your trades and improve your strategy
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <StatCard 
            title="Total Trades" 
            value={stats.totalTrades.toString()} 
            icon={<BarChart3 size={20} className="text-primary" />}
          />
          <StatCard 
            title="Win Rate" 
            value={`${stats.winRate}%`} 
            icon={<ArrowUpRight size={20} className="text-green-500" />}
          />
          <StatCard 
            title="Avg. Profit" 
            value={stats.averageProfit} 
            icon={<Calendar size={20} className="text-orange-500" />}
          />
          <StatCard 
            title="Profit Factor" 
            value={stats.profitFactor} 
            icon={<SlidersHorizontal size={20} className="text-purple-500" />}
          />
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            <Link
              to="/dashboard/new"
              className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center whitespace-nowrap"
            >
              New Entry
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <div 
                key={index} 
                className="h-32 rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            title="No entries yet"
            description="Start by adding your first trade to your journal"
            actionHref="/dashboard/new"
            actionText="Add First Trade"
            icon={<BarChart3 size={32} className="text-muted-foreground" />}
          />
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No entries match your search</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {filteredEntries
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
          </div>
        )}
      </main>
    </div>
  );
};

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default Dashboard;
