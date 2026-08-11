import React from 'react';
import { Search, X, LayoutGrid, List, ArrowUpDown, Filter } from 'lucide-react';
import { FilterOptions, ViewMode } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  availableTags: string[];
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  availableTags,
  totalFiltered,
}) => {
  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.tag || filters.onlyFavorites
  );

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Buscar por nome, e-mail, telefone, empresa ou tag..."
            className="w-full pl-10 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Right */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Tag Select Filter */}
          {availableTags.length > 0 && (
            <div className="relative">
              <select
                value={filters.tag}
                onChange={(e) => onFilterChange({ tag: e.target.value })}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
              >
                <option value="">Todas as Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
            >
              <option value="name_asc">Nome (A - Z)</option>
              <option value="name_desc">Nome (Z - A)</option>
              <option value="recent">Mais Recentes</option>
              <option value="company">Por Empresa</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={() =>
                onFilterChange({
                  search: '',
                  category: '',
                  tag: '',
                  onlyFavorites: false,
                })
              }
              className="px-3 py-2 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 text-xs font-medium transition-all flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}

          {/* Grid vs List View Switcher */}
          <div className="flex items-center bg-slate-950 p-1 border border-slate-800 rounded-xl">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Filter summary status text if filtered */}
      {hasActiveFilters && (
        <div className="max-w-7xl mx-auto mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>
            Mostrando <strong className="text-emerald-400">{totalFiltered}</strong> resultado(s)
          </span>
        </div>
      )}
    </div>
  );
};
