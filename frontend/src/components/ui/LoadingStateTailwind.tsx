import { cn } from '../../utils/cn';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = ({ 
  message = "Chargement...", 
  className 
}: LoadingStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-10 text-center",
      className
    )}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  );
};

export default LoadingState;
