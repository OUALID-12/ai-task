import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
    />
  );
};

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Chargement...', 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
};

export const PageLoading: React.FC = () => (
  <LoadingState message="Chargement de la page..." className="min-h-[400px]" />
);

export default LoadingSpinner;
