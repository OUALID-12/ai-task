import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, MessageCircle, History, Info } from 'lucide-react';
import type { Task } from '../types';

interface TaskDetailsTopSheetProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailsTopSheet: React.FC<TaskDetailsTopSheetProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  const [showSourceDetails, setShowSourceDetails] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-700';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <Info className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Détails de la tâche</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Info className="w-4 h-4 mr-2 inline" />
          Détails
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageCircle className="w-4 h-4 mr-2 inline" />
          Commentaires ({task.comments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="w-4 h-4 mr-2 inline" />
          Historique ({task.history?.length || 0})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto">

            {activeTab === 'details' && (
              <div className="space-y-6">

                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{task.description}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Responsable</p>
                      <p className="font-medium text-gray-900">{task.responsable}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Département</p>
                      <p className="font-medium text-gray-900">{task.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priorité</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priorite)}`}>
                        {task.priorite}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(task.statut)}`}>
                        {task.statut}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Échéance</p>
                      <p className="font-medium text-gray-900">{formatDate(task.deadline)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Score de confiance IA</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getConfidenceColor(task.confiance_ia)}`}>
                        {Math.round(task.confiance_ia * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Source & Context */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Source et Contexte</h4>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Source</p>
                      <p className="font-medium text-gray-900">{task.source}</p>
                    </div>

                    {task.context_meeting && (
                      <div>
                        <p className="text-sm text-gray-500">Contexte de réunion</p>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded border">{task.context_meeting}</p>
                      </div>
                    )}

                    {/* Source Metadata - Expandable - Only for email and meeting sources */}
                    {task.source_metadata && (task.source === 'email' || task.source === 'meeting') && (
                      <div className="border-t pt-4">
                        <button
                          onClick={() => setShowSourceDetails(!showSourceDetails)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <span className="text-sm font-medium text-gray-900">Détails de la source</span>
                          {showSourceDetails ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </button>

                        {showSourceDetails && (
                          <div className="mt-4 space-y-3 bg-white p-4 rounded border">
                            {/* Email Source Details */}
                            {task.source === 'email' && task.source_metadata.original_email && (
                              <>
                                <div>
                                  <p className="text-xs text-gray-500">ID Email</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.email_id}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Expéditeur</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.original_email.expediteur}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Destinataire</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.original_email.destinataire}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Objet</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.original_email.objet}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Date de réception</p>
                                  <p className="text-sm font-medium text-gray-900">{formatDate(task.source_metadata.original_email.date_reception)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Résumé du contenu</p>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{task.source_metadata.original_email.resume_contenu}</p>
                                </div>
                                {task.source_metadata.original_email.departement && (
                                  <div>
                                    <p className="text-xs text-gray-500">Département</p>
                                    <p className="text-sm font-medium text-gray-900">{task.source_metadata.original_email.departement.nom} ({task.source_metadata.original_email.departement.origine})</p>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Meeting Source Details */}
                            {task.source === 'meeting' && task.source_metadata.original_meeting && (
                              <>
                                <div>
                                  <p className="text-xs text-gray-500">ID Réunion</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.meeting_id}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Titre de la réunion</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.meeting_titre}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Date de la réunion</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.meeting_date ? formatDate(task.source_metadata.meeting_date) : 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Participants</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {task.source_metadata.meeting_participants?.map((participant, index) => (
                                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                        {participant}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Organisateur</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.original_meeting.organisateur}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Département</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.original_meeting.departement}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Projet</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.original_meeting.projet}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Type de réunion</p>
                                  <p className="text-sm font-medium text-gray-900">{task.source_metadata.original_meeting.type_reunion}</p>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manual Task Info - Simple display */}
                    {task.source === 'manual_api' && task.source_metadata && (
                      <div className="border-t pt-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Créée via</p>
                            <p className="text-sm font-medium text-gray-900">{task.source_metadata.created_via}</p>
                          </div>
                          {task.source_metadata.department && (
                            <div>
                              <p className="text-xs text-gray-500">Département</p>
                              <p className="text-sm font-medium text-gray-900">{task.source_metadata.department}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-gray-900 text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun commentaire pour le moment</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {task.history && task.history.length > 0 ? (
                  task.history.map((entry, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-gray-900 text-sm">{entry.action}</span>
                        <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{entry.details}</p>
                      {entry.user && (
                        <p className="text-xs text-gray-500 mt-1">Par: {entry.user}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun historique disponible</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
