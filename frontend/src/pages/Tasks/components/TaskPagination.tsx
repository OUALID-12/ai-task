import React from 'react';
import type { PaginationConfig } from '../../../hooks/useTaskSorting';

interface TaskPaginationProps {
  config: PaginationConfig;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const TaskPagination: React.FC<TaskPaginationProps> = ({
  config,
  onPageChange,
  onPageSizeChange
}) => {
  const { currentPage, pageSize, totalItems, totalPages } = config;

  // Calcul des indices affichés
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Options de taille de page
  const pageSizeOptions = [10, 20, 50, 100];

  // Génération des numéros de page à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si peu nombreuses
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique plus complexe pour beaucoup de pages
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Pages autour de la page actuelle
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (totalPages > 1 && !pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
        {/* Informations contextuelles */}
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Affichage de <span className="font-medium">{startIndex}</span> à{' '}
            <span className="font-medium">{endIndex}</span> sur{' '}
            <span className="font-medium">{totalItems}</span> résultats
          </span>
        </div>

        {/* Navigation et contrôles */}
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Sélecteur de taille de page */}
          <div className="flex items-center space-x-2">
            <label htmlFor="page-size" className="text-sm text-gray-700">
              Afficher :
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">par page</span>
          </div>

          {/* Navigation des pages */}
          <div className="flex items-center space-x-1">
            {/* Bouton Précédent */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`
                px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${currentPage <= 1
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Numéros de page */}
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
                disabled={typeof page === 'string'}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${typeof page === 'string'
                    ? 'text-gray-400 cursor-default'
                    : page === currentPage
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {page}
              </button>
            ))}

            {/* Bouton Suivant */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`
                px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${currentPage >= totalPages
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPagination;
