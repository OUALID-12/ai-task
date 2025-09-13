import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge, LoadingState, ErrorState, AnimatedCounter } from '../../components/ui';
import { useDashboardMetrics, useSystemHealth } from '../../hooks/useApi';
import useApiConnection from '../../hooks/useApiConnection';
import { AlertCircle, CheckCircle2, Clock3, Flame } from 'lucide-react';
import apiService from '../../services/api';

const Dashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth();
  const { isConnected, isLoading: connectionLoading, error: connectionError, serverInfo } = useApiConnection();

  // Affichage d'erreur si pas de connexion
  if (connectionError && !isConnected) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble de votre système d'extraction de tâches IA
          </p>
        </div>
        
        <ErrorState 
          title="Connexion API Impossible"
          message={`Impossible de se connecter au serveur backend: ${connectionError}`}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Affichage de chargement initial
  if (connectionLoading || metricsLoading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble de votre système d'extraction de tâches IA
          </p>
        </div>
        
        <LoadingState message="Chargement des métriques du dashboard..." />
      </div>
    );
  }

  // Tâches prioritaires (UI only)
  const [priorityTasks, setPriorityTasks] = useState<Array<any>>([]);
  const [priorityLoading, setPriorityLoading] = useState<boolean>(true);
  const [priorityError, setPriorityError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPriority = async () => {
      try {
        const tasks = await apiService.getPriorityTasks(6);
        if (!mounted) return;
        setPriorityTasks(tasks);
      } catch (e) {
        if (!mounted) return;
        setPriorityError('Impossible de charger les tâches prioritaires');
      } finally {
        if (!mounted) return;
        setPriorityLoading(false);
      }
    };
    fetchPriority();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent" aria-label="Dashboard principal">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble de votre système d'extraction de tâches IA
        </p>
        
        {/* Indicateur de connexion API */}
        <div className="flex items-center gap-2 mt-3">
          <StatusBadge status={isConnected ? 'completed' : 'pending'} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'API Connectée' : 'API Déconnectée'}
          </span>
          {serverInfo && (
            <span className="text-xs text-gray-500">
              v{serverInfo.version} - Uptime: {Math.floor((serverInfo.uptime || 0) / 60)}min
            </span>
          )}
        </div>
      </div>

      {/* Métriques KPIs - DONNÉES RÉELLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 flex-shrink-0">
        {[
          { title: 'Total Tâches', value: metrics?.total_tasks || 0, status: 'active' as const, Icon: CheckCircle2, iconClass: 'text-green-600' },
          { title: 'Urgentes', value: metrics?.urgent_tasks || 0, status: 'failed' as const, Icon: Flame, iconClass: 'text-red-600' },
          { title: 'Terminées', value: metrics?.completed_tasks || 0, status: 'completed' as const, Icon: CheckCircle2, iconClass: 'text-emerald-600' },
          { title: 'En Retard', value: metrics?.overdue_tasks || 0, status: 'pending' as const, Icon: Clock3, iconClass: 'text-amber-600' },
        ].map(({ title, value, status, Icon, iconClass }) => (
          <Card key={title} variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={iconClass} size={18} aria-hidden="true" />
                  <div className="text-sm font-medium text-secondary-600">{title}</div>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="text-3xl font-bold text-secondary-900">
                <AnimatedCounter value={Number(value)} duration={400} />
              </div>
              <div className="text-xs text-secondary-500 mt-1">Données temps réel</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section principale - DONNÉES SYSTÈME */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Santé du système */}
        <Card variant="default" className="flex flex-col lg:col-span-1">
          <CardHeader>
            <CardTitle>Santé du Système</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {healthLoading ? (
              <LoadingState message="Chargement des métriques système..." />
            ) : systemHealth ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <StatusBadge status={systemHealth.status === 'healthy' ? 'completed' : 'failed'} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>{(systemHealth.details.cpu_usage as number)?.toFixed(1) || 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>{(systemHealth.details.memory_usage as number)?.toFixed(1) || 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Connections</span>
                    <span>{(systemHealth.details.active_connections as number) || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span>{Math.floor(((systemHealth.details.uptime as number) || 0) / 60)} minutes</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-secondary-500">
                <AlertCircle size={16} aria-hidden="true" /> Données système non disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card variant="default" className="flex flex-col lg:col-span-1">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {metricsError ? (
                <ErrorState 
                  title="Erreur de chargement"
                  message="Impossible de charger les données d'activité"
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Réunions en attente</span>
                    <span className="font-medium">{metrics?.pending_meetings || 0}</span>
                  </div>
                  {/* Mini tendance placeholder (non-bloquant) */}
                  <div className="mt-3">
                    <div className="text-xs text-secondary-500 mb-1">Activité hebdo</div>
                    <div className="flex items-end gap-1 h-16" aria-label="Graphique activité hebdomadaire">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="w-6 bg-secondary-200 rounded" style={{ height: `${8 + i * 4}px` }} />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-secondary-500 mt-4">
                    Phase 3.1 : Dashboard avec données réelles ✅ Complétée
                  </div>
                  <div className="text-xs text-secondary-500">
                    Prochaine étape : Phase 3.2 - Gestion des tâches en temps réel
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tâches prioritaires */}
        <Card variant="default" className="flex flex-col lg:col-span-1">
          <CardHeader>
            <CardTitle>Tâches prioritaires</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {priorityLoading ? (
              <LoadingState message="Chargement des tâches prioritaires..." />
            ) : priorityError ? (
              <ErrorState title="Erreur" message={priorityError} />
            ) : priorityTasks.length === 0 ? (
              <div className="text-sm text-secondary-500">Aucune tâche prioritaire pour le moment</div>
            ) : (
              <ul className="space-y-3" role="list" aria-label="Liste des tâches prioritaires">
                {priorityTasks.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-secondary-900 truncate" title={t.description}>{t.description}</div>
                      <div className="text-xs text-secondary-500 mt-0.5">{t.responsable || '—'}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                        t.priorite === 'urgent' ? 'bg-red-50 text-red-700' :
                        t.priorite === 'high' ? 'bg-amber-50 text-amber-700' :
                        t.priorite === 'medium' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                      }`}>{t.priorite}</span>
                      <StatusBadge status={t.statut === 'completed' ? 'completed' : t.statut === 'in_progress' ? 'active' : 'pending'} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
