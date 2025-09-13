import React from 'react';

export interface TaskListProps {
  tasks: Array<{
    id: string | number;
    nom: string;
    statut: string;
    priorite: string;
    date_creation: string;
  }>;
  maxItems?: number;
  className?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
  urgent: 'bg-purple-100 text-purple-700',
};

const priorityIcons = {
  low: '🔵',
  medium: '🟡',
  high: '🟠',
  urgent: '🔴',
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  maxItems = 5,
  className = ''
}) => {
  const displayTasks = tasks.slice(0, maxItems);

  if (tasks.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center ${className}`}>
        <div className="text-4xl mb-3">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche</h3>
        <p className="text-gray-600">Commencez par créer votre première tâche</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            📋 Tâches récentes
          </h3>
          <span className="text-sm text-gray-500">
            {displayTasks.length} / {tasks.length}
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {displayTasks.map((task) => (
          <div 
            key={task.id} 
            className="p-4 hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {task.nom}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                      ${statusColors[task.statut as keyof typeof statusColors] || statusColors.pending}
                    `}>
                      {task.statut}
                    </span>
                    
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                      ${priorityColors[task.priorite as keyof typeof priorityColors] || priorityColors.medium}
                    `}>
                      {priorityIcons[task.priorite as keyof typeof priorityIcons] || '⚪'}
                      {task.priorite}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Créée le {new Date(task.date_creation).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              <div className="ml-3 text-gray-400">
                <span className="text-lg">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {tasks.length > maxItems && (
        <div className="p-4 bg-gray-50 rounded-b-xl">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Voir toutes les tâches ({tasks.length - maxItems} de plus)
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskList;
