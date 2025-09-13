import React from 'react';
import { X, Calendar, User, Tag, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Task } from '../../../types';

interface TaskDetailsModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, isOpen, onClose }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détails de la tâche</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{task.description}</p>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Responsable</p>
                  <p className="font-medium">{task.responsable}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Échéance</p>
                  <p className="font-medium">
                    {task.deadline ? formatDate(task.deadline) : 'Non définie'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag size={18} className="text-gray-500" />
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
                  {task.statut === 'pending' && <AlertCircle size={14} />}
                  {task.statut === 'rejected' && <X size={14} />}
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
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                  >
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Métadonnées */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations système</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Créée le</p>
                <p className="font-medium">{formatDate(task.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">Modifiée le</p>
                <p className="font-medium">{formatDate(task.updated_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">Score de confiance IA</p>
                <p className="font-medium">{Math.round((task.confiance_ia || 0) * 100)}%</p>
              </div>
              <div>
                <p className="text-gray-500">Statut de validation</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  task.validation_status === 'validated' ? 'text-green-600 bg-green-50' :
                  task.validation_status === 'rejected' ? 'text-red-600 bg-red-50' :
                  'text-yellow-600 bg-yellow-50'
                }`}>
                  {task.validation_status === 'validated' ? '✅ Validée' :
                   task.validation_status === 'rejected' ? '❌ Rejetée' : '⏳ En attente'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
