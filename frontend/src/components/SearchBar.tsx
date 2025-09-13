import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void; // Fonction optionnelle pour effacement complet
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Rechercher des tâches...",
  className = ""
}) => {
  // État local pour l'input
  const [inputValue, setInputValue] = useState(value || '');
  const lastPropsValue = useRef(value);
  
  // Debouncing
  const debouncedValue = useDebounce(inputValue, 1200);

  // Synchroniser SEULEMENT si value props change vraiment
  useEffect(() => {
    if (value !== lastPropsValue.current) {
      setInputValue(value || '');
      lastPropsValue.current = value;
    }
  }, [value]);

  // Recherche automatique après debounce - SEULEMENT si différent de la prop
  useEffect(() => {
    if (debouncedValue !== lastPropsValue.current) {
      lastPropsValue.current = debouncedValue;
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const searchValue = inputValue.trim();
      lastPropsValue.current = searchValue;
      onChange(searchValue);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🗑️ SearchBar X - Effacement REDONDANT');
    
    // Effacement local immédiat
    setInputValue('');
    lastPropsValue.current = '';
    
    // Effacement via onChange (normal)
    onChange('');
    
    // Effacement redondant via onClear (sécurité)
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer z-10 focus:outline-none bg-white hover:bg-red-50 rounded-full p-1"
            aria-label="Effacer la recherche"
            title="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
