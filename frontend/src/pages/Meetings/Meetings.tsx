import React, { useState } from 'react';
import { CheckCircle, XCircle, Edit, Eye, Upload, Search, Calendar, Users, Clock, Building } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAllMeetings } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import { LoadingState, ErrorState } from '../../components/ui';

// Types pour les réunions
interface Meeting {
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
    role: string;
  };
  participants: Array<{
    nom: string;
    email: string;
    role: string;
    present: boolean;
    excuse?: string;
  }>;
  ordre_du_jour: string[];
  transcription: string;
  departement: string;
  projet_associe?: string;
  priorite_meeting: string;
  type_reunion: string;
  statut_traitement: string;
  date_ajout: string;
  tags: string[];
  fichiers_associes: any[];
  decisions_prises: string[];
  actions_identifiees: Array<{
    description: string;
    responsable: string;
    deadline?: string;
    priorite: string;
    statut?: string;
  }>;
  nb_taches_extraites: number;
  resume_reunion: string;
  points_importants: string[];
  prochaines_etapes: string[];
}

interface MeetingStats {
  total_meetings: number;
  total_tasks: number;
  pending_validation: number;
  validated_tasks: number;
}

const Meetings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('processed');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    department: '',
    status: ''
  });

  const queryClient = useQueryClient();

  // Récupération des données des réunions
  const { data, isLoading, error, refetch } = useAllMeetings();

  // Mutation pour traiter une réunion
  const processMeetingMutation = useMutation({
    mutationFn: () => apiService.processMeetings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    }
  });

  // Mutation pour valider une tâche
  const validateTaskMutation = useMutation({
    mutationFn: ({ taskId, action }: { taskId: string; action: 'validate' | 'reject' }) =>
      action === 'validate'
        ? apiService.validateTask(taskId)
        : apiService.rejectTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    }
  });

  // Calcul des statistiques
  const calculateStats = (meetings: Meeting[]): MeetingStats => {
    const totalMeetings = meetings.length;
    const totalTasks = meetings.reduce((sum, meeting) =>
      sum + (meeting.actions_identifiees?.length || 0), 0);
    const pendingValidation = meetings.filter(m =>
      m.statut_traitement === 'traité' &&
      m.actions_identifiees?.some(task => !task.statut || task.statut === 'pending')
    ).length;
    const validatedTasks = meetings.reduce((sum, meeting) =>
      sum + (meeting.actions_identifiees?.filter(task => task.statut === 'completed').length || 0), 0);

    return {
      total_meetings: totalMeetings,
      total_tasks: totalTasks,
      pending_validation: pendingValidation,
      validated_tasks: validatedTasks
    };
  };

  // Filtrage des réunions
  const filterMeetings = (meetings: Meeting[]) => {
    return meetings.filter(meeting => {
      const matchesSearch = !searchTerm ||
        meeting.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.organisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.departement.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !filters.type || meeting.type_reunion === filters.type;
      const matchesDepartment = !filters.department || meeting.departement === filters.department;
      const matchesStatus = !filters.status || meeting.statut_traitement === filters.status;

      return matchesSearch && matchesType && matchesDepartment && matchesStatus;
    });
  };

  // Séparation des réunions par statut
  const pendingMeetings = data?.filter((m: Meeting) => m.statut_traitement === 'non_traité') || [];
  const processedMeetings = data?.filter((m: Meeting) => m.statut_traitement === 'traité') || [];

  const filteredProcessedMeetings = filterMeetings(processedMeetings);
  const stats = data ? calculateStats(data) : {
    total_meetings: 0,
    total_tasks: 0,
    pending_validation: 0,
    validated_tasks: 0
  };

  if (isLoading) {
    return <LoadingState message="Chargement des réunions..." className="min-h-96" />;
  }

  if (error) {
    return (
      <ErrorState
        message="Erreur lors du chargement des réunions"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header avec statistiques */}
      <div className="bg-white shadow-sm border-b p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎯 Gestion des Réunions
            </h1>
            <p className="text-gray-600 mt-2">
              Validation et suivi des tâches extraites automatiquement des réunions
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Upload size={18} />
            Nouvelle Réunion
          </button>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-blue-600">Réunions traitées</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2">{stats.total_meetings}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-sm font-medium text-green-600">Tâches extraites</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">{stats.total_tasks}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="text-yellow-600" size={20} />
              <span className="text-sm font-medium text-yellow-600">En attente validation</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-2">{stats.pending_validation}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="text-purple-600" size={20} />
              <span className="text-sm font-medium text-purple-600">Tâches validées</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-2">{stats.validated_tasks}</p>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-2 border-b-2 font-medium ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            En Attente ({pendingMeetings.length})
          </button>
          <button
            onClick={() => setActiveTab('processed')}
            className={`py-4 px-2 border-b-2 font-medium ${
              activeTab === 'processed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Traitées ({processedMeetings.length})
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      {activeTab === 'processed' && (
        <div className="bg-white p-4 border-b">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par titre, organisateur, département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Tous types</option>
              <option value="planification">Planification</option>
              <option value="retrospective">Rétrospective</option>
              <option value="brainstorming">Brainstorming</option>
              <option value="general">Général</option>
            </select>

            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Tous départements</option>
              <option value="IT">IT</option>
              <option value="RH">RH</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Tous statuts</option>
              <option value="traité">Traité</option>
              <option value="non_traité">Non traité</option>
            </select>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'pending' ? (
          <PendingMeetingsSection
            meetings={pendingMeetings}
            onProcessMeeting={() => processMeetingMutation.mutate()}
            isProcessing={processMeetingMutation.isPending}
          />
        ) : (
          <ProcessedMeetingsSection
            meetings={filteredProcessedMeetings}
            onValidateTask={(taskId, action) => validateTaskMutation.mutate({ taskId, action })}
            onViewMeeting={setSelectedMeeting}
            isValidating={validateTaskMutation.isPending}
          />
        )}
      </div>

      {/* Modal d'upload */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}

      {/* Modal de détails de réunion */}
      {selectedMeeting && (
        <MeetingDetailsModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}
    </div>
  );
};

// Composant pour les réunions en attente
const PendingMeetingsSection: React.FC<{
  meetings: Meeting[];
  onProcessMeeting: () => void;
  isProcessing: boolean;
}> = ({ meetings, onProcessMeeting, isProcessing }) => {
  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Calendar size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réunion en attente</h3>
        <p className="text-gray-600">
          Toutes les réunions ont été traitées. Les nouvelles réunions apparaîtront ici automatiquement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map(meeting => (
        <div key={meeting.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{meeting.titre}</h3>
              <p className="text-sm text-gray-600 mt-1">
                📅 {meeting.date_reunion} • 🕐 {meeting.heure_debut}-{meeting.heure_fin}
              </p>
              <p className="text-sm text-gray-600">
                👥 {meeting.participants.length} participants • 🏢 {meeting.departement}
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                En attente
              </span>
              <p className="text-sm text-gray-500 mt-2">
                {meeting.transcription?.length || 0} caractères de transcription
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onProcessMeeting()}
              disabled={isProcessing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle size={18} />
              {isProcessing ? 'Traitement...' : 'Traiter avec IA'}
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              Modifier métadonnées
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant pour les réunions traitées
const ProcessedMeetingsSection: React.FC<{
  meetings: Meeting[];
  onValidateTask: (taskId: string, action: 'validate' | 'reject') => void;
  onViewMeeting: (meeting: Meeting) => void;
  isValidating: boolean;
}> = ({ meetings, onValidateTask, onViewMeeting, isValidating }) => {
  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Search size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réunion trouvée</h3>
        <p className="text-gray-600">
          Aucune réunion ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {meetings.map(meeting => (
        <div key={meeting.id} className="bg-white rounded-lg shadow">
          {/* En-tête de la réunion */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{meeting.titre}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p>📅 {meeting.date_reunion}</p>
                    <p>🕐 {meeting.heure_debut} - {meeting.heure_fin} ({meeting.duree_minutes}min)</p>
                  </div>
                  <div>
                    <p>🏢 {meeting.departement}</p>
                    <p>👤 {meeting.organisateur.nom}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  meeting.statut_traitement === 'traité'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {meeting.statut_traitement === 'traité' ? 'Traitée' : 'En cours'}
                </span>
                <p className="text-sm text-gray-500 mt-2">
                  {meeting.nb_taches_extraites} tâches extraites
                </p>
                <button
                  onClick={() => onViewMeeting(meeting)}
                  className="mt-2 text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Eye size={16} />
                  Détails
                </button>
              </div>
            </div>
          </div>

          {/* Résumé IA */}
          {meeting.resume_reunion && (
            <div className="p-6 bg-blue-50 border-b">
              <h4 className="font-medium text-gray-900 mb-2">📝 Résumé IA</h4>
              <p className="text-sm text-gray-700">{meeting.resume_reunion}</p>

              {meeting.points_importants?.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-sm text-gray-900 mb-2">Points importants :</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {meeting.points_importants.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tâches extraites */}
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">
              🎯 Tâches Extraites ({meeting.actions_identifiees?.length || 0})
            </h4>

            {meeting.actions_identifiees?.length > 0 ? (
              <div className="space-y-3">
                {meeting.actions_identifiees.map((task, taskIdx) => (
                  <div key={taskIdx} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>👤 {task.responsable}</span>
                          {task.deadline && <span>⏰ {task.deadline}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priorite === 'Haute' ? 'bg-red-100 text-red-800' :
                          task.priorite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priorite}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.statut === 'completed' ? 'bg-green-100 text-green-800' :
                          task.statut === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.statut || 'pending'}
                        </span>
                      </div>
                    </div>

                    {/* Actions de validation */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onValidateTask(`task_${meeting.id}_${taskIdx}`, 'validate')}
                        disabled={isValidating || task.statut === 'completed'}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        Valider
                      </button>
                      <button
                        onClick={() => onValidateTask(`task_${meeting.id}_${taskIdx}`, 'reject')}
                        disabled={isValidating || task.statut === 'rejected'}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle size={14} />
                        Rejeter
                      </button>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1">
                        <Edit size={14} />
                        Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune tâche extraite pour cette réunion</p>
              </div>
            )}
          </div>

          {/* Participants et métadonnées */}
          <div className="p-6 bg-gray-50 rounded-b-lg">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Participants ({meeting.participants.length})
                </h5>
                <div className="space-y-2">
                  {meeting.participants.map((participant, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{participant.nom}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{participant.role}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          participant.present
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {participant.present ? 'Présent' : 'Absent'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Building size={16} />
                  Métadonnées
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{meeting.type_reunion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projet:</span>
                    <span className="font-medium">{meeting.projet_associe || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lieu:</span>
                    <span className="font-medium">{meeting.lieu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priorité:</span>
                    <span className={`font-medium ${
                      meeting.priorite_meeting === 'élevée' ? 'text-red-600' :
                      meeting.priorite_meeting === 'moyenne' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {meeting.priorite_meeting}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Modal d'upload de nouvelle réunion
const UploadModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    titre: '',
    date_reunion: '',
    type_reunion: 'general',
    departement: '',
    transcription: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'upload vers le backend
    console.log('Upload data:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Importer une Nouvelle Réunion</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de la réunion *
              </label>
              <input
                type="text"
                required
                value={formData.titre}
                onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Planning Sprint Q4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de la réunion *
              </label>
              <input
                type="date"
                required
                value={formData.date_reunion}
                onChange={(e) => setFormData(prev => ({ ...prev, date_reunion: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de réunion
              </label>
              <select
                value={formData.type_reunion}
                onChange={(e) => setFormData(prev => ({ ...prev, type_reunion: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">Général</option>
                <option value="planification">Planification</option>
                <option value="retrospective">Rétrospective</option>
                <option value="brainstorming">Brainstorming</option>
                <option value="reunion_client">Réunion client</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département
              </label>
              <select
                value={formData.departement}
                onChange={(e) => setFormData(prev => ({ ...prev, departement: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner...</option>
                <option value="IT">IT</option>
                <option value="RH">RH</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transcription ou fichier
            </label>
            <textarea
              value={formData.transcription}
              onChange={(e) => setFormData(prev => ({ ...prev, transcription: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 h-32"
              placeholder="Collez la transcription de la réunion ici, ou sélectionnez un fichier..."
            />
            <input
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              className="mt-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Traiter la réunion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de détails de réunion
const MeetingDetailsModal: React.FC<{
  meeting: Meeting;
  onClose: () => void;
}> = ({ meeting, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{meeting.titre}</h2>
              <p className="text-gray-600 mt-1">
                📅 {meeting.date_reunion} • 🕐 {meeting.heure_debut}-{meeting.heure_fin}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Transcription complète */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">📝 Transcription Complète</h3>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {meeting.transcription || "Aucune transcription disponible"}
              </p>
            </div>
          </div>

          {/* Ordre du jour */}
          {meeting.ordre_du_jour?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">📋 Ordre du Jour</h3>
              <ul className="space-y-2">
                {meeting.ordre_du_jour.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 font-medium">{idx + 1}.</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Décisions prises */}
          {meeting.decisions_prises?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">✅ Décisions Prises</h3>
              <ul className="space-y-2">
                {meeting.decisions_prises.map((decision, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span className="text-gray-700">{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prochaines étapes */}
          {meeting.prochaines_etapes?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">🚀 Prochaines Étapes</h3>
              <ul className="space-y-2">
                {meeting.prochaines_etapes.map((etape, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span className="text-gray-700">{etape}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetings;
