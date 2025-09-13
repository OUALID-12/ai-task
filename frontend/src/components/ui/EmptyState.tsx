import React from 'react';
import { InboxIcon, SearchX } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <InboxIcon size={48} />,
  title,
  description,
  action,
  className
}) => (
  <div className={cn(
    'flex flex-col items-center justify-center p-8 text-center min-h-[300px]',
    className
  )}>
    <div className="text-secondary-400 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-secondary-900 mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-secondary-600 mb-6 max-w-md">
        {description}
      </p>
    )}
    {action && (
      <Button onClick={action.onClick} variant="primary">
        {action.label}
      </Button>
    )}
  </div>
);

export const EmptySearch: React.FC<{ query?: string; onClear?: () => void }> = ({ 
  query, 
  onClear 
}) => (
  <EmptyState
    icon={<SearchX size={48} />}
    title="Aucun résultat trouvé"
    description={
      query 
        ? `Aucun élément ne correspond à "${query}". Essayez un autre terme de recherche.`
        : "Aucun élément ne correspond à vos critères de recherche."
    }
    action={onClear ? { label: 'Effacer la recherche', onClick: onClear } : undefined}
  />
);

export const EmptyList: React.FC<{ 
  title: string; 
  description?: string; 
  onAdd?: () => void; 
  addLabel?: string;
}> = ({ 
  title, 
  description, 
  onAdd, 
  addLabel = 'Ajouter le premier élément' 
}) => (
  <EmptyState
    icon={<InboxIcon size={48} />}
    title={title}
    description={description}
    action={onAdd ? { label: addLabel, onClick: onAdd } : undefined}
  />
);

export default EmptyState;
