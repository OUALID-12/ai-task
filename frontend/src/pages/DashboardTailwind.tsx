import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Task } from '../types';

// Composant LoadingState inline avec Tailwind
const LoadingState = ({ message = "Chargement..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center p-10 text-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
    <p className="text-slate-600 text-sm">{message}</p>
  </div>
);

// Composant ErrorState inline avec Tailwind
const ErrorState = ({ message, onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center p-10 text-center">
    <div className="text-5xl mb-4">❌</div>
    <h3 className="text-red-600 mb-4 text-lg font-semibold">{message}</h3>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
      >
        Réessayer
      </button>
    )}
  </div>
);

// Composant MetricCard inline avec Tailwind
const MetricCard = ({ title, value, icon, trend }: {
  title: string;
  value: number;
  icon: string;
  trend?: { value: number; isPositive: boolean };
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <div className="text-3xl font-bold text-slate-900 mb-2">
          {value.toLocaleString()}
        </div>
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-slate-500 ml-1">vs période précédente</span>
          </div>
        )}
      </div>
      <div className="ml-4 p-3 bg-red-50 rounded-full text-2xl">
        {icon}
      </div>
    </div>
  </div>
);

// Composant TaskChart inline avec Tailwind
const TaskChart = ({ tasks, title }: { tasks: Task[]; title: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const chartData = Object.entries(
    tasks.reduce((acc, task) => {
      const status = task.statut || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    status,
    count,
    percentage: tasks.length > 0 ? (count / tasks.length) * 100 : 0,
    color: getStatusColor(status)
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {chartData.map(({ status, count, percentage, color }) => (
          <div key={status} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${color}`}></div>
              <span className="text-sm font-medium text-slate-700 capitalize">{status}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">{count}</span>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-500 ${color}`}
                     style={{ width: `${percentage}%` }}></div>
              </div>
              <span className="text-xs text-slate-500 w-8 text-right">{percentage.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { 
    data: tasksResponse, 
    isLoading: tasksLoading, 
    error: tasksError 
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiService.getAllTasks(),
    refetchInterval: 30000,
  });

  const { 
    data: systemHealth, 
    isLoading: healthLoading 
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => apiService.getSystemHealth(),
    refetchInterval: 10000,
  });

  if (tasksLoading || healthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingState message="Chargement du tableau de bord..." />
        </div>
      </div>
    );
  }

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
              📊 Tableau de Bord Phase 3.1
            </h1>
            <p className="text-slate-600">
              Vue d'ensemble de vos tâches et performances système
            </p>
            {systemHealth && (
              <div className="mt-3 flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  systemHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
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
            <TaskChart tasks={tasks} title="Répartition des Statuts" />
            
            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Activité Récente</h3>
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      task.statut === 'completed' ? 'bg-green-500' :
                      task.statut === 'pending' ? 'bg-yellow-500' :
                      task.statut === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{task.description}</p>
                      <p className="text-xs text-slate-500">{new Date(task.created_at).toLocaleString('fr-FR')}</p>
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
                  <p className="text-center text-slate-500 py-8">Aucune activité récente</p>
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Métriques de Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{completionRate.toFixed(1)}%</div>
                <div className="text-sm text-slate-600">Taux de Completion</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                       style={{ width: `${completionRate}%` }}></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{totalTasks}</div>
                <div className="text-sm text-slate-600">Total Traité</div>
                <div className="mt-2 text-xs text-slate-500">
                  Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{inProgressTasks}</div>
                <div className="text-sm text-slate-600">En Cours</div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    systemHealth?.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
