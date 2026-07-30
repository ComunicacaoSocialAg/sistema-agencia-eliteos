import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for placeholder values (unfilled .env template)
const isPlaceholder = (val) => !val || val.includes('SEU_') || val.includes('SUA_') || val === 'undefined';

const isConfigured = !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[CS Ag OS] Supabase não configurado. ' +
    'Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. ' +
    'O sistema rodará em modo demonstração com dados locais.'
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = !!supabase;

