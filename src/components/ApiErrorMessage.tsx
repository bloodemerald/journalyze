
import { AlertTriangle } from 'lucide-react';

interface ApiErrorMessageProps {
  error: string;
}

export function ApiErrorMessage({ error }: ApiErrorMessageProps) {
  return (
    <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md text-red-400 text-sm">
      <div className="flex items-start">
        <AlertTriangle size={16} className="mr-2 mt-0.5 text-red-400" />
        <div>
          <p className="font-medium">API Error</p>
          <p>{error}</p>
          <p className="mt-2 text-xs">Note: Gemini Pro Vision was deprecated. The app now uses gemini-1.5-flash model.</p>
        </div>
      </div>
    </div>
  );
}
