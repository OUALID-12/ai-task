import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';
import type { Task } from '../../../types';
import { apiService } from '../../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TaskCommentTopSheetProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

export const TaskCommentTopSheet: React.FC<TaskCommentTopSheetProps> = ({ task, isOpen, onClose, onTaskUpdate }) => {
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
    if (comment.trim() && author.trim()) {
      commentMutation.mutate({
        taskId: task.id,
        comment: comment.trim(),
        author: author.trim()
      });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center topsheet-backdrop-strong transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div
        className={`
          relative w-full max-w-2xl mx-4 mt-20 bg-white rounded-xl shadow-2xl
          transform transition-all duration-300 ease-out border border-gray-100
          ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
          max-h-[calc(100vh-6rem)] overflow-hidden
        `}
      >
        {/* Header avec style amélioré */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-medium text-lg">💬</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ajouter un commentaire</h2>
              <p className="text-sm text-gray-600">Partagez vos remarques sur cette tâche</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Task Info avec style amélioré */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-medium">📋</span>
            </div>
            <h3 className="font-semibold text-gray-900">Tâche concernée</h3>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 pl-8">{task.description}</p>
        </div>

        {/* Form avec style amélioré */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Auteur */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Votre nom *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Votre nom ou identifiant"
                  required
                />
              </div>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Commentaire *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 resize-none"
                rows={4}
                placeholder="Écrivez votre commentaire ici..."
                required
              />
            </div>
          </div>
        </form>

        {/* Footer avec boutons améliorés */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={commentMutation.isPending || !comment.trim() || !author.trim()}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            {commentMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Envoyer le commentaire</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
