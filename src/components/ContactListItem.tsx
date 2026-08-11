import React, { useState } from 'react';
import { Contact } from '../types';
import {
  Star,
  Phone,
  Mail,
  Building2,
  MessageCircle,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  getCategoryBadgeColor,
  getInitials,
  getAvatarBgColor,
  formatWhatsAppLink,
  formatPhoneCall,
} from '../utils/contactUtils';

interface ContactListItemProps {
  contact: Contact;
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, currentStatus: boolean) => void;
}

export const ContactListItem: React.FC<ContactListItemProps> = ({
  contact,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [imageError, setImageError] = useState(false);
  const categoryStyle = getCategoryBadgeColor(contact.category);
  const avatarGradient = getAvatarBgColor(contact.name);

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
      
      {/* Left Avatar + Main Info */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        
        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(contact.id, contact.is_favorite)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all shrink-0"
        >
          <Star
            className={`w-4 h-4 ${
              contact.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
            }`}
          />
        </button>

        {/* Avatar */}
        {contact.avatar_url && !imageError ? (
          <img
            src={contact.avatar_url}
            alt={contact.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-xs ring-1 ring-slate-700 shrink-0`}
          >
            {getInitials(contact.name)}
          </div>
        )}

        {/* Name & Role */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h4
              onClick={() => onView(contact)}
              className="text-sm font-bold text-slate-100 truncate hover:text-emerald-400 cursor-pointer"
            >
              {contact.name}
            </h4>
            <span
              className={`hidden md:inline px-2 py-0.5 rounded text-[10px] font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
            >
              {contact.category}
            </span>
          </div>

          {(contact.company || contact.job_title) && (
            <p className="text-xs text-slate-400 truncate flex items-center space-x-1">
              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
              <span>
                {contact.job_title} {contact.job_title && contact.company ? '•' : ''} {contact.company}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Middle Contact Data */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
        {contact.phone && (
          <div className="flex items-center space-x-1.5 font-mono">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{contact.phone}</span>
            <a
              href={formatWhatsAppLink(contact.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded bg-emerald-950 hover:bg-emerald-800 text-emerald-400"
              title="WhatsApp"
            >
              <MessageCircle className="w-3 h-3" />
            </a>
          </div>
        )}

        {contact.email && (
          <div className="hidden lg:flex items-center space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <a href={`mailto:${contact.email}`} className="hover:underline">
              {contact.email}
            </a>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-1 justify-end shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
        <button
          onClick={() => onView(contact)}
          className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
          title="Ver perfil completo"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(contact)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Editar contato"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(contact.id)}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
          title="Excluir contato"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
