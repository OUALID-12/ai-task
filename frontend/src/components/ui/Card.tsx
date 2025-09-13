import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const cardVariants = {
  variant: {
    default: 'bg-white border border-secondary-200',
    bordered: 'bg-white border-2 border-primary-200',
    elevated: 'bg-white shadow-custom-lg border border-secondary-100',
    interactive: 'bg-white border border-secondary-200 hover:border-primary-300 hover:shadow-custom transition-all duration-200 cursor-pointer',
  },
  padding: {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
};

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-lg',
        // Variant styles
        cardVariants.variant[variant],
        // Padding styles
        cardVariants.padding[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Sous-composants pour structure de card
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('border-b border-secondary-200 pb-4 mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-lg font-semibold text-secondary-900', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-sm text-secondary-600 mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('border-t border-secondary-200 pt-4 mt-4', className)} {...props}>
    {children}
  </div>
);

export default Card;
