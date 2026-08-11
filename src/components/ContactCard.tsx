import React, { useState } from 'react';
import { Contact } from '../types';
import {
  Star,
  Phone,
  Mail,
  Building2,
  MessageCircle,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  MapPin,
} from 'lucide-react';
import {
  getCategoryBadgeColor,
  getInitials,
  getAvatarBgColor,
  formatWhatsAppLink,
  formatPhoneCall,
} from '../utils/contactUtils';

interface ContactCardProps {
  contact: Contact;
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, currentStatus: boolean) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const categoryStyle = getCategoryBadgeColor(contact.category);
  const avatarGradient = getAvatarBgColor(contact.name);

  return (
    <div className="group relative bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-slate-950/50 transition-all duration-200 flex flex-col justify-between">
      
      {/* Top Bar: Category & Actions */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          
          {/* Category Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          >
            {contact.category}
          </span>

          {/* Right Top Actions */}
          <div className="flex items-center space-x-1">
            {/* Favorite Star */}
            <button
              onClick={() => onToggleFavorite(contact.id, contact.is_favorite)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all"
              title={contact.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star
                className={`w-4 h-4 transition-all ${
                  contact.is_favorite
                    ? 'fill-amber-400 text-amber-400 scale-110'
                    : 'text-slate-400 group-hover:text-amber-300/80'
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-36 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-20 py-1 text-xs text-slate-200 divide-y divide-slate-800/80">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onView(contact);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-slate-800 hover:text-white"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ver Detalhes</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(contact);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-slate-800 hover:text-white"
                    >
                      <Pencil className="w-3.5 h-3.5 text-blue-400" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(contact.id);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-rose-950/50 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info Header */}
        <div className="flex items-center space-x-3.5 mb-4">
          
          {/* Avatar Image or Initials */}
          {contact.avatar_url && !imageError ? (
            <img
              src={contact.avatar_url}
              alt={contact.name}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-800 group-hover:ring-emerald-500/50 transition-all shadow-md shrink-0"
            />
          ) : (
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-lg ring-2 ring-slate-800 shadow-md shrink-0`}
            >
              {getInitials(contact.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3
              onClick={() => onView(contact)}
              className="text-base font-bold text-slate-100 truncate hover:text-emerald-400 cursor-pointer transition-colors"
            >
              {contact.name}
            </h3>
            {(contact.job_title || contact.company) && (
              <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                <span>
                  {contact.job_title}
                  {contact.job_title && contact.company ? ' • ' : ''}
                  {contact.company}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Contact Details List */}
        <div className="space-y-2 text-xs text-slate-300 mb-4">
          {contact.phone && (
            <div className="flex items-center justify-between text-slate-300 hover:text-white">
              <span className="flex items-center space-x-2 truncate">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-[13px]">{contact.phone}</span>
              </span>
              <div className="flex items-center space-x-1 shrink-0">
                <a
                  href={formatWhatsAppLink(contact.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-emerald-950/60 hover:bg-emerald-800 text-emerald-400 transition-colors"
                  title="Conversar no WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
                <a
                  href={formatPhoneCall(contact.phone)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Ligar"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {contact.email && (
            <div className="flex items-center space-x-2 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a
                href={`mailto:${contact.email}`}
                className="hover:underline text-slate-300 truncate"
              >
                {contact.email}
              </a>
            </div>
          )}

          {contact.address && (
            <div className="flex items-center space-x-2 truncate text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{contact.address}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {contact.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 border border-slate-800 text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <button
          onClick={() => onView(contact)}
          className="text-slate-400 hover:text-emerald-400 font-medium transition-colors flex items-center space-x-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver Perfil</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Editar contato"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
            title="Excluir contato"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
