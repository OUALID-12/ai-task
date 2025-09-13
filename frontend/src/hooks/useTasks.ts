import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Task } from '../types';
import type { TaskFilters } from './useTaskFilters';

interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseTasksParams extends Partial<TaskFilters> {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export const useTasks = (params: UseTasksParams = {}) => {
  const {
    page = 1,
    limit = 20,
    sort_by = 'created_at',
    order = 'desc',
    search,
    status,
    priority,
    assignee,
    tags,
    dateRange,
    source,
    department,
    validated
  } = params;

  // Préparer les paramètres pour l'API
  const apiParams = {
    page,
    limit,
    sort_by,
    order,
    search,
    // Convertir les arrays en strings séparées par des virgules
    status: Array.isArray(status) ? status.join(',') : status,
    priority: Array.isArray(priority) ? priority.join(',') : priority,
    assignee: Array.isArray(assignee) ? assignee.join(',') : assignee,
    tags: Array.isArray(tags) ? tags.join(',') : tags,
    source: Array.isArray(source) ? source.join(',') : source,
    department: Array.isArray(department) ? department.join(',') : department,
    // Gérer la date range
    start_date: dateRange?.start,
    end_date: dateRange?.end,
    validated
  };

  // Nettoyer les paramètres undefined
  const cleanParams = Object.fromEntries(
    Object.entries(apiParams).filter(([, value]) => value !== undefined && value !== '')
  );

  return useQuery({
    queryKey: ['tasks', cleanParams],
    queryFn: async (): Promise<TasksResponse> => {
      try {
        return await apiService.getTasksWithPagination(cleanParams);
      } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Actualisation automatique toutes les 30s
  });
};

export default useTasks;
