import React from 'react';
import TaskSorting from './TaskSorting';
import type { Task } from '../../../types';
import type { SortConfig, SortField } from '../../../hooks/useTaskSorting';

interface TaskTableViewProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick?: (task: Task) => void;
  sortConfig?: SortConfig;
  onSort?: (field: SortField) => void;
}

const TaskTableView: React.FC<TaskTableViewProps> = ({ 
  tasks, 
  loading = false, 
  onTaskClick,
  sortConfig,
  onSort 
}) => {
  // Configuration des couleurs par priorité
  const priorityConfig = {
    urgent: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      icon: '🚨',
      badge: 'bg-red-500'
    },
    high: { 
      bg: 'bg-orange-100', 
      text: 'text-orange-800', 
      icon: '⚡',
      badge: 'bg-orange-500'
    },
    medium: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      icon: '⚠️',
      badge: 'bg-yellow-500'
    },
    low: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      icon: '📝',
      badge: 'bg-green-500'
    }
  };

  const statusConfig = {
    pending: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      label: 'En attente',
      icon: '⏳'
    },
    in_progress: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800', 
      label: 'En cours',
      icon: '🔄'
    },
    completed: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      label: 'Terminée',
      icon: '✅'
    },
    rejected: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      label: 'Rejetée',
      icon: '❌'
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priorité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Date création
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-8xl mb-6">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Aucune tâche dans le tableau
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Les tâches apparaîtront ici en format tableau pour une vue structurée et professionnelle.
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Créer une tâche</span>
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Header du tableau */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {sortConfig && onSort ? (
                <TaskSorting 
                  field="description" 
                  currentSort={sortConfig} 
                  onSort={onSort}
                >
                  Description
                </TaskSorting>
              ) : (
                <div className="flex items-center space-x-1">
                  <span>Description</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {sortConfig && onSort ? (
                <TaskSorting 
                  field="priorite" 
                  currentSort={sortConfig} 
                  onSort={onSort}
                >
                  Priorité
                </TaskSorting>
              ) : (
                <div className="flex items-center space-x-1">
                  <span>Priorité</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {sortConfig && onSort ? (
                <TaskSorting 
                  field="statut" 
                  currentSort={sortConfig} 
                  onSort={onSort}
                >
                  Statut
                </TaskSorting>
              ) : (
                <div className="flex items-center space-x-1">
                  <span>Statut</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
              {sortConfig && onSort ? (
                <TaskSorting 
                  field="created_at" 
                  currentSort={sortConfig} 
                  onSort={onSort}
                >
                  Date création
                </TaskSorting>
              ) : (
                <div className="flex items-center space-x-1">
                  <span>Date création</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Actions
            </th>
          </tr>
        </thead>

        {/* Corps du tableau */}
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task, index) => {
            const priority = priorityConfig[task.priorite as keyof typeof priorityConfig] || priorityConfig.low;
            const status = statusConfig[task.statut as keyof typeof statusConfig] || statusConfig.pending;

            return (
              <tr 
                key={task.id}
                className={`
                  hover:bg-gray-50 cursor-pointer transition-colors duration-200
                  ${task.priorite === 'urgent' ? 'bg-red-25' : ''}
                `}
                onClick={() => onTaskClick?.(task)}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                {/* Description */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${priority.bg} flex items-center justify-center mr-3`}>
                      <span className="text-sm">{priority.icon}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {task.description}
                    </div>
                  </div>
                </td>

                {/* Priorité */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                    ${priority.bg} ${priority.text}
                  `}>
                    <div className={`w-2 h-2 rounded-full ${priority.badge} mr-2`}></div>
                    {task.priorite?.toUpperCase()}
                  </span>
                </td>

                {/* Statut */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                    ${status.bg} ${status.text}
                  `}>
                    <span className="mr-1">{status.icon}</span>
                    {status.label}
                  </span>
                </td>

                {/* Date création (masquée sur mobile) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(task.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </td>

                {/* Actions (masquées sur tablet) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium hidden lg:table-cell">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTableView;
