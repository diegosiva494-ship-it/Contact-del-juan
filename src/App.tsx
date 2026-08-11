import React, { useState, useEffect, useMemo } from 'react';
import { Contact, SupabaseConfig, ViewMode, FilterOptions } from './types';
import {
  fetchContacts,
  createContact,
  updateContactInDb,
  deleteContactFromDb,
  getSavedSupabaseConfig,
} from './lib/supabase';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { ContactCard } from './components/ContactCard';
import { ContactListItem } from './components/ContactListItem';
import { ContactFormModal } from './components/ContactFormModal';
import { ContactDetailModal } from './components/ContactDetailModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { ImportExportModal } from './components/ImportExportModal';
import { Database, AlertTriangle, Users, Plus, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSavedSupabaseConfig());
  const [isFromSupabase, setIsFromSupabase] = useState<boolean>(false);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // View & Filters
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    tag: '',
    onlyFavorites: false,
    sortBy: 'name_asc',
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Contacts Function
  const loadContactsData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);

    const currentConfig = getSavedSupabaseConfig();
    setSupabaseConfig(currentConfig);

    const res = await fetchContacts();
    setContacts(res.contacts);
    setIsFromSupabase(res.isFromSupabase);
    setDbErrorMessage(res.error);

    setSupabaseConfig((prev) => ({
      ...prev,
      isConnected: res.isFromSupabase,
    }));

    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadContactsData();
  }, []);

  const handleRefreshConfig = () => {
    loadContactsData(true);
  };

  // Extract all available unique tags from contacts
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    contacts.forEach((c) => {
      if (c.tags) {
        c.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet).sort();
  }, [contacts]);

  // Filter & Sort Logic
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((c) => {
        // Search match
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const nameMatch = c.name.toLowerCase().includes(q);
          const emailMatch = c.email?.toLowerCase().includes(q);
          const phoneMatch = c.phone?.toLowerCase().includes(q);
          const companyMatch = c.company?.toLowerCase().includes(q);
          const tagMatch = c.tags?.some((t) => t.toLowerCase().includes(q));

          if (!nameMatch && !emailMatch && !phoneMatch && !companyMatch && !tagMatch) {
            return false;
          }
        }

        // Category match
        if (filters.category && c.category !== filters.category) {
          return false;
        }

        // Tag match
        if (filters.tag && (!c.tags || !c.tags.includes(filters.tag))) {
          return false;
        }

        // Favorites match
        if (filters.onlyFavorites && !c.is_favorite) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'name_asc') {
          return a.name.localeCompare(b.name, 'pt-BR');
        } else if (filters.sortBy === 'name_desc') {
          return b.name.localeCompare(a.name, 'pt-BR');
        } else if (filters.sortBy === 'recent') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (filters.sortBy === 'company') {
          return (a.company || '').localeCompare(b.company || '', 'pt-BR');
        }
        return 0;
      });
  }, [contacts, filters]);

  // Handlers for Contact CRUD
  const handleSaveContact = async (
    contactData: Omit<Contact, 'id' | 'created_at'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Update
      const res = await updateContactInDb(existingId, contactData);
      if (res.success) {
        showToast('Contato atualizado com sucesso!');
        loadContactsData(false);
      } else {
        showToast('Erro ao atualizar contato.', 'error');
      }
    } else {
      // Create
      const res = await createContact(contactData);
      if (res.contact) {
        showToast(
          res.isFromSupabase
            ? 'Contato cadastrado no Supabase com sucesso!'
            : 'Contato salvo localmente!'
        );
        loadContactsData(false);
      }
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      const res = await deleteContactFromDb(id);
      if (res.success) {
        showToast('Contato removido.');
        setContacts((prev) => prev.filter((c) => c.id !== id));
      }
    }
  };

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    // Instant optimistic update
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_favorite: !currentStatus } : c))
    );

    await updateContactInDb(id, { is_favorite: !currentStatus });
  };

  const handleImportContacts = async (importedList: Omit<Contact, 'id' | 'created_at'>[]) => {
    let successCount = 0;
    for (const item of importedList) {
      await createContact(item);
      successCount++;
    }
    showToast(`${successCount} contato(s) importado(s)!`);
    loadContactsData(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      
      {/* Toast Notification Floating */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center space-x-2 animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
              : 'bg-rose-950 border-rose-500 text-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <Header
        supabaseConfig={supabaseConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewContact={() => {
          setEditingContact(null);
          setIsFormOpen(true);
        }}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onRefresh={handleRefreshConfig}
        isRefreshing={isRefreshing}
        totalContacts={contacts.length}
      />

      {/* Database Connection Info Banner */}
      {!isFromSupabase && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-800/60 py-2.5 px-4 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Modo Local Ativo:</strong> Seus contatos estão salvos no navegador.
                {dbErrorMessage ? ` (${dbErrorMessage})` : ' Conecte seu Supabase para sincronizar em nuvem.'}
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 transition-colors"
            >
              Configurar Supabase
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary Banner */}
      <StatsBanner
        contacts={contacts}
        selectedCategory={filters.category}
        onSelectCategory={(cat) => setFilters((f) => ({ ...f, category: cat }))}
        onlyFavorites={filters.onlyFavorites}
        onToggleFavorites={() => setFilters((f) => ({ ...f, onlyFavorites: !f.onlyFavorites }))}
      />

      {/* Filters & Views Navigation */}
      <FilterBar
        filters={filters}
        onFilterChange={(newF) => setFilters((f) => ({ ...f, ...newF }))}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableTags={availableTags}
        totalFiltered={filteredContacts.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Carregando contatos...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Nenhum contato encontrado
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {filters.search || filters.category || filters.onlyFavorites
                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente limpar os filtros.'
                : 'Você ainda não possui contatos cadastrados. Clique abaixo para cadastrar o primeiro!'}
            </p>
            <button
              onClick={() => {
                if (filters.search || filters.category || filters.onlyFavorites) {
                  setFilters({
                    search: '',
                    category: '',
                    tag: '',
                    onlyFavorites: false,
                    sortBy: 'name_asc',
                  });
                } else {
                  setEditingContact(null);
                  setIsFormOpen(true);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 inline-flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>
                {filters.search || filters.category || filters.onlyFavorites
                  ? 'Limpar Filtros'
                  : 'Cadastrar Primeiro Contato'}
              </span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onView={(c) => {
                  setSelectedContact(c);
                  setIsDetailOpen(true);
                }}
                onEdit={(c) => {
                  setEditingContact(c);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteContact}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredContacts.map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                onView={(c) => {
                  setSelectedContact(c);
                  setIsDetailOpen(true);
                }}
                onEdit={(c) => {
                  setEditingContact(c);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteContact}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Cadastro de Contatos • Integrado com Supabase Database</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-emerald-400">
              Supabase Status
            </button>
            <span>•</span>
            <button onClick={() => setIsImportExportOpen(true)} className="hover:text-emerald-400">
              Exportar CSV / JSON
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContactFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveContact}
        initialData={editingContact}
      />

      <ContactDetailModal
        isOpen={isDetailOpen}
        contact={selectedContact}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(c) => {
          setEditingContact(c);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteContact}
        onToggleFavorite={handleToggleFavorite}
      />

      <SupabaseSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={supabaseConfig}
        onSaveConfig={handleRefreshConfig}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        contacts={contacts}
        onImportContacts={handleImportContacts}
      />

    </div>
  );
}
