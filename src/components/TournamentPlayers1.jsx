// src/components/TournamentPlayers.jsx - ✅ FIX DEFINITIVO per tua DB
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Users, Loader2 } from "lucide-react";

export default function TournamentPlayers({ tournamentId, bracketSlots, setBracketSlots }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }

    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ USA ESATTAMENTE campi tua DB (NO JOIN!)
        const { data, error: queryError } = await supabase
          .from('tournament_registrations')
          .select('id, full_name, display_name, user_id, email, level')
          .eq('tournament_id', tournamentId)
          .order('full_name');

        if (queryError) throw queryError;

        setPlayers(data || []);
        console.log('✅ ISCRITTI con full_name:', data);
        
      } catch (err) {
        setError(err.message);
        console.error('❌ fetchPlayers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Caricamento iscritti...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="w-6 h-6 text-emerald-600" />
        Iscrizioni ({players.length})
      </h3>
      
      <div className="mb-4 p-3 bg-blue-50 rounded-xl">
        <strong>Registrati al torneo</strong>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nessun iscritto
          </div>
        ) : (
          players.map((p) => (
            <div key={p.id} className="p-3 bg-gray-50 border rounded-lg hover:bg-blue-50">
              <div className="font-semibold text-sm text-gray-800">
                {p.full_name || p.display_name || p.user_id}
              </div>
              {p.email && (
                <div className="text-xs text-gray-500 mt-1">{p.email}</div>
              )}
              {p.level && (
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1">
                  {p.level}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <h4 className="font-bold mb-2">Match del torneo</h4>
        <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
          Nessun match programmato
        </div>
      </div>
    </div>
  );
}
