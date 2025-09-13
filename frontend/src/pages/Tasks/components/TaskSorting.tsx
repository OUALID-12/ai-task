import React from 'react';
import type { SortConfig, SortField } from '../../../hooks/useTaskSorting';

interface TaskSortingProps {
  field: SortField;
  currentSort: SortConfig;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}

const TaskSorting: React.FC<TaskSortingProps> = ({ 
  field, 
  currentSort, 
  onSort, 
  children 
}) => {
  const isActive = currentSort.field === field;
  const isAscending = isActive && currentSort.order === 'asc';
  const isDescending = isActive && currentSort.order === 'desc';

  const handleClick = () => {
    onSort(field);
  };

  return (
    <div 
      className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors duration-200 select-none"
      onClick={handleClick}
    >
      <span className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
        {children}
      </span>
      
      <div className="flex flex-col items-center justify-center w-4 h-4">
        {!isActive && (
          // État neutre - flèches grises
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        )}
        
        {isAscending && (
          // Tri ascendant - flèche vers le haut bleue
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
        
        {isDescending && (
          // Tri descendant - flèche vers le bas bleue
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default TaskSorting;
