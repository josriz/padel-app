// src/utils/registerToTournament.js - ✅ FIX: profile_id + nomi reali
import { supabase } from '../supabaseClient';

export async function registerToTournament({ userId, tournamentId }) {
  try {
    // ✅ RECUPERA profile_id dal user_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return { ok: false, error: profileError || 'Profilo non trovato' };
    }

    // ✅ INSERT con profile_id (NON user_id)
    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert([{ 
        profile_id: profile.id,  // ✅ profile_id invece di user_id
        tournament_id: tournamentId,
        full_name: profile.full_name,  // ✅ Salva nome reale
        email: profile.email
      }]);

    if (error) {
      return { ok: false, error };
    }
    
    console.log('✅ Iscrizione:', profile.full_name);
    return { ok: true, data, profile };
  } catch (error) {
    return { ok: false, error };
  }
}
