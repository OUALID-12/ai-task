import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '../components/dashboard/MetricCard';
import { TaskChart } from '../components/dashboard/TaskChart';
import { LoadingState, ErrorState } from '../components/ui';
import { apiService } from '../services/api';
import type { Task } from '../types';

export const Dashboard: React.FC = () => {
  // Fetch all data with React Query
  const { 
    data: tasksResponse, 
    isLoading: tasksLoading, 
    error: tasksError 
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiService.getAllTasks(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { 
    data: metrics, 
    isLoading: metricsLoading 
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => apiService.getDashboardMetrics(),
    refetchInterval: 30000,
  });

  console.log('Dashboard metrics:', metrics); // Pour debug

  const { 
    data: systemHealth, 
    isLoading: healthLoading 
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => apiService.getSystemHealth(),
    refetchInterval: 10000, // More frequent for system health
  });

  // Loading state
  if (tasksLoading || metricsLoading || healthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingState message="Chargement du tableau de bord..." />
        </div>
      </div>
    );
  }

  // Error state
  if (tasksError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorState 
            message="Erreur lors du chargement des données"
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  const tasks: Task[] = tasksResponse?.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.statut === 'completed').length;
  const pendingTasks = tasks.filter(t => t.statut === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.statut === 'in_progress').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Tableau de Bord
            </h1>
            <p className="text-slate-600">
              Vue d'ensemble de vos tâches et performances système
            </p>
            {systemHealth && (
              <div className="mt-3 flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  systemHealth.status === 'healthy' ? 'bg-green-500' : 
                  systemHealth.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-slate-600">
                  Système {systemHealth.status === 'healthy' ? 'opérationnel' : systemHealth.status}
                </span>
              </div>
            )}
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total des Tâches"
              value={totalTasks}
              icon="📋"
              trend={{ value: 5.2, isPositive: true }}
            />
            <MetricCard
              title="Tâches Terminées"
              value={completedTasks}
              icon="✅"
              trend={{ value: 12.1, isPositive: true }}
            />
            <MetricCard
              title="En Attente"
              value={pendingTasks}
              icon="⏳"
              trend={{ value: 2.3, isPositive: false }}
            />
            <MetricCard
              title="Taux de Réussite"
              value={Math.round(completionRate)}
              icon="📊"
              trend={{ value: 8.7, isPositive: true }}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <TaskChart
              tasks={tasks}
              title="Répartition des Statuts"
            />
            
            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Activité Récente
              </h3>
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      task.statut === 'completed' ? 'bg-green-500' :
                      task.statut === 'pending' ? 'bg-yellow-500' :
                      task.statut === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {task.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(task.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.statut === 'completed' ? 'bg-green-100 text-green-800' :
                      task.statut === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      task.statut === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.statut}
                    </span>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-center text-slate-500 py-8">
                    Aucune activité récente
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Métriques de Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {completionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-600">Taux de Completion</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {totalTasks}
                </div>
                <div className="text-sm text-slate-600">Total Traité</div>
                <div className="mt-2 text-xs text-slate-500">
                  Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {inProgressTasks}
                </div>
                <div className="text-sm text-slate-600">En Cours</div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    systemHealth?.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    systemHealth?.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth?.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
