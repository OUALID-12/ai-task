import React from 'react';
import TaskCard from './TaskCard';
import type { Task } from '../../../types';

interface TaskCardViewProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick?: (task: Task) => void;
  onOpenTopSheet?: (type: 'details' | 'edit' | 'comment', task: Task) => void;
  showEndIndicator?: boolean;
}

const TaskCardView: React.FC<TaskCardViewProps> = ({ 
  tasks, 
  loading = false, 
  onTaskClick,
  onOpenTopSheet,
  showEndIndicator = true
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Skeleton cards pendant le chargement */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-1 bg-gray-200"></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-8xl mb-6">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Aucune tâche trouvée
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Commencez par créer votre première tâche ou ajustez vos filtres pour voir plus de résultats.
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
    <div className="space-y-6">
      {/* Grille de cartes avec animation staggered */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-fadeInUp"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <TaskCard 
              task={task} 
              onClick={onTaskClick}
              onOpenTopSheet={onOpenTopSheet}
            />
          </div>
        ))}
      </div>

      {/* Indicateur de fin de liste (conditionnel pour pagination) */}
      {showEndIndicator && tasks.length > 9 && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCardView;
