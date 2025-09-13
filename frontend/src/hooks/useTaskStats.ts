import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface TaskStats {
  total: number;
  by_status: {
    completed: number;
    in_progress: number;
    pending: number;
    rejected: number;
  };
  by_priority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  completion_rate: number;
}

export const useTaskStats = () => {
  return useQuery<TaskStats>({
    queryKey: ['taskStats'],
    queryFn: async (): Promise<TaskStats> => {
      return await apiService.getTaskStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
