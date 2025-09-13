import React, { useState } from 'react';
import { X, Send, MessageSquare, User } from 'lucide-react';
import type { Task } from '../../../types';
import { apiService } from '../../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TaskCommentModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

export const TaskCommentModal: React.FC<TaskCommentModalProps> = ({ task, isOpen, onClose, onTaskUpdate }) => {
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const queryClient = useQueryClient();

  // Mutation pour ajouter un commentaire
  const commentMutation = useMutation({
    mutationFn: ({ taskId, comment, author }: { taskId: string; comment: string; author: string }) =>
      apiService.addComment(taskId, comment, author),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onTaskUpdate?.();
      setComment('');
      setAuthor('');
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const authorName = author.trim() || 'Anonyme'; // Valeur par défaut si vide
    if (comment.trim()) {
      commentMutation.mutate({
        taskId: task.id,
        comment: comment.trim(),
        author: authorName
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Ajouter un commentaire</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Task Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 mb-1">Tâche concernée</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Auteur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre nom (optionnel)
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre nom ou identifiant"
                />
              </div>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Écrivez votre commentaire ici..."
                required
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={commentMutation.isPending || !comment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={16} />
            {commentMutation.isPending ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
};
