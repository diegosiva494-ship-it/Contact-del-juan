import { ContactCategory } from '../types';

export function getCategoryBadgeColor(category: ContactCategory): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Trabalho':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'Pessoal':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'Família':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
    case 'Clientes':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' };
  }
}

export function getInitials(name: string): string {
  if (!name) return 'C';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarBgColor(name: string): string {
  const colors = [
    'from-blue-600 to-indigo-700',
    'from-emerald-600 to-teal-700',
    'from-rose-600 to-pink-700',
    'from-amber-600 to-orange-700',
    'from-purple-600 to-indigo-800',
    'from-cyan-600 to-blue-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function formatWhatsAppLink(phone: string): string {
  if (!phone) return '#';
  const digits = phone.replace(/\D/g, '');
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCountry}`;
}

export function formatPhoneCall(phone: string): string {
  if (!phone) return '#';
  return `tel:${phone.replace(/\D/g, '')}`;
}
