import React, { useState } from 'react';
import { Contact, ContactCategory } from '../types';
import { X, Download, Upload, FileSpreadsheet, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onImportContacts: (importedList: Omit<Contact, 'id' | 'created_at'>[]) => Promise<void>;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onImportContacts,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [jsonInput, setJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Email', 'Empresa', 'Cargo', 'Categoria', 'Endereço', 'Aniversário', 'Observações'];
    const rows = contacts.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.job_title || '').replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${c.birthday || ''}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contatos_exportados_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contacts, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `backup_contatos_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  // File Upload Reader for Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  // Process Import JSON or CSV
  const handleProcessImport = async () => {
    if (!jsonInput.trim()) {
      setImportStatus({ success: false, message: 'Cole ou envie o arquivo JSON/CSV antes de importar.' });
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      let parsedList: Omit<Contact, 'id' | 'created_at'>[] = [];

      if (jsonInput.trim().startsWith('[')) {
        // Parse JSON
        const raw = JSON.parse(jsonInput);
        if (Array.isArray(raw)) {
          parsedList = raw.map((item: any) => ({
            name: String(item.name || item.Nome || 'Contato Importado'),
            email: String(item.email || item.Email || ''),
            phone: String(item.phone || item.Telefone || ''),
            company: String(item.company || item.Empresa || ''),
            job_title: String(item.job_title || item.Cargo || ''),
            category: (item.category || item.Categoria || 'Outro') as ContactCategory,
            avatar_url: String(item.avatar_url || ''),
            notes: String(item.notes || item.Observações || ''),
            address: String(item.address || item.Endereço || ''),
            birthday: String(item.birthday || item.Aniversário || ''),
            is_favorite: Boolean(item.is_favorite),
            tags: Array.isArray(item.tags) ? item.tags : [],
          }));
        }
      } else {
        // Parse CSV lines
        const lines = jsonInput.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length > 1) {
          const rows = lines.slice(1); // skip header
          parsedList = rows.map((line) => {
            const cols = line.split(',').map((col) => col.replace(/^"/, '').replace(/"$/, '').trim());
            return {
              name: cols[0] || 'Contato Importado',
              phone: cols[1] || '',
              email: cols[2] || '',
              company: cols[3] || '',
              job_title: cols[4] || '',
              category: (cols[5] as ContactCategory) || 'Outro',
              address: cols[6] || '',
              birthday: cols[7] || '',
              notes: cols[8] || '',
              is_favorite: false,
              tags: ['Importado'],
            };
          });
        }
      }

      if (parsedList.length === 0) {
        setImportStatus({ success: false, message: 'Nenhum contato válido encontrado no arquivo fornecido.' });
        setIsImporting(false);
        return;
      }

      await onImportContacts(parsedList);
      setImportStatus({
        success: true,
        message: `${parsedList.length} contato(s) importado(s) com sucesso!`,
      });
      setJsonInput('');
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: `Erro ao processar importação: ${err?.message || 'Formato inválido.'}`,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8 transform transition-all">
        
        {/* Header Tabs */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'export'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'import'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-slate-200">
          
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Escolha o formato desejado para exportar seus <strong className="text-emerald-400">{contacts.length}</strong> contatos atuais:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleExportCSV}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left transition-all group"
                >
                  <FileSpreadsheet className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Planilha CSV</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Compatível com Microsoft Excel, Google Planilhas e Supabase SQL import.
                  </p>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 text-left transition-all group"
                >
                  <FileCode className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Backup JSON</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Backup completo com todos os campos estruturados e tags.
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Envie um arquivo <strong>.json</strong> ou <strong>.csv</strong> contendo a lista de contatos para importar:
              </p>

              <div>
                <input
                  type="file"
                  accept=".json,.csv,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ou cole o conteúdo JSON/CSV aqui:
                </label>
                <textarea
                  rows={5}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='[{"name": "João", "phone": "(11) 99999-9999", "email": "joao@email.com"}]'
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
                    importStatus.success
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}
                >
                  {importStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleProcessImport}
                disabled={isImporting || !jsonInput.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isImporting ? (
                  <span>Importando...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Confirmar Importação</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
