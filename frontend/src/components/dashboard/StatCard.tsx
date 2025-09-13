import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles: Record<NonNullable<StatCardProps['variant']>, string> = {
  default:
    'bg-white/90 backdrop-blur-sm border-gray-200',
  primary:
    'bg-gradient-to-br from-primary-50 to-white border-primary-200',
  success:
    'bg-gradient-to-br from-success-50 to-white border-green-200',
  warning:
    'bg-gradient-to-br from-warning-50 to-white border-amber-200',
  danger:
    'bg-gradient-to-br from-error-50 to-white border-red-200',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon = '📊',
  trend,
  className = '',
  variant = 'default'
}) => {
  return (
    <div className={`
      ${variantStyles[variant]}
      rounded-xl shadow-sm border p-5 
      transition-all duration-300 hover:shadow-lg 
      hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-primary-200
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-3" aria-hidden="true">{icon}</span>
            <h3 className="text-xs font-semibold text-secondary-700 uppercase tracking-wide">
              {title}
            </h3>
          </div>
          
          <div className="mb-2">
            <span className="text-3xl font-bold text-secondary-900 block">
              {value}
            </span>
            {subtitle && (
              <span className="text-sm text-secondary-600 mt-1 block">{subtitle}</span>
            )}
          </div>
          
          {trend && (
            <div className={`
              inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5
              ${trend.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
            `}>
              <span className="mr-1" aria-hidden="true">{trend.isPositive ? '📈' : '📉'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-secondary-500 ml-1">ce mois</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
