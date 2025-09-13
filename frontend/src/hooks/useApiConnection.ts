/**
 * Hook pour vérifier et gérer l'état de connexion avec l'API
 */

import { useState, useEffect } from 'react';

interface ServerInfo {
  app_name?: string;
  version?: string;
  status?: string;
  uptime?: number;
}

interface ApiConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastCheck: Date | null;
  serverInfo: ServerInfo | null;
}

export const useApiConnection = (checkInterval: number = 30000) => {
  const [state, setState] = useState<ApiConnectionState>({
    isConnected: false,
    isLoading: true,
    error: null,
    lastCheck: null,
    serverInfo: null,
  });

  const checkConnection = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Test simple avec l'endpoint root
      const response = await fetch('http://127.0.0.1:8001/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const serverInfo = await response.json();
        setState({
          isConnected: true,
          isLoading: false,
          error: null,
          lastCheck: new Date(),
          serverInfo,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setState({
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        lastCheck: new Date(),
        serverInfo: null,
      });
    }
  };

  useEffect(() => {
    // Vérification initiale
    checkConnection();
    
    // Vérification périodique seulement si demandée
    if (checkInterval > 0) {
      const interval = setInterval(checkConnection, checkInterval);
      return () => clearInterval(interval);
    }
  }, [checkInterval]);

  return {
    ...state,
    checkConnection,
    retryConnection: checkConnection,
  };
};

export default useApiConnection;
