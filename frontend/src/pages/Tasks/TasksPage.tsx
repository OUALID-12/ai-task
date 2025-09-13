import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useTaskStats } from '../../hooks/useTaskStats';
import { useTaskSorting } from '../../hooks/useTaskSorting';
import { useTaskFilters } from '../../hooks/useTaskFilters';
import { LoadingState, ErrorState } from '../../components/ui';
import { StatCard } from '../../components/dashboard/StatCard';
import { SearchBar } from '../../components/SearchBar';
import { FilterSidebar } from '../../components/FilterSidebar';
import { ActiveFilters } from '../../components/ActiveFilters';
import { TaskCardView, TaskTableView, TaskViewToggle, TaskPagination } from './components';
import { TaskDetailsTopSheet, TaskEditTopSheet, TaskCommentTopSheet } from './components';
import type { Task } from '../../types';

type ViewMode = 'cards' | 'table';
type TopSheetType = 'details' | 'edit' | 'comment' | null;

const TasksPage: React.FC = () => {
  console.log('TasksPage: Component mounted/updated');

  React.useEffect(() => {
    console.log('TasksPage: useEffect triggered');
    return () => {
      console.log('TasksPage: Component will unmount');
    };
  }, []);

  // État pour la vue (cartes ou tableau)
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showFilters, setShowFilters] = useState(false);

  // États pour les TopSheets
  const [activeTopSheet, setActiveTopSheet] = useState<TopSheetType>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Hook pour la gestion des filtres (Phase 4.1)
  const {
    filters,
    updateFilter,
    addFilterValue,
    removeFilterValue,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount
  } = useTaskFilters();

  // Fonction centralisée pour effacer complètement la recherche
  const clearSearch = useCallback(() => {
    console.log('🧹 CLEAR SEARCH - Effacement complet');
    updateFilter('search', '');
  }, [updateFilter]);
  
  // Hook pour les statistiques globales réelles
  const { data: globalStats } = useTaskStats();
  
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useTasks({
    page: 1,
    limit: 100,
    sort_by: 'created_at',
    order: 'desc',
    // Intégration des filtres Phase 4.1
    ...filters
  });

  // Gestionnaire de clic sur une tâche
  const handleTaskClick = (task: Task) => {
    console.log('Tâche sélectionnée:', task);
    // TODO: Implémenter la navigation vers les détails de la tâche
  };

  // Gestionnaires pour les TopSheets
  const openTopSheet = (type: TopSheetType, task: Task) => {
    setActiveTopSheet(type);
    setSelectedTask(task);
  };

  const closeTopSheet = () => {
    setActiveTopSheet(null);
    setSelectedTask(null);
  };

  const handleTaskUpdate = () => {
    refetch(); // Recharger les tâches après modification
  };

  const tasks = data?.tasks || [];
  
  // Hook de tri et pagination pour organiser les tâches (doit être appelé avant les returns conditionnels)
  const { 
    paginatedTasks, 
    sortConfig, 
    paginationConfig, 
    handleSort, 
    handlePageChange, 
    handlePageSizeChange 
  } = useTaskSorting(tasks);

  if (isLoading) {
    return <LoadingState message="Chargement des tâches..." className="min-h-96" />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Erreur lors du chargement des tâches"
        className="min-h-96"
        onRetry={() => refetch()}
      />
    );
  }
  
  // Utiliser les statistiques globales si disponibles, sinon fallback sur les calculs locaux
  const totalTasks = globalStats?.total || data?.total || 0;
  const completedTasks = globalStats?.by_status?.completed || tasks.filter((t: Task) => t.statut === 'completed').length;
  const inProgressTasks = globalStats?.by_status?.in_progress || tasks.filter((t: Task) => t.statut === 'in_progress').length;
  const highPriorityTasks = globalStats?.by_priority?.high || tasks.filter((t: Task) => t.priorite === 'high').length;

  return (
    <div className="min-h-full">
      {/* KPI Cards - Statistiques globales réelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Total"
          value={totalTasks}
          icon="📋"
          variant="primary"
        />
        <StatCard
          title="En cours"
          value={inProgressTasks}
          icon="⏳"
          variant="warning"
        />
        <StatCard
          title="Terminées"
          value={completedTasks}
          icon="✅"
          variant="success"
        />
        <StatCard
          title="Priorité haute"
          value={highPriorityTasks}
          icon="⚡"
          variant="danger"
        />
      </div>

      {/* Zone principale - Vue des tâches */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header de la section avec barre de recherche et filtres - Phase 4.1 */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Liste des Tâches</h2>
              <p className="text-sm text-gray-600">
                {totalTasks} tâche{totalTasks > 1 ? 's' : ''} au total
                {sortConfig && (
                  <span className="ml-2 text-blue-600">
                    • Triées par {
                      sortConfig.field === 'created_at' ? 'date' :
                      sortConfig.field === 'priorite' ? 'priorité' :
                      sortConfig.field === 'statut' ? 'statut' : 'description'
                    } ({sortConfig.order === 'asc' ? 'croissant' : 'décroissant'})
                  </span>
                )}
                {paginationConfig.totalPages > 1 && (
                  <span className="ml-2 text-purple-600">
                    • Page {paginationConfig.currentPage}/{paginationConfig.totalPages}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Bouton d'affichage des filtres */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>Filtres</span>
                {hasActiveFilters && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              {/* Bascule vue cartes/tableau */}
              <TaskViewToggle 
                currentView={viewMode}
                onViewChange={setViewMode}
              />
            </div>
          </div>

          {/* Barre de recherche - Phase 4.1 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchBar
                value={filters.search || ''}
                onChange={(value) => {
                  updateFilter('search', value);
                }}
                onClear={clearSearch}
                placeholder="Rechercher des tâches par titre, description, assigné..."
              />
            </div>
          </div>

          {/* Affichage séparé de la recherche active */}
          {filters.search && filters.search.trim() !== '' && (
            <div className="mt-3">
              <div className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full border border-green-200">
                <span className="mr-2">🔍 Recherche:</span>
                <span className="font-semibold">{filters.search}</span>
                <button
                  onClick={() => {
                    console.log('🗑️ Badge X - Effacement REDONDANT');
                    // Effacement redondant - les deux méthodes
                    updateFilter('search', '');
                    clearSearch();
                  }}
                  className="ml-2 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Filtres actifs (SANS la recherche) - Phase 4.1 */}
          {hasActiveFilters && (
            <div className="mt-4">
              <ActiveFilters
                filters={filters}
                onRemoveFilterValue={removeFilterValue}
                onClearFilter={clearFilter}
                onClearAllFilters={clearAllFilters}
                activeFiltersCount={activeFiltersCount}
              />
            </div>
          )}
        </div>

        {/* Layout principal avec sidebar des filtres - Phase 4.1 */}
        <div className="flex">
          {/* Sidebar des filtres */}
          {showFilters && (
            <div className="w-80 border-r border-gray-200 bg-gray-50 p-4">
              <FilterSidebar
                filters={filters}
                onUpdateFilter={updateFilter}
                onAddFilterValue={addFilterValue}
                onRemoveFilterValue={removeFilterValue}
                onClearFilter={clearFilter}
              />
            </div>
          )}

          {/* Contenu principal des tâches */}
          <div className="flex-1 p-6">
            {/* Basculement entre vues cartes et tableau - Étapes 3 + 4 + 5 implémentées */}
            {viewMode === 'cards' ? (
              <TaskCardView
                tasks={paginatedTasks}
                loading={isLoading}
                onTaskClick={handleTaskClick}
                onOpenTopSheet={openTopSheet}
                showEndIndicator={false} // Pas d'indicateur de fin avec pagination
              />
            ) : (
              <TaskTableView
                tasks={paginatedTasks}
                loading={isLoading}
                onTaskClick={handleTaskClick}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            )}
          </div>
        </div>

        {/* Pagination - Étape 5 */}
        {!isLoading && paginationConfig.totalPages > 1 && (
          <TaskPagination
            config={paginationConfig}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* TopSheets - rendus au niveau de la page */}
      {selectedTask && (
        <>
          <TaskDetailsTopSheet
            task={selectedTask}
            isOpen={activeTopSheet === 'details'}
            onClose={closeTopSheet}
          />

          <TaskEditTopSheet
            task={selectedTask}
            isOpen={activeTopSheet === 'edit'}
            onClose={closeTopSheet}
            onTaskUpdate={handleTaskUpdate}
          />

          <TaskCommentTopSheet
            task={selectedTask}
            isOpen={activeTopSheet === 'comment'}
            onClose={closeTopSheet}
            onTaskUpdate={handleTaskUpdate}
          />
        </>
      )}
    </div>
  );
};

export default TasksPage;
