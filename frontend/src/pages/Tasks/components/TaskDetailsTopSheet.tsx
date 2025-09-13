import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Clock, MessageSquare, History, Eye, ChevronDown } from 'lucide-react';
import type { Task } from '../../../types';

interface TaskDetailsTopSheetProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailsTopSheet: React.FC<TaskDetailsTopSheetProps> = ({ task, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  const [showSourceDetails, setShowSourceDetails] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTaskAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center topsheet-backdrop transition-all duration-300">
      <div
        className={`
          relative w-full max-w-4xl mx-4 mt-20 bg-white rounded-xl shadow-2xl
          transform transition-all duration-300 ease-out
          ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
          max-h-[calc(100vh-6rem)] overflow-hidden
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-medium">👁️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Détails de la tâche</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye size={16} />
            Détails
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare size={16} />
            Commentaires ({task.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <History size={16} />
            Historique ({task.history?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {activeTab === 'details' && (
            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{task.description}</p>
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-medium">👤</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Responsable</p>
                      <p className="font-medium">{task.responsable}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-medium">📅</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Échéance</p>
                      <p className="font-medium">
                        {task.deadline ? formatDate(task.deadline) : 'Non définie'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-medium">🏢</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Département</p>
                      <p className="font-medium">{task.department || 'Non spécifié'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Statut</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.statut)}`}>
                      {task.statut === 'completed' && <CheckCircle size={14} />}
                      {task.statut === 'in_progress' && <Clock size={14} />}
                      {task.statut === 'pending' && <span>⏳</span>}
                      {task.statut === 'rejected' && <XCircle size={14} />}
                      {task.statut === 'completed' ? 'Terminée' :
                       task.statut === 'in_progress' ? 'En cours' :
                       task.statut === 'pending' ? 'En attente' : 'Rejetée'}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Priorité</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priorite)}`}>
                      {task.priorite === 'urgent' && '🚨'}
                      {task.priorite === 'high' && '⚡'}
                      {task.priorite === 'medium' && '⚠️'}
                      {task.priorite === 'low' && '📝'}
                      {task.priorite === 'urgent' ? 'Urgente' :
                       task.priorite === 'high' ? 'Haute' :
                       task.priorite === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Source</p>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-purple-600 bg-purple-50">
                      {task.source === 'email' ? '📧' : task.source === 'meeting' ? '👥' : '📝'}
                      {task.source === 'email' ? 'Email' : task.source === 'meeting' ? 'Réunion' : 'Manuel'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                      >
                        <span>🏷️</span>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Métadonnées */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations système</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <p className="text-gray-500">Créée le</p>
                    <p className="font-medium">{formatDate(task.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Modifiée le</p>
                    <p className="font-medium">{formatDate(task.updated_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Âge de la tâche</p>
                    <p className="font-medium">{calculateTaskAge(task.created_at)} jour{calculateTaskAge(task.created_at) > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Score de confiance IA</p>
                    <p className="font-medium">{Math.round((task.confiance_ia || 0) * 100)}%</p>
                  </div>
                </div>

                {/* Informations de validation humaine */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Validation Humaine</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Statut de validation</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        task.validation_status === 'validated' ? 'text-green-600 bg-green-50' :
                        task.validation_status === 'rejected' ? 'text-red-600 bg-red-50' :
                        'text-yellow-600 bg-yellow-50'
                      }`}>
                        {task.validation_status === 'validated' ? '✅ Validée' :
                         task.validation_status === 'rejected' ? '❌ Rejetée' : '⏳ En attente'}
                      </span>
                    </div>
                    {task.validation_status === 'validated' && (
                      <p className="text-xs text-green-600">Cette tâche a été validée par un humain</p>
                    )}
                    {task.validation_status === 'rejected' && (
                      <p className="text-xs text-red-600">Cette tâche a été rejetée par un humain</p>
                    )}
                    {task.validation_status === 'pending' && (
                      <p className="text-xs text-yellow-600">En attente de validation humaine</p>
                    )}
                  </div>
                </div>

                {/* Métadonnées sources détaillées */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Source et Contexte</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-purple-600 font-medium">
                            {task.source === 'email' ? '📧' : task.source === 'meeting' ? '👥' : '📝'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Source: {task.source === 'email' ? 'Email' : task.source === 'meeting' ? 'Réunion' : 'Manuel'}</p>
                          <p className="text-xs text-gray-500">
                            {task.source === 'email' && 'Extraite automatiquement d\'un email'}
                            {task.source === 'meeting' && 'Identifiée lors d\'une réunion'}
                            {task.source === 'manual' && 'Créée manuellement'}
                          </p>
                        </div>
                        {task.source_metadata && (task.source === 'email' || task.source === 'meeting') && (
                          <button
                            onClick={() => setShowSourceDetails(!showSourceDetails)}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                            <span>View More</span>
                            <ChevronDown
                              size={12}
                              className={`transform transition-transform ${showSourceDetails ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}
                      </div>

                      {task.context_meeting && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-medium text-blue-800 mb-1">Contexte de réunion</p>
                          <p className="text-xs text-blue-700">{task.context_meeting}</p>
                        </div>
                      )}

                      {/* Détails étendus des métadonnées - Only for email and meeting sources */}
                      {showSourceDetails && task.source_metadata && (task.source === 'email' || task.source === 'meeting') && (
                        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg space-y-3">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Détails de la source</h5>

                          {/* Email Source Details */}
                          {task.source === 'email' && task.source_metadata.original_email && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Email ID</p>
                                  <p className="text-sm text-gray-900">{task.source_metadata.email_id}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Expéditeur</p>
                                  <p className="text-sm text-gray-900">{task.source_metadata.original_email.expediteur}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Destinataire</p>
                                  <p className="text-sm text-gray-900">{task.source_metadata.original_email.destinataire}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Objet</p>
                                  <p className="text-sm text-gray-900">{task.source_metadata.original_email.objet}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Date de réception</p>
                                  <p className="text-sm text-gray-900">{formatDate(task.source_metadata.original_email.date_reception)}</p>
                                </div>
                                {task.source_metadata.original_email.departement && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Département</p>
                                    <p className="text-sm text-gray-900">
                                      {task.source_metadata.original_email.departement.nom}
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({task.source_metadata.original_email.departement.origine})
                                      </span>
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="mt-4">
                                <p className="text-xs font-medium text-gray-500 mb-2">Résumé du contenu</p>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-sm text-gray-700">{task.source_metadata.original_email.resume_contenu}</p>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Meeting Source Details */}
                          {task.source === 'meeting' && task.source_metadata.original_meeting && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-medium text-gray-500">ID Réunion</p>
                                  <p className="text-sm text-gray-900">{task.source_metadata.meeting_id}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Titre de la réunion</p>
                                  <p className="text-sm text-gray-900">{task.source_metadata.meeting_titre}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Date de la réunion</p>
                                  <p className="text-sm text-gray-900">{task.source_metadata.meeting_date ? formatDate(task.source_metadata.meeting_date) : 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Organisateur</p>
                                  <p className="text-sm text-gray-900">{task.source_metadata.original_meeting.organisateur}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Département</p>
                                  <p className="text-sm text-gray-900">{task.source_metadata.original_meeting.departement}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Projet</p>
                                  <p className="text-sm text-gray-900">{task.source_metadata.original_meeting.projet}</p>
                                </div>
                              </div>
                              <div className="mt-4">
                                <p className="text-xs font-medium text-gray-500 mb-2">Participants</p>
                                <div className="flex flex-wrap gap-1">
                                  {task.source_metadata.meeting_participants?.map((participant, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                      {participant}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Manual Task Info - Simple display */}
                      {task.source === 'manual_api' && task.source_metadata && (
                        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Informations de création</h5>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500">Créée via</p>
                              <p className="text-sm text-gray-900">{task.source_metadata.created_via}</p>
                            </div>
                            {task.source_metadata.department && (
                              <div>
                                <p className="text-xs font-medium text-gray-500">Département</p>
                                <p className="text-sm text-gray-900">{task.source_metadata.department}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Commentaires</h3>
              {task.comments && task.comments.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {comment.author.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{comment.author}</p>
                            <p className="text-xs text-gray-500">{formatDate(comment.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucun commentaire pour le moment</p>
                  <p className="text-sm text-gray-400 mt-1">Soyez le premier à commenter cette tâche</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Historique des modifications</h3>
              {task.history && task.history.length > 0 ? (
                <div className="space-y-4">
                  {task.history.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm text-gray-900">{entry.action}</p>
                          <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                        </div>
                        <p className="text-sm text-gray-600">{entry.details}</p>
                        {entry.user && (
                          <p className="text-xs text-gray-400 mt-1">Par: {entry.user}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucun historique disponible</p>
                  <p className="text-sm text-gray-400 mt-1">Les modifications apparaîtront ici</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
