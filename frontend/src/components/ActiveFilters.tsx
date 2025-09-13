import React from 'react';
import { X, Filter } from 'lucide-react';
import type { TaskFilters } from '../hooks/useTaskFilters';

interface ActiveFiltersProps {
  filters: TaskFilters;
  onRemoveFilterValue: (key: keyof TaskFilters, value: string) => void;
  onClearFilter: (key: keyof TaskFilters) => void;
  onClearAllFilters: () => void;
  activeFiltersCount: number;
  className?: string;
}

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  color?: 'blue' | 'red' | 'green' | 'purple' | 'yellow' | 'gray';
}

const FilterChip: React.FC<FilterChipProps> = ({ label, value, onRemove, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${colorClasses[color]} transition-colors hover:bg-opacity-80`}>
      <span className="mr-1">{label}:</span>
      <span className="font-semibold">{value}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
        aria-label={`Supprimer le filtre ${label}: ${value}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
};

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemoveFilterValue,
  onClearFilter,
  onClearAllFilters,
  activeFiltersCount,
  className = ""
}) => {
  if (activeFiltersCount === 0) {
    return null;
  }

  const formatDateRange = (dateRange: { start?: string; end?: string }) => {
    if (dateRange.start && dateRange.end) {
      return `${dateRange.start} → ${dateRange.end}`;
    } else if (dateRange.start) {
      return `À partir du ${dateRange.start}`;
    } else if (dateRange.end) {
      return `Jusqu'au ${dateRange.end}`;
    }
    return '';
  };

  const renderFilterChips = () => {
    const chips: React.ReactNode[] = [];

    // EXCLURE la recherche des filtres actifs - elle est gérée séparément
    // La recherche ne sera pas affichée ici

    // Statuts
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach(status => {
        chips.push(
          <FilterChip
            key={`status-${status}`}
            label="Statut"
            value={status}
            onRemove={() => onRemoveFilterValue('status', status)}
            color="blue"
          />
        );
      });
    }

    // Priorités
    if (filters.priority && filters.priority.length > 0) {
      filters.priority.forEach(priority => {
        chips.push(
          <FilterChip
            key={`priority-${priority}`}
            label="Priorité"
            value={priority}
            onRemove={() => onRemoveFilterValue('priority', priority)}
            color="red"
          />
        );
      });
    }

    // Assignés
    if (filters.assignee && filters.assignee.length > 0) {
      filters.assignee.forEach(assignee => {
        chips.push(
          <FilterChip
            key={`assignee-${assignee}`}
            label="Assigné"
            value={assignee}
            onRemove={() => onRemoveFilterValue('assignee', assignee)}
            color="purple"
          />
        );
      });
    }

    // Tags
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => {
        chips.push(
          <FilterChip
            key={`tag-${tag}`}
            label="Tag"
            value={tag}
            onRemove={() => onRemoveFilterValue('tags', tag)}
            color="green"
          />
        );
      });
    }

    // Plage de dates
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
      chips.push(
        <FilterChip
          key="dateRange"
          label="Période"
          value={formatDateRange(filters.dateRange)}
          onRemove={() => onClearFilter('dateRange')}
          color="blue"
        />
      );
    }

    // Sources
    if (filters.source && filters.source.length > 0) {
      filters.source.forEach(source => {
        chips.push(
          <FilterChip
            key={`source-${source}`}
            label="Source"
            value={source}
            onRemove={() => onRemoveFilterValue('source', source)}
            color="yellow"
          />
        );
      });
    }

    // Départements
    if (filters.department && filters.department.length > 0) {
      filters.department.forEach(department => {
        chips.push(
          <FilterChip
            key={`department-${department}`}
            label="Département"
            value={department}
            onRemove={() => onRemoveFilterValue('department', department)}
            color="gray"
          />
        );
      });
    }

    // Validation
    if (filters.validated !== undefined) {
      chips.push(
        <FilterChip
          key="validated"
          label="Validé"
          value={filters.validated ? 'Oui' : 'Non'}
          onRemove={() => onClearFilter('validated')}
          color="purple"
        />
      );
    }

    return chips;
  };

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Filtres actifs ({activeFiltersCount})
          </span>
        </div>
        <button
          onClick={onClearAllFilters}
          className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
        >
          Tout effacer
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {renderFilterChips()}
      </div>
    </div>
  );
};
