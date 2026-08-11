import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Contact, SupabaseConfig } from '../types';
import { INITIAL_CONTACTS } from '../data/initialContacts';

const LOCAL_STORAGE_KEY = 'cadastro_contatos_local_v1';
const SUPABASE_CONFIG_KEY = 'supabase_config_v1';

// Read config from env or localStorage
export function getSavedSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          isConfigured: true,
          isConnected: false,
        };
      }
    } catch {
      // ignore
    }
  }

  const isConfigured = Boolean(envUrl && envUrl !== 'https://your-project.supabase.co' && envKey && envKey !== 'your-anon-key');

  return {
    url: envUrl,
    anonKey: envKey,
    isConfigured,
    isConnected: false,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(
    SUPABASE_CONFIG_KEY,
    JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
  );
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const cfg = config || getSavedSupabaseConfig();
  if (!cfg.url || !cfg.anonKey || cfg.url.includes('your-project.supabase.co')) {
    return null;
  }

  try {
    if (!supabaseInstance || (supabaseInstance as any).supabaseUrl !== cfg.url) {
      supabaseInstance = createClient(cfg.url, cfg.anonKey);
    }
    return supabaseInstance;
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err);
    return null;
  }
}

// Local Storage Fallback helpers
export function getLocalContacts(): Contact[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CONTACTS));
    return INITIAL_CONTACTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CONTACTS;
  }
}

export function saveLocalContacts(contacts: Contact[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
}

// Unified CRUD functions that sync with Supabase or Fallback to Local Storage
export async function fetchContacts(): Promise<{ contacts: Contact[]; isFromSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { contacts: getLocalContacts(), isFromSupabase: false };
  }

  try {
    const { data, error } = await client
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao buscar do Supabase (usando dados locais):', error.message);
      return {
        contacts: getLocalContacts(),
        isFromSupabase: false,
        error: `Supabase: ${error.message}. Tabela "contacts" pode não existir.`,
      };
    }

    if (data) {
      const formatted: Contact[] = data.map((item: any) => ({
        id: String(item.id),
        name: item.name || 'Sem nome',
        email: item.email || '',
        phone: item.phone || '',
        company: item.company || '',
        job_title: item.job_title || '',
        category: item.category || 'Outro',
        avatar_url: item.avatar_url || '',
        notes: item.notes || '',
        address: item.address || '',
        birthday: item.birthday || '',
        is_favorite: Boolean(item.is_favorite),
        tags: Array.isArray(item.tags) ? item.tags : [],
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
      }));

      // Cache locally for offline availability
      saveLocalContacts(formatted);
      return { contacts: formatted, isFromSupabase: true };
    }

    return { contacts: getLocalContacts(), isFromSupabase: false };
  } catch (err: any) {
    return {
      contacts: getLocalContacts(),
      isFromSupabase: false,
      error: err?.message || 'Falha na conexão com Supabase.',
    };
  }
}

export async function createContact(
  contactData: Omit<Contact, 'id' | 'created_at'>
): Promise<{ contact: Contact; isFromSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  const now = new Date().toISOString();

  if (client) {
    try {
      const payload = {
        name: contactData.name,
        email: contactData.email || null,
        phone: contactData.phone || null,
        company: contactData.company || null,
        job_title: contactData.job_title || null,
        category: contactData.category || 'Outro',
        avatar_url: contactData.avatar_url || null,
        notes: contactData.notes || null,
        address: contactData.address || null,
        birthday: contactData.birthday || null,
        is_favorite: contactData.is_favorite || false,
        tags: contactData.tags || [],
        updated_at: now,
      };

      const { data, error } = await client
        .from('contacts')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        const newContact: Contact = {
          id: String(data.id),
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          company: data.company || '',
          job_title: data.job_title || '',
          category: data.category || 'Outro',
          avatar_url: data.avatar_url || '',
          notes: data.notes || '',
          address: data.address || '',
          birthday: data.birthday || '',
          is_favorite: Boolean(data.is_favorite),
          tags: data.tags || [],
          created_at: data.created_at || now,
          updated_at: data.updated_at || now,
        };
        // update local cache
        const current = getLocalContacts();
        saveLocalContacts([newContact, ...current]);
        return { contact: newContact, isFromSupabase: true };
      } else if (error) {
        console.warn('Erro ao inserir no Supabase, salvando localmente:', error.message);
      }
    } catch (err) {
      console.error('Falha no insert Supabase:', err);
    }
  }

  // Fallback to local storage creation
  const localId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const newLocalContact: Contact = {
    ...contactData,
    id: localId,
    created_at: now,
    updated_at: now,
  };

  const current = getLocalContacts();
  const updatedList = [newLocalContact, ...current];
  saveLocalContacts(updatedList);

  return { contact: newLocalContact, isFromSupabase: false };
}

export async function updateContactInDb(
  id: string,
  updates: Partial<Omit<Contact, 'id' | 'created_at'>>
): Promise<{ success: boolean; isFromSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  const now = new Date().toISOString();

  // Update local storage first
  const current = getLocalContacts();
  const index = current.findIndex((c) => c.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...updates, updated_at: now };
    saveLocalContacts(current);
  }

  if (client && !id.startsWith('local_')) {
    try {
      const payload: any = { ...updates, updated_at: now };
      const { error } = await client.from('contacts').update(payload).eq('id', id);
      if (!error) {
        return { success: true, isFromSupabase: true };
      } else {
        return { success: true, isFromSupabase: false, error: error.message };
      }
    } catch (err: any) {
      return { success: true, isFromSupabase: false, error: err?.message };
    }
  }

  return { success: true, isFromSupabase: false };
}

export async function deleteContactFromDb(id: string): Promise<{ success: boolean; isFromSupabase: boolean }> {
  const client = getSupabaseClient();

  // Remove from local storage
  const current = getLocalContacts();
  const filtered = current.filter((c) => c.id !== id);
  saveLocalContacts(filtered);

  if (client && !id.startsWith('local_')) {
    try {
      const { error } = await client.from('contacts').delete().eq('id', id);
      if (!error) {
        return { success: true, isFromSupabase: true };
      }
    } catch (err) {
      console.error('Erro ao deletar no Supabase:', err);
    }
  }

  return { success: true, isFromSupabase: false };
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL e Anon Key do Supabase são obrigatórios.' };
  }

  try {
    const testClient = createClient(url, anonKey);
    const { data, error } = await testClient.from('contacts').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
        return { success: false, message: 'Chave Anon inválida ou sem permissão RLS.' };
      }
      if (error.code === '42P01' || error.message.includes('relation "contacts" does not exist') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Conectado ao Supabase! Porém a tabela "contacts" ainda não foi criada. Copie e execute o script SQL fornecido abaixo no SQL Editor do seu projeto Supabase.',
        };
      }
      return { success: false, message: `Erro no Supabase: ${error.message}` };
    }

    return { success: true, message: 'Conexão estabelecida com sucesso! Tabela "contacts" encontrada.' };
  } catch (err: any) {
    return { success: false, message: `Falha na conexão: ${err?.message || 'Verifique a URL e a chave.'}` };
  }
}

export function getSQLSetupScript(): string {
  return `-- Copie e cole este script no SQL Editor do seu projeto Supabase:

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  category TEXT DEFAULT 'Outro',
  avatar_url TEXT,
  notes TEXT,
  address TEXT,
  birthday DATE,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura e escrita pública (ou ajuste conforme suas regras de Auth)
CREATE POLICY "Permitir acesso total público para contatos" 
ON public.contacts 
FOR ALL 
USING (true) 
WITH CHECK (true);
`;
}
