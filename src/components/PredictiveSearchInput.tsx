import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, User, FileText, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Policy } from '@/types/policy';

interface SearchSuggestion {
  id: string;
  type: 'nombre' | 'rfc' | 'poliza' | 'aseguradora';
  value: string;
  displayText: string;
  policy: Policy;
  icon: React.ReactNode;
}

interface PredictiveSearchInputProps {
  policies: Policy[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PredictiveSearchInput: React.FC<PredictiveSearchInputProps> = ({
  policies,
  value,
  onChange,
  placeholder = "Buscar por nombre, RFC, número de póliza...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generar sugerencias basadas en el valor de búsqueda
  const suggestions = useMemo(() => {
    if (!value.trim() || value.length < 1) return [];

    const searchTerm = value.toLowerCase().trim();
    const suggestions: SearchSuggestion[] = [];
    const addedValues = new Set<string>(); // Para evitar duplicados

    policies.forEach(policy => {
      // Buscar en nombres del contratante
      if (policy.contratante?.nombre) {
        const nombre = policy.contratante.nombre.toLowerCase();
        if (nombre.includes(searchTerm) && !addedValues.has(policy.contratante.nombre)) {
          suggestions.push({
            id: `contratante-${policy.id}`,
            type: 'nombre',
            value: policy.contratante.nombre,
            displayText: policy.contratante.nombre,
            policy,
            icon: <User className="w-4 h-4 text-blue-500" />
          });
          addedValues.add(policy.contratante.nombre);
        }
      }

      // Buscar en nombres del asegurado
      if (policy.asegurado?.nombre && policy.asegurado.nombre !== policy.contratante?.nombre) {
        const nombre = policy.asegurado.nombre.toLowerCase();
        if (nombre.includes(searchTerm) && !addedValues.has(policy.asegurado.nombre)) {
          suggestions.push({
            id: `asegurado-${policy.id}`,
            type: 'nombre',
            value: policy.asegurado.nombre,
            displayText: policy.asegurado.nombre,
            policy,
            icon: <User className="w-4 h-4 text-green-500" />
          });
          addedValues.add(policy.asegurado.nombre);
        }
      }

      // Buscar en RFC del contratante
      if (policy.contratante?.rfc) {
        const rfc = policy.contratante.rfc.toLowerCase();
        if (rfc.includes(searchTerm) && !addedValues.has(policy.contratante.rfc)) {
          suggestions.push({
            id: `rfc-contratante-${policy.id}`,
            type: 'rfc',
            value: policy.contratante.rfc,
            displayText: `${policy.contratante.rfc} - ${policy.contratante.nombre}`,
            policy,
            icon: <FileText className="w-4 h-4 text-purple-500" />
          });
          addedValues.add(policy.contratante.rfc);
        }
      }

      // Buscar en RFC del asegurado
      if (policy.asegurado?.rfc && policy.asegurado.rfc !== policy.contratante?.rfc) {
        const rfc = policy.asegurado.rfc.toLowerCase();
        if (rfc.includes(searchTerm) && !addedValues.has(policy.asegurado.rfc)) {
          suggestions.push({
            id: `rfc-asegurado-${policy.id}`,
            type: 'rfc',
            value: policy.asegurado.rfc,
            displayText: `${policy.asegurado.rfc} - ${policy.asegurado.nombre}`,
            policy,
            icon: <FileText className="w-4 h-4 text-purple-500" />
          });
          addedValues.add(policy.asegurado.rfc);
        }
      }

      // Buscar en número de póliza
      if (policy.policyNumber) {
        const policyNumber = policy.policyNumber.toLowerCase();
        if (policyNumber.includes(searchTerm)) {
          suggestions.push({
            id: `policy-${policy.id}`,
            type: 'poliza',
            value: policy.policyNumber,
            displayText: `${policy.policyNumber} - ${policy.contratante?.nombre || 'Sin nombre'}`,
            policy,
            icon: <FileText className="w-4 h-4 text-orange-500" />
          });
        }
      }

      // Buscar en aseguradora
      if (policy.aseguradora) {
        const aseguradora = policy.aseguradora.toLowerCase();
        if (aseguradora.includes(searchTerm) && !addedValues.has(policy.aseguradora)) {
          suggestions.push({
            id: `aseguradora-${policy.id}`,
            type: 'aseguradora',
            value: policy.aseguradora,
            displayText: policy.aseguradora,
            policy,
            icon: <Building className="w-4 h-4 text-indigo-500" />
          });
          addedValues.add(policy.aseguradora);
        }
      }
    });

    // Ordenar por relevancia (coincidencias exactas primero, luego parciales)
    return suggestions
      .sort((a, b) => {
        const aExact = a.value.toLowerCase().startsWith(searchTerm);
        const bExact = b.value.toLowerCase().startsWith(searchTerm);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return a.displayText.localeCompare(b.displayText);
      })
      .slice(0, 8); // Limitar a 8 sugerencias
  }, [policies, value]);

  // Manejar clics fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    onChange(suggestion.value);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(newValue.length > 0);
    setSelectedIndex(-1);
  };

  // Limpiar búsqueda
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Obtener el tipo de sugerencia en español
  const getTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'nombre': return 'Nombre';
      case 'rfc': return 'RFC';
      case 'poliza': return 'Póliza';
      case 'aseguradora': return 'Aseguradora';
      default: return '';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(value.length > 0 && suggestions.length > 0)}
          className={`pl-10 pr-10 h-12 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${className}`}
          autoComplete="off"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto"
        >
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                  index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {suggestion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {suggestion.displayText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {getTypeLabel(suggestion.type)}
                    </span>
                    <span>•</span>
                    <span className="truncate">
                      {suggestion.policy.aseguradora} - {suggestion.policy.ramo}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {suggestions.length === 8 && (
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600">
              Mostrando las primeras 8 coincidencias. Continúa escribiendo para refinar la búsqueda.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
