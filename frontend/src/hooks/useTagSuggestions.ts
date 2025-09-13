import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useTagSuggestions = (description?: string) => {
  return useQuery({
    queryKey: ['tagSuggestions', description],
    queryFn: async (): Promise<string[]> => {
      try {
        if (!description || description.trim().length === 0) {
          // Si pas de description, retourner les tags populaires
          const popularResponse = await api.getPopularTags(10);
          return popularResponse || [];
        }

        const response = await api.getTagSuggestions(description);

        if (response && response.suggested_tags) {
          return response.suggested_tags;
        }

        return [];
      } catch (error) {
        console.error('Error fetching tag suggestions:', error);
        return [];
      }
    },
    enabled: !!description || description === '', // S'exécute même si description est vide
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};