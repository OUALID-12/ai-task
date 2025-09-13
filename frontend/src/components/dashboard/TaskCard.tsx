import React from 'react';
import type { Task } from '../../types';

export interface TaskCardProps {
  task: Task;
  onValidate?: (taskId: string) => void;
  onReject?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'priority';
}

const priorityConfig = {
  urgent: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: '🔴',
    gradient: 'from-red-50 to-red-100',
    ring: 'ring-red-200'
  },
  high: {
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: '🟠',
    gradient: 'from-orange-50 to-orange-100',
    ring: 'ring-orange-200'
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: '🟡',
    gradient: 'from-yellow-50 to-yellow-100',
    ring: 'ring-yellow-200'
  },
  low: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '🔵',
    gradient: 'from-blue-50 to-blue-100',
    ring: 'ring-blue-200'
  }
};

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'En attente',
    icon: '⏳'
  },
  in_progress: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'En cours',
    icon: '⚡'
  },
  completed: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Terminée',
    icon: '✅'
  },
  rejected: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Rejetée',
    icon: '❌'
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onValidate,
  onReject,
  onEdit,
  showActions = true,
  variant = 'default'
}) => {
  const priority = priorityConfig[task.priorite as keyof typeof priorityConfig] || priorityConfig.medium;
  const status = statusConfig[task.statut as keyof typeof statusConfig] || statusConfig.pending;

  const isCompact = variant === 'compact';
  const isPriority = variant === 'priority';

  return (
    <div className={`
      bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md
      ${isPriority ? `bg-gradient-to-r ${priority.gradient} border-2 ${priority.ring} ring-1` : 'border-gray-200'}
      ${isCompact ? 'p-3' : 'p-4 md:p-6'}
    `}>
      {/* Header avec priorité */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
              ${priority.color}
            `}>
              {priority.icon} {task.priorite}
            </span>
            
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
              ${status.color}
            `}>
              {status.icon} {status.label}
            </span>
            
            {/* Icône de validation si la tâche est validée */}
            {task.validation_status === 'validated' && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                ✓ Validée
              </span>
            )}
          </div>
          
          <h3 className={`font-semibold text-gray-900 mb-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
            {task.description}
          </h3>
          
          <div className="space-y-1 text-xs text-gray-600">
            <p><span className="font-medium">Responsable:</span> {task.responsable}</p>
            <p><span className="font-medium">Département:</span> {task.department}</p>
            {task.deadline && (
              <p><span className="font-medium">Échéance:</span> {new Date(task.deadline).toLocaleDateString('fr-FR')}</p>
            )}
            <p><span className="font-medium">Créée:</span> {new Date(task.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        
        {/* Score de confiance */}
        <div className="ml-4 text-right">
          <div className={`text-xs text-gray-500 mb-1 ${isCompact ? 'hidden' : ''}`}>
            Confiance
          </div>
          <div className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
            ${task.confiance_ia >= 0.8 ? 'bg-green-100 text-green-700' :
              task.confiance_ia >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'}
          `}>
            {Math.round(task.confiance_ia * 100)}%
          </div>
        </div>
      </div>

      {/* Tags si présents */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && task.statut === 'pending' && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            {onValidate && (
              <button
                onClick={() => onValidate(task.id)}
                className="inline-flex items-center px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg transition-colors duration-150"
              >
                ✅ Valider
              </button>
            )}
            
            {onReject && (
              <button
                onClick={() => onReject(task.id)}
                className="inline-flex items-center px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors duration-150"
              >
                ❌ Rejeter
              </button>
            )}
          </div>
          
          {onEdit && (
            <button
              onClick={() => onEdit(task.id)}
              className="inline-flex items-center px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-colors duration-150"
            >
              ✏️ Modifier
            </button>
          )}
        </div>
      )}

      {/* Actions pour tâches terminées/rejetées */}
      {showActions && (task.statut === 'completed' || task.statut === 'rejected') && onEdit && (
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            onClick={() => onEdit(task.id)}
            className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors duration-150"
          >
            👁️ Voir détails
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
