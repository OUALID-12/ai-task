/**
 * Hooks React Query pour l'API AI Task Extraction
 * Gère le cache, les mutations et l'état de chargement
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Task, TaskFilters } from '../types';

// Query keys pour une gestion cohérente du cache
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  dashboardMetrics: () => [...queryKeys.dashboard, 'metrics'] as const,
  
  tasks: ['tasks'] as const,
  allTasks: (filters?: TaskFilters) => [...queryKeys.tasks, 'all', filters] as const,
  taskById: (id: string) => [...queryKeys.tasks, 'detail', id] as const,
  taskTags: () => [...queryKeys.tasks, 'tags'] as const,
  
  meetings: ['meetings'] as const,
  allMeetings: () => [...queryKeys.meetings, 'all'] as const,
  
  system: ['system'] as const,
  systemHealth: () => [...queryKeys.system, 'health'] as const,
  cacheStats: () => [...queryKeys.system, 'cache'] as const,
  watcherStatus: () => [...queryKeys.system, 'watcher'] as const,
} as const;

// Hooks pour le Dashboard
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: queryKeys.dashboardMetrics(),
    queryFn: () => apiService.getDashboardMetrics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Rafraîchit toutes les 2 minutes
  });
};

// Hooks pour les Tasks
export const useAllTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: queryKeys.allTasks(filters),
    queryFn: () => apiService.getAllTasks(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useTaskById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.taskById(id),
    queryFn: () => apiService.getTaskById(id),
    enabled: !!id,
  });
};

export const useTaskTags = () => {
  return useQuery({
    queryKey: queryKeys.taskTags(),
    queryFn: () => apiService.getAllTags(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hooks pour les Meetings
export const useAllMeetings = () => {
  return useQuery({
    queryKey: queryKeys.allMeetings(),
    queryFn: () => apiService.getAllMeetings(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hooks pour le System
export const useSystemHealth = () => {
  return useQuery({
    queryKey: queryKeys.systemHealth(),
    queryFn: () => apiService.getSystemHealth(),
    staleTime: 1000 * 30, // 30 secondes
    refetchInterval: 1000 * 60, // Rafraîchit toutes les minutes
  });
};

export const useCacheStats = () => {
  return useQuery({
    queryKey: queryKeys.cacheStats(),
    queryFn: () => apiService.getCacheStats(),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useWatcherStatus = () => {
  return useQuery({
    queryKey: queryKeys.watcherStatus(),
    queryFn: () => apiService.getWatcherStatus(),
    staleTime: 1000 * 30, // 30 secondes
  });
};

// Mutations pour les Tasks
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (task: Partial<Task>) => apiService.createTask(task),
    onSuccess: () => {
      // Invalider le cache des tâches pour forcer un nouveau fetch
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics() });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, task }: { id: string; task: Partial<Task> }) => 
      apiService.updateTask(id, task),
    onSuccess: (_, { id }) => {
      // Invalider le cache pour cette tâche spécifique et la liste
      queryClient.invalidateQueries({ queryKey: queryKeys.taskById(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics() });
    },
  });
};

export const useValidateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.validateTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskById(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics() });
    },
  });
};

export const useRejectTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      apiService.rejectTask(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskById(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics() });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.completeTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskById(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics() });
    },
  });
};

// Mutations pour les Meetings
export const useProcessMeetings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiService.processMeetings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics() });
    },
  });
};

// Hook combiné pour les statistiques détaillées
export const useTaskStats = () => {
  const { data: tasksData, ...query } = useAllTasks();
  
  const stats = React.useMemo(() => {
    if (!tasksData?.tasks) return null;
    
    const tasks = tasksData.tasks;
    const byStatus = tasks.reduce((acc, task) => {
      acc[task.statut] = (acc[task.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byPriority = tasks.reduce((acc, task) => {
      acc[task.priorite] = (acc[task.priorite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byDepartment = tasks.reduce((acc, task) => {
      acc[task.department] = (acc[task.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: tasks.length,
      byStatus,
      byPriority,
      byDepartment,
      averageConfidence: tasks.reduce((sum, task) => sum + (task.confiance_ia || 0), 0) / tasks.length,
    };
  }, [tasksData?.tasks]);
  
  return {
    ...query,
    data: stats,
  };
};

export default {
  useDashboardMetrics,
  useAllTasks,
  useTaskById,
  useTaskTags,
  useAllMeetings,
  useSystemHealth,
  useCacheStats,
  useWatcherStatus,
  useCreateTask,
  useUpdateTask,
  useValidateTask,
  useRejectTask,
  useCompleteTask,
  useProcessMeetings,
  useTaskStats,
};
