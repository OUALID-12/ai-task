import { useState, useEffect } from 'react';
import { getDashboardMetrics, getSystemHealth } from './services/api';

interface DashboardMetrics {
  total_tasks: number;
  urgent_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  pending_meetings: number;
  daily_activity: any[];
}

interface SystemHealth {
  status: string;
  details: Record<string, any>;
}

function SimpleDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_tasks: 0,
    urgent_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
    pending_meetings: 0,
    daily_activity: []
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({ status: 'loading', details: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsData, healthData] = await Promise.all([
          getDashboardMetrics(),
          getSystemHealth()
        ]);
        setMetrics(metricsData);
        setSystemHealth(healthData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingTasks = metrics.total_tasks - metrics.completed_tasks - metrics.overdue_tasks;

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>📊 Dashboard Simple</h1>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Tâches</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#333' }}>
            {loading ? '...' : metrics.total_tasks}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Terminées</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#22c55e' }}>
            {loading ? '...' : metrics.completed_tasks}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>En Attente</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#f59e0b' }}>
            {loading ? '...' : pendingTasks}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Système</h3>
          <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: systemHealth.status === 'healthy' ? '#22c55e' : '#dc2626' }}>
            {loading ? '...' : (systemHealth.status === 'healthy' ? '✅ OK' : '❌ Erreur')}
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📈 Statistiques Supplémentaires</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Tâches Urgentes:</strong> {loading ? '...' : metrics.urgent_tasks}
          </div>
          <div>
            <strong>Tâches En Retard:</strong> {loading ? '...' : metrics.overdue_tasks}
          </div>
          <div>
            <strong>Réunions en Attente:</strong> {loading ? '...' : metrics.pending_meetings}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleDashboard;
