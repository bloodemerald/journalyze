
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NewEntryHeaderProps {
  onSave: (e: React.FormEvent) => void; // Updated to accept a form event parameter
  checklistComplete: boolean;
}

export function NewEntryHeader({ onSave, checklistComplete }: NewEntryHeaderProps) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Link 
          to="/dashboard" 
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Journal
        </Link>
        
        <button
          onClick={onSave} // This will now correctly pass the event
          className={`px-5 py-2.5 rounded-md flex items-center font-medium transition-all duration-300 ${
            !checklistComplete 
              ? 'bg-primary/30 text-white/70 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary/90 hover:shadow-tron-sm'
          }`}
          disabled={!checklistComplete}
        >
          <Save size={16} className="mr-2" />
          Save Entry
        </button>
      </div>
      
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 tron-text-glow">New Trade Entry</h1>
        <p className="text-muted-foreground">Capture and analyze your trading opportunity</p>
      </div>
    </>
  );
}
