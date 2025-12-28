import { createClient } from '@supabase/supabase-js';

// Le chiavi pubbliche vengono lette dalle variabili d'ambiente del client.
// Utilizziamo un fallback generico per coprire diversi bundler (Vite, CRA).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("FATAL ERROR: Supabase URL o Anon Key mancanti. Controlla il tuo file .env e le variabili d'ambiente.");
  throw new Error("Supabase client cannot be initialized due to missing keys.");
}

// Crea il client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
