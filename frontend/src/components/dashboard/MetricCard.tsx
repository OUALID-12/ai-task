import React from 'react';
import Card from '../ui/Card';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  className
}) => {
  return (
    <Card className={cn('p-6 transition-all duration-300 hover:shadow-lg hover:scale-105', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <div className="text-3xl font-bold text-slate-900">
            <AnimatedCounter value={value} />
          </div>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-500 ml-1">vs période précédente</span>
            </div>
          )}
        </div>
        <div className="ml-4 p-3 bg-red-50 rounded-full text-red-600 text-2xl">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
