import React from 'react';
import type { Task } from '../../../types';
import { TaskActions } from './TaskActions';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onOpenTopSheet?: (type: 'details' | 'edit' | 'comment', task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onOpenTopSheet }) => {
  // Configuration des couleurs et icônes par priorité
  const priorityConfig = {
    urgent: { 
      bg: 'from-red-500 to-pink-600', 
      text: 'text-white', 
      icon: '🚨',
      border: 'border-red-200',
      shadow: 'shadow-red-100',
      badgeBg: 'bg-red-500',
      badgeText: 'text-white',
      pulse: 'animate-pulse'
    },
    high: { 
      bg: 'from-orange-400 to-red-500', 
      text: 'text-white', 
      icon: '⚡',
      border: 'border-orange-200',
      shadow: 'shadow-orange-100',
      badgeBg: 'bg-orange-500',
      badgeText: 'text-white',
      pulse: ''
    },
    medium: { 
      bg: 'from-yellow-400 to-orange-400', 
      text: 'text-white', 
      icon: '⚠️',
      border: 'border-yellow-200',
      shadow: 'shadow-yellow-100',
      badgeBg: 'bg-yellow-500',
      badgeText: 'text-white',
      pulse: ''
    },
    low: { 
      bg: 'from-green-400 to-blue-400', 
      text: 'text-white', 
      icon: '📝',
      border: 'border-green-200',
      shadow: 'shadow-green-100',
      badgeBg: 'bg-green-500',
      badgeText: 'text-white',
      pulse: ''
    }
  };

  const statusConfig = {
    pending: { 
      bg: 'bg-yellow-50', 
      text: 'text-yellow-700', 
      border: 'border-yellow-200', 
      label: 'En attente',
      icon: '⏳'
    },
    in_progress: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      border: 'border-blue-200', 
      label: 'En cours',
      icon: '🔄'
    },
    completed: { 
      bg: 'bg-green-50', 
      text: 'text-green-700', 
      border: 'border-green-200', 
      label: 'Terminée',
      icon: '✅'
    },
    rejected: { 
      bg: 'bg-red-50', 
      text: 'text-red-700', 
      border: 'border-red-200', 
      label: 'Rejetée',
      icon: '❌'
    }
  };

  const priority = priorityConfig[task.priorite as keyof typeof priorityConfig] || priorityConfig.low;
  const status = statusConfig[task.statut as keyof typeof statusConfig] || statusConfig.pending;

  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  return (
    <div 
      className={`
        relative group cursor-pointer
        bg-white rounded-xl shadow-md hover:shadow-xl 
        border border-gray-200 hover:border-gray-300
        transform hover:scale-105 transition-all duration-300
        overflow-hidden
        ${priority.shadow}
      `}
      onClick={handleClick}
    >
      {/* Bande colorée en haut */}
      <div className={`h-1 bg-gradient-to-r ${priority.bg}`}></div>
      
      {/* Contenu principal */}
      <div className="p-6">
        {/* Header avec icône et actions */}
        <div className="flex items-start justify-between mb-4">
          <div className={`
            w-12 h-12 rounded-xl bg-gradient-to-r ${priority.bg} 
            flex items-center justify-center ${priority.text} 
            shadow-lg ${priority.pulse}
          `}>
            <span className="text-xl">{priority.icon}</span>
          </div>
          
          {/* Actions de la tâche */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <TaskActions task={task} onOpenTopSheet={onOpenTopSheet} />
          </div>
        </div>

        {/* Titre de la tâche */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
          {task.description}
        </h3>

        {/* Badges de statut et priorité */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
            ${status.bg} ${status.text} ${status.border}
          `}>
            <span className="mr-1">{status.icon}</span>
            {status.label}
          </span>
          
          <span className={`
            inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold shadow-sm
            ${priority.badgeBg} ${priority.badgeText}
          `}>
            {task.priorite?.toUpperCase()}
          </span>

          {/* Icône de validation si la tâche est validée */}
          {task.validation_status === 'validated' && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
              ✓ Validée
            </span>
          )}
        </div>

        {/* Informations supplémentaires */}
        <div className="space-y-2 text-sm text-gray-600">
          {/* Date de création */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Créée le {new Date(task.created_at).toLocaleDateString('fr-FR')}</span>
          </div>

          {/* ID de la tâche */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span className="font-mono text-xs">#{task.id}</span>
          </div>
        </div>

        {/* Footer avec call-to-action */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${priority.bg}`}></div>
            <span>Priorité {task.priorite}</span>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onOpenTopSheet?.('details', task)}
              className="text-blue-500 font-medium text-sm hover:text-blue-600 transition-colors"
              title="Voir les détails"
            >
              Voir détails →
            </button>
          </div>
        </div>
      </div>

      {/* Indicateur de priorité urgent */}
      {task.priorite === 'urgent' && (
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
