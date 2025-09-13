import type { Task } from '../../types';

interface TaskChartProps {
  tasks: Task[];
  title: string;
}

export const TaskChart = ({ tasks, title }: TaskChartProps) => {
  const getStatusCounts = () => {
    const statusCounts = tasks.reduce((acc, task) => {
      const status = task.statut || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = tasks.length;
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: getStatusColor(status)
    }));
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#22c55e';
      case 'in_progress':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const chartData = getStatusCounts();

  return (
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
        {title}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {chartData.map(({ status, count, percentage, color }) => (
          <div key={status} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: color
              }}></div>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                textTransform: 'capitalize'
              }}>
                {status}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <span style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {count}
              </span>
              <div style={{
                width: '64px',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: color,
                  width: `${percentage}%`,
                  transition: 'width 0.5s ease-out'
                }}></div>
              </div>
              <span style={{
                fontSize: '12px',
                color: '#9ca3af',
                width: '32px',
                textAlign: 'right'
              }}>
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '32px 0',
          color: '#6b7280'
        }}>
          <p>Aucune donnée disponible</p>
        </div>
      )}
    </div>
  );
};

export default TaskChart;
