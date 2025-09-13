export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in progress' | 'completed' | 'failed' | string;
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  failedTasks: number;
  completionRate: number;
  averageCompletionTime?: number;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  memoryUsage?: number;
  cpuUsage?: number;
  lastCheck: string;
}
