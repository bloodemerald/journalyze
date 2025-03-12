
import { useState, useEffect } from 'react';
import { ArrowUpRight, BarChart3, Calendar, Search, SlidersHorizontal, Plus, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen pb-20 bg-background grid-bg">
      <Header />
      
      <main className="pt-24 px-6 md:px-8 max-w-6xl mx-auto">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 tron-text-glow">Trading Journal</h1>
          <p className="text-muted-foreground">
            Keep track of your trades and improve your strategy
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <StatCard 
            title="Total Trades" 
            value={stats.totalTrades.toString()} 
            icon={<BarChart3 size={20} className="text-tron-cyan" />}
            color="blue"
          />
          <StatCard 
            title="Win Rate" 
            value={`${stats.winRate}%`} 
            icon={<ArrowUpRight size={20} className="text-tron-cyan" />}
            color="green"
          />
          <StatCard 
            title="Avg. Profit" 
            value={stats.averageProfit} 
            icon={<Calendar size={20} className="text-tron-cyan" />}
            color="orange"
          />
          <StatCard 
            title="Profit Factor" 
            value={stats.profitFactor} 
            icon={<SlidersHorizontal size={20} className="text-tron-cyan" />}
            color="purple"
          />
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="glass-card p-4 rounded-xl border border-tron-blue/30 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tron-blue" />
              <input
                type="text"
                placeholder="Search by symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-tron-blue/30 bg-tron-darkBlue focus:outline-none focus:border-tron-blue/50 focus:shadow-tron-sm transition-all text-foreground"
              />
            </div>
            
            <Link
              to="/dashboard/new"
              className="bg-tron-blue text-black text-sm font-medium px-5 py-2.5 rounded-lg shadow-tron-sm hover:bg-tron-cyan hover:shadow-tron transition-all duration-300 flex items-center justify-center whitespace-nowrap"
            >
              <Plus size={16} className="mr-2" />
              New Entry
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <div 
                key={index} 
                className="h-32 rounded-xl bg-tron-darkBlue border border-tron-blue/20 animate-pulse tron-skeleton"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="glass-card p-10 rounded-xl border border-tron-blue/30 shadow-tron-sm">
            <EmptyState
              title="No entries yet"
              description="Start by adding your first trade to your journal"
              actionHref="/dashboard/new"
              actionText="Add First Trade"
              icon={<BarChart3 size={32} className="text-tron-cyan" />}
            />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="glass-card p-10 rounded-xl border border-tron-blue/30 shadow-tron-sm text-center">
            <p className="text-muted-foreground">No entries match your search for "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 text-tron-blue hover:text-tron-cyan transition-colors text-sm"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {filteredEntries
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            
            <Link 
              to="/dashboard/new" 
              className="glass-card p-6 rounded-xl border border-dashed border-tron-blue/40 flex flex-col items-center justify-center min-h-[200px] hover:bg-tron-darkBlue hover:border-tron-blue/60 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-tron-darkBlue flex items-center justify-center mb-4 border border-tron-blue/30 group-hover:shadow-tron-sm transition-all duration-300">
                <Plus size={24} className="text-tron-cyan" />
              </div>
              <h3 className="text-lg font-semibold text-tron-cyan mb-2">Add New Trade Entry</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-xs">
                Record your next trading opportunity with AI analysis
              </p>
              <span className="text-tron-blue flex items-center transition-all duration-300 group-hover:translate-x-1">
                Get started <ChevronRight size={16} className="ml-1" />
              </span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: "from-tron-blue/30 to-tron-blue/5 border-tron-blue/30",
    green: "from-green-500/30 to-green-500/5 border-green-500/30",
    orange: "from-orange-500/30 to-orange-500/5 border-orange-500/30",
    purple: "from-purple-500/30 to-purple-500/5 border-purple-500/30",
  };

  return (
    <div className={`glass-card p-5 rounded-xl border shadow-tron-sm bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-tron-cyan">{title}</h3>
        <div className="w-8 h-8 rounded-md flex items-center justify-center bg-tron-darkBlue/80 border border-tron-blue/30">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default Dashboard;
