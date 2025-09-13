import React from 'react';

type ViewMode = 'cards' | 'table';

interface TaskViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const TaskViewToggle: React.FC<TaskViewToggleProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  return (
    <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg p-1 shadow-sm">
      {/* Vue Cartes */}
      <button
        onClick={() => onViewChange('cards')}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${currentView === 'cards'
            ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span>Cartes</span>
        {currentView === 'cards' && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </button>

      {/* Vue Tableau */}
      <button
        onClick={() => onViewChange('table')}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${currentView === 'table'
            ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-18 8h18m-18 4h18" />
        </svg>
        <span>Tableau</span>
        {currentView === 'table' && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </button>
    </div>
  );
};

export default TaskViewToggle;
