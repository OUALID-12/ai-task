import { useState, useCallback } from 'react';

export interface TaskFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  assignee?: string[];
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  source?: string[];
  department?: string[];
  validated?: boolean;
}

export const useTaskFilters = () => {
  const [filters, setFilters] = useState<TaskFilters>({});

  // Ajouter/Modifier un filtre
  const updateFilter = useCallback((key: keyof TaskFilters, value: TaskFilters[keyof TaskFilters]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Ajouter une valeur à un filtre array (status, priority, etc.)
  const addFilterValue = useCallback((key: keyof TaskFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: [...(prev[key] as string[] || []), value]
    }));
  }, []);

  // Supprimer une valeur d'un filtre array
  const removeFilterValue = useCallback((key: keyof TaskFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[] || []).filter(v => v !== value)
    }));
  }, []);

  // Supprimer complètement un filtre
  const clearFilter = useCallback((key: keyof TaskFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      // Pour la recherche, mettre une string vide au lieu de delete
      if (key === 'search') {
        newFilters[key] = '';
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
  }, []);

  // Supprimer tous les filtres
  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Vérifier si des filtres sont actifs (EXCLURE la recherche)
  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(key => {
      // Exclure la recherche du comptage des filtres
      if (key === 'search') return false;
      
      const value = filters[key as keyof TaskFilters];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined && v !== '');
      }
      return value !== undefined && value !== '';
    });
  }, [filters]);

  // Compter le nombre de filtres actifs (EXCLURE la recherche)
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    Object.keys(filters).forEach(key => {
      // Exclure la recherche du comptage des filtres
      if (key === 'search') return;
      
      const value = filters[key as keyof TaskFilters];
      if (Array.isArray(value)) {
        count += value.length;
      } else if (typeof value === 'object' && value !== null) {
        count += Object.values(value).filter(v => v !== undefined && v !== '').length;
      } else if (value !== undefined && value !== '') {
        count += 1;
      }
    });
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    addFilterValue,
    removeFilterValue,
    clearFilter,
    clearAllFilters,
    hasActiveFilters: hasActiveFilters(),
    activeFiltersCount: getActiveFiltersCount()
  };
};
