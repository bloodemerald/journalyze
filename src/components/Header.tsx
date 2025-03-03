
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Home, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border px-8 flex items-center justify-between">
      <div className="flex items-center">
        <Link 
          to="/" 
          className="text-foreground font-semibold text-lg tracking-tight mr-8 flex items-center group"
        >
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center mr-2 transition-transform duration-500 group-hover:rotate-12">
            <BarChart3 size={18} className="text-white" />
          </div>
          Journalyze
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/') 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
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
              isActive('/dashboard') 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            <span className="flex items-center">
              <BarChart3 size={16} className="mr-2" />
              Journal
            </span>
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center space-x-2">
        <Link
          to="/dashboard/new"
          className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm hover:bg-primary/90 transition-colors flex items-center"
        >
          <Plus size={16} className="mr-2" />
          New Entry
        </Link>
        
        <button className="icon-button">
          <Settings size={18} className="text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
