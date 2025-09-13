import React from 'react';

export interface ServerStatusProps {
  isConnected: boolean;
  serverInfo?: {
    version: string;
    uptime?: number;
    status: string;
  };
  className?: string;
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ 
  isConnected, 
  serverInfo, 
  className = '' 
}) => {
  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        icon: '🔴',
        text: 'Déconnecté',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700'
      };
    }
    
    return {
      icon: '🟢',
      text: 'Connecté',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    };
  };

  const status = getStatusInfo();
  const uptimeMinutes = serverInfo?.uptime ? Math.floor(serverInfo.uptime / 60) : 0;
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  
  return (
    <div className={`${status.bgColor} ${status.borderColor} border rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-xl">{status.icon}</div>
          <div>
            <h4 className={`font-semibold ${status.textColor}`}>
              Serveur API
            </h4>
            <p className={`text-sm ${status.textColor} opacity-80`}>
              {status.text}
            </p>
          </div>
        </div>
        
        {isConnected && (
          <div className="text-right">
            <div className="text-xs text-gray-600">
              {serverInfo?.version && (
                <div>v{serverInfo.version}</div>
              )}
              {uptimeHours > 0 ? (
                <div>{uptimeHours}h {uptimeMinutes % 60}min</div>
              ) : (
                <div>{uptimeMinutes}min</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {isConnected && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-green-600 font-medium">✓ Synchronisé</span>
          <span className="text-gray-500">
            Dernière màj: {new Date().toLocaleTimeString('fr-FR')}
          </span>
        </div>
      )}
    </div>
  );
};

export default ServerStatus;
