
import { Brain } from 'lucide-react';

interface AnalyzeButtonProps {
  onClick: () => void;
  isAnalyzing: boolean;
}

export function AnalyzeButton({ onClick, isAnalyzing }: AnalyzeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center py-2 px-4 rounded-md transition-all duration-300 ${
        isAnalyzing 
          ? 'bg-tron-blue/20 border border-tron-blue/40 cursor-wait'
          : 'bg-tron-blue/80 hover:bg-tron-blue border border-tron-cyan/50 hover:shadow-tron-sm'
      }`}
      disabled={isAnalyzing}
    >
      {isAnalyzing ? (
        <>
          <div className="w-4 h-4 mr-2 rounded-full border-2 border-tron-cyan border-t-transparent animate-spin"></div>
          Analyzing...
        </>
      ) : (
        <>
          <Brain size={16} className="mr-2" />
          Analyze Chart
        </>
      )}
    </button>
  );
}
