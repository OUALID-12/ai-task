import React from 'react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  variant?: 'default' | 'network' | 'permission' | 'notFound';
}

const errorVariants = {
  default: {
    icon: '⚠️',
    title: 'Une erreur est survenue',
    message: 'Quelque chose s\'est mal passé. Veuillez réessayer.'
  },
  network: {
    icon: '🔄',
    title: 'Problème de connexion',
    message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
  },
  permission: {
    icon: '🔒',
    title: 'Accès refusé',
    message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.'
  },
  notFound: {
    icon: '🔍',
    title: 'Page non trouvée',
    message: 'La page que vous recherchez n\'existe pas ou a été déplacée.'
  }
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  onGoHome,
  className = '',
  variant = 'default'
}) => {
  const config = errorVariants[variant];
  
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[400px] ${className}`}>
      <div className="text-6xl mb-4">
        {config.icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || config.title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {message || config.message}
      </p>
      <div className="flex gap-3">
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            🔄 Réessayer
          </button>
        )}
        {onGoHome && (
          <button 
            onClick={onGoHome} 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            🏠 Retour à l'accueil
          </button>
        )}
      </div>
    </div>
  );
};

export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState variant="network" onRetry={onRetry} />
);

export const NotFoundError: React.FC<{ onGoHome?: () => void }> = ({ onGoHome }) => (
  <ErrorState variant="notFound" onGoHome={onGoHome} />
);

export const PermissionError: React.FC<{ onGoHome?: () => void }> = ({ onGoHome }) => (
  <ErrorState variant="permission" onGoHome={onGoHome} />
);

export default ErrorState;
