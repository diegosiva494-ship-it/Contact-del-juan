import React from 'react';
import { UserPlus, Database, Settings, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { SupabaseConfig } from '../types';

interface HeaderProps {
  supabaseConfig: SupabaseConfig;
  onOpenSettings: () => void;
  onOpenNewContact: () => void;
  onOpenImportExport: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalContacts: number;
}

export const Header: React.FC<HeaderProps> = ({
  supabaseConfig,
  onOpenSettings,
  onOpenNewContact,
  onOpenImportExport,
  onRefresh,
  isRefreshing,
  totalContacts,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Cadastro de Contatos
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {totalContacts} {totalContacts === 1 ? 'contato' : 'contatos'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gerencie seus contatos integrados com Supabase Database
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Supabase Status Indicator Button */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/50'
                  : supabaseConfig.isConfigured
                  ? 'bg-amber-950/40 border-amber-800 text-amber-300 hover:bg-amber-900/50'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Clique para gerenciar conexões do Supabase"
            >
              {supabaseConfig.isConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="hidden md:inline">Supabase Ativo</span>
                </>
              ) : supabaseConfig.isConfigured ? (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">Verificar Supabase</span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="hidden md:inline">Modo Local (Configurar Supabase)</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all disabled:opacity-50"
              title="Atualizar lista de contatos"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Import/Export */}
            <button
              onClick={onOpenImportExport}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 text-xs font-medium transition-all"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Importar / Exportar</span>
            </button>

            {/* Add Contact Button */}
            <button
              onClick={onOpenNewContact}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all duration-150 transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Contato</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
