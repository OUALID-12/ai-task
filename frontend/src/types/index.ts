// Types pour les tâches basés sur votre API backend
export interface Task {
  id: string;
  description: string;
  responsable: string;
  priorite: 'low' | 'medium' | 'high' | 'urgent';
  statut: 'pending' | 'in_progress' | 'completed' | 'rejected';
  deadline: string;
  department: string;
  source: string;
  confiance_ia: number; // Correction: utiliser le bon nom du champ
  context_meeting?: string;
  validation_status: 'pending' | 'validated' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  tags: string[];
  comments?: TaskComment[];
  history?: TaskHistoryEntry[];
  source_metadata?: TaskSourceMetadata; // Ajout des métadonnées de source
}

// Types pour les commentaires
export interface TaskComment {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

// Types pour l'historique
export interface TaskHistoryEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user?: string;
}

// Types pour les métadonnées de source
export interface TaskSourceMetadata {
  // Pour les emails
  email_id?: string;
  original_email?: {
    expediteur: string;
    destinataire: string;
    objet: string;
    date_reception: string;
    resume_contenu: string;
    departement?: {
      nom: string;
      origine: string;
    };
  };

  // Pour les réunions
  meeting_id?: string;
  meeting_titre?: string;
  meeting_date?: string;
  meeting_participants?: string[];
  original_meeting?: {
    titre: string;
    date: string;
    organisateur: string;
    participants: string[];
    departement: string;
    projet: string;
    type_reunion: string;
  };

  // Pour les tâches manuelles
  title?: string;
  description?: string;
  department?: string;
  created_via?: string;
}

// Types pour les réunions (correspondant à la réponse backend)
export interface Meeting {
  id: string;
  titre: string;
  date_reunion: string;
  heure_debut: string;
  heure_fin: string;
  duree_minutes: number;
  lieu: string;
  organisateur: {
    nom: string;
    email: string;
  };
  participants: {
    nom: string;
    email: string;
  }[];
  ordre_du_jour: string[];
  transcription: string;
  departement: string;
  projet_associe: string;
  priorite_meeting: string;
  type_reunion: string;
  statut_traitement: string;
  date_ajout: string;
  tags: string[];
  fichiers_associes: {
    nom: string;
    chemin: string;
  }[];
  decisions_prises: string[];
}

// Types pour les métriques du dashboard
export interface DashboardMetrics {
  total_tasks: number;
  urgent_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  pending_meetings: number;
  daily_activity: DailyActivity[];
}

export interface DailyActivity {
  date: string;
  tasks_created: number;
  tasks_completed: number;
}

// Types pour les filtres
export interface TaskFilters {
  search?: string;
  status?: Task['statut'][];
  priority?: Task['priorite'][];
  department?: string[];
  tags?: string[];
  responsable?: string[];
  date_from?: string;
  date_to?: string;
}

// Types pour l'API
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

// Types pour l'état global
export interface AppState {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
