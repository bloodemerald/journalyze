
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Home, Plus, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/40 backdrop-blur-xl border-b border-tron-blue/20 px-8 flex items-center justify-between">
      <div className="flex items-center">
        <Link 
          to="/" 
          className="text-foreground font-semibold text-lg tracking-tight mr-8 flex items-center group"
        >
          <div className="w-8 h-8 rounded-md bg-tron-blue flex items-center justify-center mr-2 shadow-tron-sm transition-all duration-500 group-hover:rotate-12 group-hover:shadow-tron">
            <BarChart3 size={18} className="text-black" />
          </div>
          <span className="tron-text-glow">Journalyze</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/') 
                ? "bg-tron-darkBlue text-tron-blue shadow-tron-sm border border-tron-blue/40" 
                : "text-muted-foreground hover:text-foreground hover:bg-tron-darkBlue/60"
            )}
          >
            <span className="flex items-center">
              <Home size={16} className="mr-2" />
              Home
            </span>
          </Link>
          
          <Link
            to="/dashboard"
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/dashboard') || location.pathname.startsWith('/dashboard/')
                ? "bg-tron-darkBlue text-tron-blue shadow-tron-sm border border-tron-blue/40" 
                : "text-muted-foreground hover:text-foreground hover:bg-tron-darkBlue/60"
            )}
          >
            <span className="flex items-center">
              <BarChart3 size={16} className="mr-2" />
              Journal
            </span>
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center space-x-3">
        <Link
          to="/dashboard/new"
          className={cn(
            "bg-tron-blue text-black text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-300",
            isActive('/dashboard/new')
              ? "bg-tron-cyan/90 shadow-tron-sm"
              : "hover:bg-tron-cyan hover:shadow-tron-sm"
          )}
        >
          <span className="flex items-center">
            <Plus size={16} className="mr-2" />
            New Entry
          </span>
        </Link>
        
        <button className="w-8 h-8 rounded-full flex items-center justify-center bg-tron-darkBlue border border-tron-blue/40 transition-all duration-300 hover:shadow-tron-sm hover:bg-tron-blue/20">
          <User size={16} className="text-tron-cyan" />
        </button>
        
        <button className="w-8 h-8 rounded-full flex items-center justify-center bg-tron-darkBlue border border-tron-blue/40 transition-all duration-300 hover:shadow-tron-sm hover:bg-tron-blue/20">
          <Settings size={16} className="text-tron-cyan" />
        </button>
      </div>
    </header>
  );
}
