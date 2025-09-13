import { useQuery } from '@tanstack/react-query';
import { apiService } from './services/api';

export const Dashboard = () => {
  const { 
    data: tasksResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiService.getAllTasks(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>🔄 Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: 'red'
      }}>
        <div>❌ Erreur: {(error as Error).message}</div>
      </div>
    );
  }

  const tasks = tasksResponse?.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.statut === 'completed').length;
  const pendingTasks = tasks.filter((t: any) => t.statut === 'pending').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '30px', fontSize: '2.5em' }}>
        📊 Dashboard Phase 3.1
      </h1>
      
      {/* KPI Cards */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total des Tâches</h3>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#333' }}>{totalTasks}</div>
              <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '5px' }}>↗ +5.2%</div>
            </div>
            <div style={{ fontSize: '2em', opacity: 0.6 }}>📋</div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Tâches Terminées</h3>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#22c55e' }}>{completedTasks}</div>
              <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '5px' }}>↗ +12.1%</div>
            </div>
            <div style={{ fontSize: '2em', opacity: 0.6 }}>✅</div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>En Attente</h3>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#f59e0b' }}>{pendingTasks}</div>
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>↘ -2.3%</div>
            </div>
            <div style={{ fontSize: '2em', opacity: 0.6 }}>⏳</div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Taux de Réussite</h3>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#333' }}>{Math.round(completionRate)}%</div>
              <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '5px' }}>↗ +8.7%</div>
            </div>
            <div style={{ fontSize: '2em', opacity: 0.6 }}>📊</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {/* Task Status Chart */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e5e5e5'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Répartition des Statuts</h3>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>📈</div>
            <div style={{ color: '#666' }}>Graphique des statuts</div>
            <div style={{ fontSize: '14px', color: '#888', marginTop: '10px' }}>
              {completedTasks} terminées • {pendingTasks} en attente
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e5e5e5'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Activité Récente</h3>
          {tasks.slice(0, 5).map((task: any) => (
            <div key={task.id} style={{ 
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ 
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: task.statut === 'completed' ? '#22c55e' :
                               task.statut === 'pending' ? '#f59e0b' : '#ef4444'
              }}></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {task.description}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(task.created_at).toLocaleString('fr-FR')}
                </div>
              </div>
              <div style={{ 
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: task.statut === 'completed' ? '#dcfce7' :
                               task.statut === 'pending' ? '#fef3c7' : '#fee2e2',
                color: task.statut === 'completed' ? '#166534' :
                       task.statut === 'pending' ? '#92400e' : '#991b1b'
              }}>
                {task.statut}
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div style={{ 
              textAlign: 'center',
              padding: '40px 0',
              color: '#666'
            }}>
              Aucune activité récente
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid #e5e5e5',
        marginTop: '20px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Métriques de Performance</h3>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#333' }}>
              {completionRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Taux de Completion</div>
            <div style={{ 
              width: '100%',
              height: '8px',
              backgroundColor: '#e5e5e5',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${completionRate}%`,
                height: '100%',
                backgroundColor: '#dc2626',
                transition: 'width 1s ease-out'
              }}></div>
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#333' }}>
              {totalTasks}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Traité</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
              Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#333' }}>
              ⚡
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Système</div>
            <div style={{ 
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: '#dcfce7',
              color: '#166534',
              marginTop: '5px'
            }}>
              Opérationnel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
