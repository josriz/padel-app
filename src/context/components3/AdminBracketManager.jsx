import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import TournamentBracket from './TournamentBracket';

export default function TournamentBoard({ tournamentId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tournamentId) return;
    const fetchMatches = async () => {
      try {
        const { data, error } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('torneo_id', tournamentId)
          .order('round_number', { ascending: true })
          .order('match_index', { ascending: true });
        if (error) throw error;
        setMatches(data);
      } catch (err) {
        console.error('Errore caricamento match:', err.message || err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [tournamentId]);

  if (!tournamentId) return <div>Seleziona un torneo</div>;
  if (loading) return <div>Caricamento tabellone...</div>;
  if (error) return <div className="text-red-600">Errore: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Tabellone torneo</h2>
      <TournamentBracket matches={matches} />
    </div>
  );
}
