import React from 'react';
import { Contact, ContactCategory } from '../types';
import { Users, Star, Briefcase, User, Heart, Building2, Tag } from 'lucide-react';

interface StatsBannerProps {
  contacts: Contact[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  contacts,
  selectedCategory,
  onSelectCategory,
  onlyFavorites,
  onToggleFavorites,
}) => {
  const total = contacts.length;
  const favoritesCount = contacts.filter((c) => c.is_favorite).length;

  const countByCategory = (cat: ContactCategory) =>
    contacts.filter((c) => c.category === cat).length;

  const categories: { label: ContactCategory; count: number; icon: React.ReactNode; color: string }[] = [
    {
      label: 'Trabalho',
      count: countByCategory('Trabalho'),
      icon: <Briefcase className="w-3.5 h-3.5" />,
      color: 'hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Pessoal',
      count: countByCategory('Pessoal'),
      icon: <User className="w-3.5 h-3.5" />,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Família',
      count: countByCategory('Família'),
      icon: <Heart className="w-3.5 h-3.5" />,
      color: 'hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400',
    },
    {
      label: 'Clientes',
      count: countByCategory('Clientes'),
      icon: <Building2 className="w-3.5 h-3.5" />,
      color: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400',
    },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Left Side: Category Chips */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* All Contacts Filter Chip */}
          <button
            onClick={() => {
              onSelectCategory('');
              if (onlyFavorites) onToggleFavorites();
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedCategory === '' && !onlyFavorites
                ? 'bg-slate-700 border-slate-500 text-white shadow'
                : 'bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Todos</span>
            <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-900 text-[11px] font-bold text-slate-300">
              {total}
            </span>
          </button>

          {/* Favorites Filter Chip */}
          <button
            onClick={() => {
              onToggleFavorites();
              if (selectedCategory !== '') onSelectCategory('');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
              onlyFavorites
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow'
                : 'bg-slate-800/80 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/30'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
            <span>Favoritos</span>
            <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-900 text-[11px] font-bold text-amber-400">
              {favoritesCount}
            </span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block my-auto" />

          {/* Individual Category Chips */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.label && !onlyFavorites;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  onSelectCategory(cat.label);
                  if (onlyFavorites) onToggleFavorites();
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-700 border-emerald-500/80 text-emerald-300 shadow'
                    : `bg-slate-800/80 border-slate-800 text-slate-400 ${cat.color}`
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className="ml-1 text-[11px] font-bold text-slate-400">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Info Tag */}
        <div className="hidden lg:flex items-center space-x-2 text-slate-400 text-xs">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          <span>Contatos cadastrados com sincronização</span>
        </div>

      </div>
    </div>
  );
};
