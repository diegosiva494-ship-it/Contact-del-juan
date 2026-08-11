export type ContactCategory = 'Trabalho' | 'Pessoal' | 'Família' | 'Clientes' | 'Outro';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  category: ContactCategory;
  avatar_url?: string;
  notes?: string;
  address?: string;
  birthday?: string;
  is_favorite: boolean;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  isConnected: boolean;
}

export type ViewMode = 'grid' | 'list';

export interface FilterOptions {
  search: string;
  category: string;
  tag: string;
  onlyFavorites: boolean;
  sortBy: 'name_asc' | 'name_desc' | 'recent' | 'company';
}
