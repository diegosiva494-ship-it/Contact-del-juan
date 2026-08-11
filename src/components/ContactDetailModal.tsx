import React, { useState } from 'react';
import { Contact } from '../types';
import {
  X,
  Star,
  Phone,
  Mail,
  Building2,
  MessageCircle,
  MapPin,
  Calendar,
  FileText,
  Tag,
  Pencil,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Download,
} from 'lucide-react';
import {
  getCategoryBadgeColor,
  getInitials,
  getAvatarBgColor,
  formatWhatsAppLink,
  formatPhoneCall,
} from '../utils/contactUtils';

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, currentStatus: boolean) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !contact) return null;

  const categoryStyle = getCategoryBadgeColor(contact.category);
  const avatarGradient = getAvatarBgColor(contact.name);

  const handleCopyInfo = () => {
    const text = `Nome: ${contact.name}\nTelefone: ${contact.phone || 'N/A'}\nEmail: ${contact.email || 'N/A'}\nEmpresa: ${contact.company || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
${contact.phone ? `TEL;TYPE=CELL:${contact.phone}` : ''}
${contact.email ? `EMAIL:${contact.email}` : ''}
${contact.company ? `ORG:${contact.company}` : ''}
${contact.job_title ? `TITLE:${contact.job_title}` : ''}
${contact.address ? `ADR:${contact.address}` : ''}
${contact.notes ? `NOTE:${contact.notes}` : ''}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contact.name.replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8 transform transition-all">
        
        {/* Banner Header with Avatar */}
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 border-b border-slate-800">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-4">
            
            {/* Avatar */}
            {contact.avatar_url && !imageError ? (
              <img
                src={contact.avatar_url}
                alt={contact.name}
                onError={() => setImageError(true)}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-lg"
              />
            ) : (
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-2xl ring-4 ring-emerald-500/30 shadow-lg`}
              >
                {getInitials(contact.name)}
              </div>
            )}

            {/* Name & Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
                >
                  {contact.category}
                </span>

                <button
                  onClick={() => onToggleFavorite(contact.id, contact.is_favorite)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                  title={contact.is_favorite ? 'Remover favorito' : 'Favoritar'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      contact.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
              </div>

              <h2 className="text-xl font-extrabold text-white truncate">
                {contact.name}
              </h2>

              {(contact.job_title || contact.company) && (
                <p className="text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {contact.job_title} {contact.job_title && contact.company ? 'em' : ''} {contact.company}
                  </span>
                </p>
              )}
            </div>

          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {contact.phone ? (
              <a
                href={formatWhatsAppLink(contact.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 hover:bg-emerald-900/60 text-emerald-300 transition-colors group"
              >
                <MessageCircle className="w-5 h-5 mb-1 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold">WhatsApp</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-slate-600 opacity-50">
                <MessageCircle className="w-5 h-5 mb-1" />
                <span className="text-[10px]">WhatsApp</span>
              </div>
            )}

            {contact.phone ? (
              <a
                href={formatPhoneCall(contact.phone)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 transition-colors group"
              >
                <Phone className="w-5 h-5 mb-1 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold">Ligar</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-slate-600 opacity-50">
                <Phone className="w-5 h-5 mb-1" />
                <span className="text-[10px]">Ligar</span>
              </div>
            )}

            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 transition-colors group"
              >
                <Mail className="w-5 h-5 mb-1 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold">E-mail</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-slate-600 opacity-50">
                <Mail className="w-5 h-5 mb-1" />
                <span className="text-[10px]">E-mail</span>
              </div>
            )}

            <button
              onClick={handleCopyInfo}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 transition-colors group"
            >
              {copied ? (
                <Check className="w-5 h-5 mb-1 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5 mb-1 text-amber-400 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-[10px] font-semibold">{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

        </div>

        {/* Detail List Sections */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto text-sm text-slate-200">
          
          {/* Phone */}
          {contact.phone && (
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <Phone className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Telefone / Celular</p>
                <p className="font-mono text-slate-100 font-semibold">{contact.phone}</p>
              </div>
            </div>
          )}

          {/* Email */}
          {contact.email && (
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <Mail className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Endereço de E-mail</p>
                <p className="font-medium text-slate-100 truncate">{contact.email}</p>
              </div>
            </div>
          )}

          {/* Address */}
          {contact.address && (
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <MapPin className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Endereço</p>
                <p className="text-slate-100 font-medium">{contact.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    contact.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-emerald-400 hover:underline mt-1"
                >
                  <span>Abrir no Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Birthday */}
          {contact.birthday && (
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <Calendar className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Data de Nascimento</p>
                <p className="text-slate-100 font-medium">{contact.birthday}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs text-slate-400 mb-2 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Tags</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs text-slate-400 mb-1 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Observações</span>
              </p>
              <p className="text-slate-300 text-xs whitespace-pre-line leading-relaxed">
                {contact.notes}
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleExportVCard}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Baixar Cartão vCard</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(contact);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(contact.id);
              }}
              className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
