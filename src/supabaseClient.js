// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

let supabase;

// --- Backend Node.js ---
if (typeof process !== "undefined" && process.env.NODE_ENV !== "development") {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variabili ambiente backend mancanti: VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }

  supabase = createClient(supabaseUrl, supabaseKey);
}

// --- Frontend React (Vite) ---
if (typeof window !== "undefined") {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variabili ambiente frontend mancanti: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY");
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
