import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Filter, Calendar, User, Tag, Building } from 'lucide-react';
import type { TaskFilters } from '../hooks/useTaskFilters';

interface FilterSidebarProps {
  filters: TaskFilters;
  onUpdateFilter: (key: keyof TaskFilters, value: TaskFilters[keyof TaskFilters]) => void;
  onAddFilterValue: (key: keyof TaskFilters, value: string) => void;
  onRemoveFilterValue: (key: keyof TaskFilters, value: string) => void;
  onClearFilter: (key: keyof TaskFilters) => void;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, icon, isOpen, onToggle, children }) => (
  <div className="border-b border-gray-200 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span className="font-medium text-gray-700">{title}</span>
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </button>
    {isOpen && <div className="p-3 pt-0">{children}</div>}
  </div>
);

const CheckboxGroup: React.FC<{
  options: string[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
}> = ({ options, selected, onChange }) => (
  <div className="space-y-2">
    {options.map(option => (
      <label key={option} className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={selected.includes(option)}
          onChange={(e) => onChange(option, e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 capitalize">{option}</span>
      </label>
    ))}
  </div>
);

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onUpdateFilter,
  onAddFilterValue,
  onRemoveFilterValue,
  className = ""
}) => {
  const [openSections, setOpenSections] = useState({
    status: true,
    priority: true,
    assignee: false,
    tags: false,
    dateRange: false,
    source: false,
    department: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (filterKey: keyof TaskFilters, value: string, checked: boolean) => {
    if (checked) {
      onAddFilterValue(filterKey, value);
    } else {
      onRemoveFilterValue(filterKey, value);
    }
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onUpdateFilter('dateRange', {
      ...filters.dateRange,
      [field]: value
    });
  };

  // Options prédéfinies (en production, ces données viendraient de l'API)
  const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled'];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];
  const sourceOptions = ['email', 'manual', 'api', 'import'];
  const departmentOptions = ['IT', 'HR', 'Finance', 'Marketing', 'Operations'];
  const assigneeOptions = ['user1', 'user2', 'user3', 'admin']; // Exemple

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-center space-x-2 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <Filter className="w-4 h-4 text-gray-600" />
        <h3 className="font-semibold text-gray-700">Filtres</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {/* Statut */}
        <FilterSection
          title="Statut"
          icon={<div className="w-3 h-3 rounded-full bg-blue-400" />}
          isOpen={openSections.status}
          onToggle={() => toggleSection('status')}
        >
          <CheckboxGroup
            options={statusOptions}
            selected={filters.status || []}
            onChange={(value, checked) => handleCheckboxChange('status', value, checked)}
          />
        </FilterSection>

        {/* Priorité */}
        <FilterSection
          title="Priorité"
          icon={<div className="w-3 h-3 rounded-full bg-red-400" />}
          isOpen={openSections.priority}
          onToggle={() => toggleSection('priority')}
        >
          <CheckboxGroup
            options={priorityOptions}
            selected={filters.priority || []}
            onChange={(value, checked) => handleCheckboxChange('priority', value, checked)}
          />
        </FilterSection>

        {/* Assigné à */}
        <FilterSection
          title="Assigné à"
          icon={<User className="w-4 h-4 text-gray-600" />}
          isOpen={openSections.assignee}
          onToggle={() => toggleSection('assignee')}
        >
          <CheckboxGroup
            options={assigneeOptions}
            selected={filters.assignee || []}
            onChange={(value, checked) => handleCheckboxChange('assignee', value, checked)}
          />
        </FilterSection>

        {/* Tags */}
        <FilterSection
          title="Tags"
          icon={<Tag className="w-4 h-4 text-gray-600" />}
          isOpen={openSections.tags}
          onToggle={() => toggleSection('tags')}
        >
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Ajouter un tag..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = e.currentTarget.value.trim();
                  if (value && !(filters.tags || []).includes(value)) {
                    onAddFilterValue('tags', value);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
            {filters.tags && filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200"
                    onClick={() => onRemoveFilterValue('tags', tag)}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            )}
          </div>
        </FilterSection>

        {/* Plage de dates */}
        <FilterSection
          title="Période"
          icon={<Calendar className="w-4 h-4 text-gray-600" />}
          isOpen={openSections.dateRange}
          onToggle={() => toggleSection('dateRange')}
        >
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date de début</label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date de fin</label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </FilterSection>

        {/* Source */}
        <FilterSection
          title="Source"
          icon={<div className="w-3 h-3 rounded-full bg-green-400" />}
          isOpen={openSections.source}
          onToggle={() => toggleSection('source')}
        >
          <CheckboxGroup
            options={sourceOptions}
            selected={filters.source || []}
            onChange={(value, checked) => handleCheckboxChange('source', value, checked)}
          />
        </FilterSection>

        {/* Département */}
        <FilterSection
          title="Département"
          icon={<Building className="w-4 h-4 text-gray-600" />}
          isOpen={openSections.department}
          onToggle={() => toggleSection('department')}
        >
          <CheckboxGroup
            options={departmentOptions}
            selected={filters.department || []}
            onChange={(value, checked) => handleCheckboxChange('department', value, checked)}
          />
        </FilterSection>
      </div>
    </div>
  );
};
