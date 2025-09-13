import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, MessageSquare, Edit, MoreVertical } from 'lucide-react';
import type { Task } from '../../../types';
import { apiService } from '../../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TaskActionsProps {
  task: Task;
  onTaskUpdate?: () => void;
  onOpenTopSheet?: (type: 'details' | 'edit' | 'comment', task: Task) => void;
}

export const TaskActions: React.FC<TaskActionsProps> = ({ task, onTaskUpdate, onOpenTopSheet }) => {
  const queryClient = useQueryClient();
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Mutations pour les actions
  const validateMutation = useMutation({
    mutationFn: (id: string) => apiService.validateTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onTaskUpdate?.();
      setShowActionsMenu(false);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiService.rejectTask(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onTaskUpdate?.();
      setShowActionsMenu(false);
    }
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => apiService.completeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onTaskUpdate?.();
      setShowActionsMenu(false);
    }
  });

  const handleValidate = () => {
    if (window.confirm('Êtes-vous sûr de vouloir valider cette tâche ?')) {
      validateMutation.mutate(task.id);
    }
  };

  const handleReject = () => {
    const reason = window.prompt('Raison du rejet (optionnel) :');
    if (reason !== null) { // L'utilisateur n'a pas annulé
      rejectMutation.mutate({ id: task.id, reason: reason || undefined });
    }
  };

  const handleComplete = () => {
    if (window.confirm('Marquer cette tâche comme terminée ?')) {
      completeMutation.mutate(task.id);
    }
  };

  const isLoading = validateMutation.isPending || rejectMutation.isPending || completeMutation.isPending;

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Bouton Modifier - Style lien simple */}
        <button
          onClick={() => onOpenTopSheet?.('edit', task)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all duration-200"
          title="Modifier la tâche"
        >
          <Edit size={16} className="text-blue-500" />
          <span>Modifier</span>
        </button>

        {/* Menu Actions déroulant - Style lien simple */}
        <div className="relative">
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all duration-200"
            title="Plus d'actions"
          >
            <MoreVertical size={16} className="text-blue-500" />
            <span>Actions</span>
          </button>

          {/* Menu déroulant */}
          {showActionsMenu && (
            <div className="absolute top-full right-0 mt-2 min-w-72 max-w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-2">
                {/* Bouton Commentaire */}
                <button
                  onClick={() => {
                    onOpenTopSheet?.('comment', task);
                    setShowActionsMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <MessageSquare size={18} className="text-blue-500" />
                  <span className="whitespace-normal text-left">Commenter</span>
                </button>

                {/* Actions de statut - seulement si tâche en attente ou en cours */}
                {(task.statut === 'pending' || task.statut === 'in_progress') && (
                  <>
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Bouton Valider - seulement si pas déjà validée */}
                    {task.validation_status !== 'validated' && (
                      <button
                        onClick={handleValidate}
                        disabled={isLoading}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={18} className="text-green-500" />
                        <span className="whitespace-normal text-left">Valider</span>
                      </button>
                    )}

                    {/* Bouton Rejeter - seulement si pas déjà rejetée */}
                    {task.validation_status !== 'rejected' && (
                      <button
                        onClick={handleReject}
                        disabled={isLoading}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={18} className="text-red-500" />
                        <span className="whitespace-normal text-left">Rejeter</span>
                      </button>
                    )}

                    {/* Bouton Compléter - seulement si pas déjà terminée */}
                    {task.validation_status !== 'completed' && (
                      <button
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Clock size={18} className="text-blue-500" />
                        <span className="whitespace-normal text-left">Terminer</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay pour fermer le menu au clic extérieur */}
      {showActionsMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowActionsMenu(false)}
        />
      )}
    </>
  );
};
