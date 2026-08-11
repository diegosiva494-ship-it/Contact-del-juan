import React, { useState, useEffect } from 'react';
import { SupabaseConfig } from '../types';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Terminal,
  Info,
  Trash2,
} from 'lucide-react';
import {
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  getSQLSetupScript,
} from '../lib/supabase';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSaveConfig: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [showKey, setShowKey] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [sqlCopied, setSqlCopied] = useState(false);

  useEffect(() => {
    setUrl(config.url || '');
    setAnonKey(config.anonKey || '');
    setTestResult(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSave = async () => {
    saveSupabaseConfig(url.trim(), anonKey.trim());
    onSaveConfig();
    onClose();
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    onSaveConfig();
    setTestResult({
      success: true,
      message: 'Configurações removidas. O aplicativo utilizará o Armazenamento Local do navegador.',
    });
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(getSQLSetupScript());
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 transform transition-all">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Conexão Supabase Database</span>
                {config.isConnected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold">
                    Conectado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950 border border-amber-800 text-amber-300 font-semibold">
                    Não Conectado
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Configure as credenciais do seu projeto Supabase para persistência de dados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-200 text-sm">
          
          {/* Info Banner */}
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-300">Como conectar o Supabase:</p>
              <p className="text-slate-300 leading-relaxed">
                Insira a URL do seu projeto e a chave <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-300">anon</code> (public key). 
                Se você não configurou as variáveis no arquivo <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-300">.env</code>, você pode colar abaixo diretamente.
              </p>
            </div>
          </div>

          {/* Credentials Inputs */}
          <div className="space-y-4">
            
            {/* Supabase URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase URL (Project URL)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xxxxxx.supabase.co"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm font-mono focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Supabase Anon Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Anon / Public Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm font-mono focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Test Connection Button & Output */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !url || !anonKey}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Testando Conexão...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Testar Conexão</span>
                  </>
                )}
              </button>

              {config.isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Credenciais</span>
                </button>
              )}
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium flex items-start space-x-2.5 ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

          </div>

          {/* SQL Setup Script Section */}
          <div className="border-t border-slate-800 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                  Script SQL para Criar a Tabela no Supabase
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCopySQL}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                {sqlCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SQL Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Script SQL</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copie este código e execute-o no <strong>SQL Editor</strong> do seu painel Supabase para criar a tabela <code className="text-emerald-400">contacts</code> automaticamente:
            </p>

            <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-300/90 overflow-x-auto max-h-40 leading-relaxed shadow-inner">
              <pre>{getSQLSetupScript()}</pre>
            </div>

            <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1 pl-1">
              <li>Acesse seu projeto em <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">supabase.com</a>.</li>
              <li>Navegue até o menu lateral esquerdo e clique em <strong>SQL Editor</strong>.</li>
              <li>Clique em <strong>New query</strong>, cole o código acima e clique em <strong>Run</strong>.</li>
            </ol>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar e Atualizar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
