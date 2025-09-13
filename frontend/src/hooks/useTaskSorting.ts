import { useState, useMemo } from 'react';
import type { Task } from '../types';

export type SortField = 'description' | 'priorite' | 'statut' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface UseTaskSortingReturn {
  sortedTasks: Task[];
  paginatedTasks: Task[];
  sortConfig: SortConfig;
  paginationConfig: PaginationConfig;
  handleSort: (field: SortField) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
}

// Ordre de priorité pour le tri
const PRIORITY_ORDER = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3
};

// Ordre de statut pour le tri
const STATUS_ORDER = {
  pending: 0,
  in_progress: 1,
  completed: 2,
  rejected: 3
};

// Fonctions de comparaison
const comparePriority = (a: string, b: string, order: SortOrder): number => {
  const aValue = PRIORITY_ORDER[a as keyof typeof PRIORITY_ORDER] ?? 999;
  const bValue = PRIORITY_ORDER[b as keyof typeof PRIORITY_ORDER] ?? 999;
  const result = aValue - bValue;
  return order === 'asc' ? result : -result;
};

const compareStatus = (a: string, b: string, order: SortOrder): number => {
  const aValue = STATUS_ORDER[a as keyof typeof STATUS_ORDER] ?? 999;
  const bValue = STATUS_ORDER[b as keyof typeof STATUS_ORDER] ?? 999;
  const result = aValue - bValue;
  return order === 'asc' ? result : -result;
};

const compareString = (a: string, b: string, order: SortOrder): number => {
  const result = a.localeCompare(b, 'fr', { sensitivity: 'base' });
  return order === 'asc' ? result : -result;
};

const compareDate = (a: string, b: string, order: SortOrder): number => {
  const dateA = new Date(a).getTime();
  const dateB = new Date(b).getTime();
  const result = dateA - dateB;
  return order === 'asc' ? result : -result;
};

// Fonction principale de tri
const sortTasks = (tasks: Task[], config: SortConfig): Task[] => {
  return [...tasks].sort((a, b) => {
    switch (config.field) {
      case 'priorite':
        return comparePriority(a.priorite, b.priorite, config.order);
      case 'statut':
        return compareStatus(a.statut, b.statut, config.order);
      case 'description':
        return compareString(a.description, b.description, config.order);
      case 'created_at':
        return compareDate(a.created_at, b.created_at, config.order);
      default:
        return 0;
    }
  });
};

export const useTaskSorting = (tasks: Task[]): UseTaskSortingReturn => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'created_at',
    order: 'desc'
  });

  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    pageSize: 10
  });

  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => {
      // Si c'est le même champ, on inverse l'ordre
      if (prevConfig.field === field) {
        return {
          field,
          order: prevConfig.order === 'asc' ? 'desc' : 'asc'
        };
      }
      
      // Si c'est un nouveau champ, on commence par ascendant
      // sauf pour les dates où on préfère descendant par défaut
      const defaultOrder: SortOrder = field === 'created_at' ? 'desc' : 'asc';
      
      return {
        field,
        order: defaultOrder
      };
    });
    
    // Reset à la page 1 quand on change le tri
    setPaginationState(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPaginationState(prev => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPaginationState(prev => ({ 
      ...prev, 
      pageSize: size, 
      currentPage: 1 // Reset à la page 1 quand on change la taille
    }));
  };

  const sortedTasks = useMemo(() => {
    return sortTasks(tasks, sortConfig);
  }, [tasks, sortConfig]);

  const paginationConfig: PaginationConfig = useMemo(() => {
    const totalItems = sortedTasks.length;
    const totalPages = Math.ceil(totalItems / paginationState.pageSize);
    
    return {
      currentPage: paginationState.currentPage,
      pageSize: paginationState.pageSize,
      totalItems,
      totalPages
    };
  }, [sortedTasks.length, paginationState]);

  const paginatedTasks = useMemo(() => {
    const startIndex = (paginationState.currentPage - 1) * paginationState.pageSize;
    const endIndex = startIndex + paginationState.pageSize;
    return sortedTasks.slice(startIndex, endIndex);
  }, [sortedTasks, paginationState]);

  return {
    sortedTasks,
    paginatedTasks,
    sortConfig,
    paginationConfig,
    handleSort,
    handlePageChange,
    handlePageSizeChange
  };
};
