import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface Tag {
  name: string;
  usage_count: number;
  tasks_count: number;
  last_used?: string;
  color?: string;
}

interface TagsResponse {
  message: string;
  total_unique_tags: number;
  total_tasks_with_tags: number;
  tags: {
    by_popularity: [string, number][];
    alphabetical: string[];
    counts: Record<string, number>;
  };
}

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<Tag[]> => {
      try {
        const response = await api.getAllTags() as unknown as TagsResponse;

        // Vérifier que response est bien un objet avec la structure attendue
        if (response && typeof response === 'object' && response.tags && response.tags.by_popularity) {
          return response.tags.by_popularity.map(([name, usage_count]: [string, number]) => ({
            name,
            usage_count,
            tasks_count: usage_count, // Pour l'instant, même valeur
            last_used: undefined, // Non disponible dans la réponse actuelle
            color: undefined // Non disponible dans la réponse actuelle
          }));
        }

        // Fallback si la structure est différente
        return [];
      } catch (error) {
        console.error('Error fetching tags:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};