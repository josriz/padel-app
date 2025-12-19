import { supabase } from '../supabaseClient';

export async function registerToTournament({ userId, tournamentId }) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) return { ok: false, error: profileError || 'Profilo non trovato' };

    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert([{ 
        profile_id: profile.id,
        tournament_id: tournamentId,
        full_name: profile.full_name,
        email: profile.email
      }]);

    if (error) return { ok: false, error };
    return { ok: true, data, profile };
  } catch (error) {
    return { ok: false, error };
  }
}
