// src/components/TournamentBracketAvanzato.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { RefreshCw, Users, AlertCircle, Trophy } from 'lucide-react';

export default function TournamentBracketAvanzato() {
  const { tournamentId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Carica iscritti
        const { data: regs } = await supabase
          .from('tournament_registrations')
          .select('id, profile_id, full_name')
          .eq('tournament_id', tournamentId);

        setParticipants(regs || []);

        // Carica partite/gironi se esistono
        const { data: matchesData } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('round');

        setMatches(matchesData || []);
      } catch (err) {
        console.error('Errore caricamento tabellone avanzato:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 min-h-screen">
        <RefreshCw className="animate-spin mr-2 w-8 h-8 text-blue-600" />
        Caricamento tabellone avanzato...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">⚽️ Tabellone Avanzato</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          {participants.length} iscritti
        </div>
      </div>

      {/* ISCRITTI */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" /> Partecipanti
        </h3>
        {participants.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            Nessun iscritto
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {participants.map(p => (
              <div key={p.id} className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                {p.full_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABELLONE */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold mb-4">Partite / Gironi</h3>
        {matches.length === 0 ? (
          <p className="text-gray-500 text-sm">Il tabellone avanzato non è ancora stato generato.</p>
        ) : (
          <div className="space-y-3">
            {matches.map(match => (
              <div key={match.id} className="p-2 border rounded flex justify-between items-center">
                <span>{match.player1_name || "??"} vs {match.player2_name || "??"}</span>
                {match.winner_name && (
                  <div className="flex items-center gap-1 text-green-600 font-bold">
                    <Trophy className="w-4 h-4" /> {match.winner_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTONI */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <Link
          to={`/tournaments/${tournamentId}`}
          className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex-1 text-center"
        >
          ← Torneo
        </Link>
        <Link
          to="/tournaments"
          className="px-4 py-2 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 flex-1 text-center"
        >
          ← Tutti i Tornei
        </Link>
      </div>
    </div>
  );
}
