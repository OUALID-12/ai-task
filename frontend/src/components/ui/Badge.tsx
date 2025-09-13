import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const badgeVariants = {
  variant: {
    default: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    success: 'bg-success-100 text-success-700 border-success-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    error: 'bg-error-100 text-error-700 border-error-200',
  },
  size: {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  },
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center font-medium rounded-full border',
        // Variant styles
        badgeVariants.variant[variant],
        // Size styles
        badgeVariants.size[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn(
          'w-2 h-2 rounded-full mr-2',
          variant === 'primary' && 'bg-primary-500',
          variant === 'success' && 'bg-success-500',
          variant === 'warning' && 'bg-warning-500',
          variant === 'error' && 'bg-error-500',
          variant === 'secondary' && 'bg-secondary-500',
          variant === 'default' && 'bg-secondary-500',
        )} />
      )}
      {children}
    </span>
  );
};

// Badges spécialisés pour les statuts
export const StatusBadge: React.FC<{ status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed' }> = ({ status }) => {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Actif', dot: true },
    inactive: { variant: 'secondary' as const, label: 'Inactif', dot: true },
    pending: { variant: 'warning' as const, label: 'En attente', dot: true },
    completed: { variant: 'success' as const, label: 'Terminé', dot: true },
    failed: { variant: 'error' as const, label: 'Échec', dot: true },
  };

  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} dot={config.dot}>
      {config.label}
    </Badge>
  );
};

export const PriorityBadge: React.FC<{ priority: 'low' | 'medium' | 'high' | 'urgent' }> = ({ priority }) => {
  const priorityConfig = {
    low: { variant: 'secondary' as const, label: 'Faible' },
    medium: { variant: 'warning' as const, label: 'Moyenne' },
    high: { variant: 'primary' as const, label: 'Élevée' },
    urgent: { variant: 'error' as const, label: 'Urgente' },
  };

  const config = priorityConfig[priority];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export default Badge;
