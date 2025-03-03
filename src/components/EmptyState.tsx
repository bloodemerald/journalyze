
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref: string;
  actionText: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  actionHref, 
  actionText,
  icon
}: EmptyStateProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        {icon || <Plus size={32} className="text-muted-foreground" />}
      </div>
      
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>
      
      <Link
        to={actionHref}
        className="bg-primary text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-primary/90 transition-colors"
      >
        {actionText}
      </Link>
    </div>
  );
}
