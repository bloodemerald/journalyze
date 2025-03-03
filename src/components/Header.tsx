
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Home, Plus, Shield, Sword } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-primary/20 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center">
        <Link 
          to="/" 
          className="text-primary font-semibold text-lg tracking-tight mr-8 flex items-center group"
        >
          <div className="w-8 h-8 rounded bg-primary/20 border border-primary/40 flex items-center justify-center mr-2 transition-transform duration-500 group-hover:rotate-12 ff7-glow">
            <Sword size={18} className="text-primary" />
          </div>
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Journalyze</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={cn(
              "px-4 py-2 rounded text-sm font-medium transition-colors relative overflow-hidden",
              isActive('/') 
                ? "bg-secondary text-primary before:absolute before:w-1 before:h-full before:bg-primary before:left-0 before:top-0" 
                : "text-muted-foreground hover:text-primary hover:bg-secondary/60"
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
              "px-4 py-2 rounded text-sm font-medium transition-colors relative overflow-hidden",
              isActive('/dashboard') 
                ? "bg-secondary text-primary before:absolute before:w-1 before:h-full before:bg-primary before:left-0 before:top-0" 
                : "text-muted-foreground hover:text-primary hover:bg-secondary/60"
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
          className="ff7-button text-sm"
        >
          <Plus size={16} className="mr-2" />
          New Entry
        </Link>
        
        <button className="icon-button">
          <Shield size={18} className="text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
