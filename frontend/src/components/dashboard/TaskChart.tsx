import React, { useMemo } from 'react';
import Card from '../ui/Card';
import type { Task } from '../../types';

interface TaskChartProps {
  tasks: Task[];
  title: string;
}

export const TaskChart: React.FC<TaskChartProps> = ({ tasks, title }) => {
  const chartData = useMemo(() => {
    const statusCounts = tasks.reduce((acc, task) => {
      const status = task.statut || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = tasks.length;
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count: count as number,
      percentage: total > 0 ? ((count as number) / total) * 100 : 0,
      color: getStatusColor(status)
    }));
  }, [tasks]);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'terminé':
      case 'done':
        return 'bg-green-500';
      case 'in progress':
      case 'en cours':
      case 'active':
        return 'bg-blue-500';
      case 'pending':
      case 'en attente':
        return 'bg-yellow-500';
      case 'failed':
      case 'échec':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      
      <div className="space-y-4">
        {chartData.map(({ status, count, percentage, color }) => (
          <div key={status} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${color}`}></div>
              <span className="text-sm font-medium text-slate-700 capitalize">
                {status}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">{count}</span>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-slate-500 w-8 text-right">
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>Aucune donnée disponible</p>
        </div>
      )}
    </Card>
  );
};

export default TaskChart;
