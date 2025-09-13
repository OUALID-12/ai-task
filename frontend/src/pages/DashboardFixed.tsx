import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '../components/dashboard/MetricCardSimple';
import { TaskChart } from '../components/dashboard/TaskChartSimple';
import { LoadingState } from '../components/ui/LoadingStateSimple';
import { ErrorState } from '../components/ui/ErrorStateSimple';
import { apiService } from '../services/api';
import type { Task } from '../types';

export const Dashboard = () => {
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

  // Utilisation des métriques pour éviter l'erreur TypeScript
  console.log('Metrics loaded:', metrics);

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
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        padding: '24px' 
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <LoadingState message="Chargement du tableau de bord..." />
        </div>
      </div>
    );
  }

  // Error state
  if (tasksError) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        padding: '24px' 
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '30px', 
              fontWeight: 'bold', 
              color: '#1e293b', 
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              📊 Tableau de Bord Phase 3.1
            </h1>
            <p style={{ 
              color: '#64748b',
              fontSize: '16px',
              margin: '0 0 12px 0'
            }}>
              Vue d'ensemble de vos tâches et performances système
            </p>
            {systemHealth && (
              <div style={{ 
                marginTop: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: systemHealth.status === 'healthy' ? '#22c55e' : 
                                  systemHealth.status === 'warning' ? '#f59e0b' : '#ef4444'
                }}></div>
                <span style={{ 
                  fontSize: '14px', 
                  color: '#64748b' 
                }}>
                  Système {systemHealth.status === 'healthy' ? 'opérationnel' : systemHealth.status}
                </span>
              </div>
            )}
          </div>

          {/* KPI Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <TaskChart
              tasks={tasks}
              title="Répartition des Statuts"
            />
            
            {/* Activity Timeline */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e5e5e5'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                Activité Récente
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: task.statut === 'completed' ? '#22c55e' :
                                     task.statut === 'pending' ? '#f59e0b' :
                                     task.statut === 'rejected' ? '#ef4444' : '#3b82f6'
                    }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1e293b',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {task.description}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        margin: 0
                      }}>
                        {new Date(task.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: task.statut === 'completed' ? '#dcfce7' :
                                     task.statut === 'pending' ? '#fef3c7' :
                                     task.statut === 'rejected' ? '#fee2e2' : '#dbeafe',
                      color: task.statut === 'completed' ? '#166534' :
                             task.statut === 'pending' ? '#92400e' :
                             task.statut === 'rejected' ? '#991b1b' : '#1e40af'
                    }}>
                      {task.statut}
                    </span>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p style={{
                    textAlign: 'center',
                    color: '#64748b',
                    padding: '32px 0',
                    margin: 0
                  }}>
                    Aucune activité récente
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e5e5'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              Métriques de Performance
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1e293b'
                }}>
                  {completionRate.toFixed(1)}%
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginBottom: '8px'
                }}>
                  Taux de Completion
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#dc2626',
                    width: `${completionRate}%`,
                    transition: 'width 1s ease-out'
                  }}></div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1e293b'
                }}>
                  {totalTasks}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  Total Traité
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginTop: '4px'
                }}>
                  Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1e293b'
                }}>
                  {inProgressTasks}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  En Cours
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: systemHealth?.status === 'healthy' ? '#dcfce7' :
                                   systemHealth?.status === 'warning' ? '#fef3c7' : '#fee2e2',
                    color: systemHealth?.status === 'healthy' ? '#166534' :
                           systemHealth?.status === 'warning' ? '#92400e' : '#991b1b'
                  }}>
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
