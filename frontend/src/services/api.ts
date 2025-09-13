import type { Task, Meeting, DashboardMetrics, ApiResponse, TaskFilters } from '../types';

// Configuration de base de l'API
const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Dashboard APIs
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Obtenir seulement les tâches pour simplifier
      const tasksResponse = await this.request<{tasks: Task[], total: number}>('/all-tasks');
      const allTasks = tasksResponse.tasks || [];
      
      const now = new Date();
      const urgent_tasks = allTasks.filter(t => t.priorite === 'urgent').length;
      const completed_tasks = allTasks.filter(t => t.statut === 'completed').length;
      const overdue_tasks = allTasks.filter(t => 
        t.deadline && new Date(t.deadline) < now && t.statut !== 'completed'
      ).length;

      return {
        total_tasks: allTasks.length,
        urgent_tasks,
        completed_tasks,
        overdue_tasks,
        pending_meetings: 0, // Simplifié pour l'instant
        daily_activity: []
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        total_tasks: 0,
        urgent_tasks: 0,
        completed_tasks: 0,
        overdue_tasks: 0,
        pending_meetings: 0,
        daily_activity: []
      };
    }
  }

  // Tasks APIs
  async getAllTasks(filters?: TaskFilters): Promise<{tasks: Task[], total: number}> {
    let endpoint = '/all-tasks';
    const params = new URLSearchParams();

    if (filters?.status?.length) {
      params.append('status', filters.status.join(','));
    }
    if (filters?.priority?.length) {
      params.append('priority', filters.priority.join(','));
    }
    if (filters?.department?.length) {
      params.append('department', filters.department.join(','));
    }
    if (filters?.responsable?.length) {
      params.append('responsable', filters.responsable.join(','));
    }
    if (filters?.tags?.length) {
      params.append('tags', filters.tags.join(','));
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request<{tasks: Task[], total: number}>(endpoint);
  }

  // Nouvelle méthode pour la page Tasks avec pagination et tri
  async getTasksWithPagination(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    order?: 'asc' | 'desc';
    search?: string;
    status?: string;
    priority?: string;
  }): Promise<{tasks: Task[], total: number, page: number, limit: number, totalPages: number}> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.order) queryParams.append('order', params.order);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);

    const endpoint = `/all-tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<unknown>(endpoint);
    
    // Adapter la réponse du backend
    const tasks = Array.isArray(response) ? response : (response as any)?.tasks || [];
    const total = Array.isArray(response) ? response.length : (response as any)?.total || tasks.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    
    return {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getTaskById(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(task: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<ApiResponse<Task>>('/tasks/create', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<ApiResponse<Task>>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async validateTask(id: string): Promise<ApiResponse<Task>> {
    return this.request<ApiResponse<Task>>(`/tasks/${id}/validate`, {
      method: 'PATCH',
    });
  }

  async rejectTask(id: string, reason?: string): Promise<ApiResponse<Task>> {
    const endpoint = `/tasks/${id}/reject${reason ? `?rejection_reason=${encodeURIComponent(reason)}` : ''}`;
    return this.request<ApiResponse<Task>>(endpoint, {
      method: 'PATCH',
    });
  }

  async completeTask(id: string): Promise<ApiResponse<Task>> {
    return this.request<ApiResponse<Task>>(`/tasks/${id}/complete`, {
      method: 'PATCH',
    });
  }

  async addComment(id: string, comment: string, author: string): Promise<ApiResponse<Task>> {
    return this.request<ApiResponse<Task>>(`/tasks/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ comment, author }),
    });
  }

  // Meetings APIs
  async getAllMeetings(): Promise<Meeting[]> {
    const response = await this.request<{meetings: Meeting[], total: number}>('/meetings');
    return response.meetings;
  }

  async createMeeting(meetingData: Partial<Meeting>): Promise<ApiResponse<Meeting>> {
    return this.request<ApiResponse<Meeting>>('/meetings/create', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  }

  async uploadMeetingTranscription(formData: FormData): Promise<ApiResponse<{ processed: number; tasks_extracted: number }>> {
    return this.request<ApiResponse<{ processed: number; tasks_extracted: number }>>('/meetings/process', {
      method: 'POST',
      body: formData,
    });
  }

  async processMeetingTranscription(transcriptionData: {
    titre: string;
    transcription: string;
    participants?: string[];
    date_reunion?: string;
    organisateur?: string;
    departement?: string;
    projet_associe?: string;
  }): Promise<ApiResponse<{ processed: number; tasks_extracted: number }>> {
    return this.request<ApiResponse<{ processed: number; tasks_extracted: number }>>('/meetings/transcription-simple', {
      method: 'POST',
      body: JSON.stringify(transcriptionData),
    });
  }

  async getMeetingsWithFilters(filters?: {
    departement?: string;
    type_reunion?: string;
    statut?: string;
  }): Promise<{ meetings: Meeting[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.departement) params.append('departement', filters.departement);
    if (filters?.type_reunion) params.append('type_reunion', filters.type_reunion);
    if (filters?.statut) params.append('statut', filters.statut);

    const endpoint = `/meetings${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<{ meetings: Meeting[]; total: number }>(endpoint);
  }

  async processMeetings(): Promise<ApiResponse<{ processed: number; tasks_extracted: number }>> {
    return this.request<ApiResponse<{ processed: number; tasks_extracted: number }>>('/traiter-meetings');
  }

  // Tags APIs
  async getAllTags(): Promise<string[]> {
    return this.request<string[]>('/tasks/tags');
  }

  async getPopularTags(limit: number = 10): Promise<string[]> {
    return this.request<string[]>(`/tasks/tags/popular?limit=${limit}`);
  }

  // System APIs
  async getSystemHealth(): Promise<{ status: string; details: Record<string, unknown> }> {
    return this.request<{ status: string; details: Record<string, unknown> }>('/monitoring/system_health');
  }

  async getCacheStats(): Promise<{ hits: number; misses: number; total: number }> {
    return this.request<{ hits: number; misses: number; total: number }>('/cache/stats');
  }

  async getWatcherStatus(): Promise<{ status: string; active: boolean }> {
    return this.request<{ status: string; active: boolean }>('/watcher/status');
  }

  // Priority Tasks Helper
  async getPriorityTasks(limit: number = 6): Promise<Task[]> {
    const response = await this.getAllTasks();
    const allTasks = response.tasks || [];
    
    // Trier par priorité et statut
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const statusOrder = { pending: 3, in_progress: 2, completed: 1, rejected: 0 };
    
    return allTasks
      .filter(task => task.statut === 'pending' || task.statut === 'in_progress')
      .sort((a, b) => {
        const priorityDiff = (priorityOrder[b.priorite as keyof typeof priorityOrder] || 1) - 
                            (priorityOrder[a.priorite as keyof typeof priorityOrder] || 1);
        if (priorityDiff !== 0) return priorityDiff;
        
        const statusDiff = (statusOrder[b.statut as keyof typeof statusOrder] || 1) - 
                          (statusOrder[a.statut as keyof typeof statusOrder] || 1);
        return statusDiff;
      })
      .slice(0, limit);
  }

  // Méthode pour récupérer les statistiques globales des tâches
  async getTaskStats(): Promise<{
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
  }> {
    return this.request('/tasks/stats');
  }
}

export const apiService = new ApiService();

// Export des méthodes spécifiques pour React Query
export const getAllTasks = (filters?: TaskFilters) => apiService.getAllTasks(filters);
export const getDashboardMetrics = () => apiService.getDashboardMetrics();
export const getSystemHealth = () => apiService.getSystemHealth();

export default apiService;
