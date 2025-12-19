import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function TournamentPlayers({ tournamentId }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tournamentId) return;

    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("tournament_players")
          .select("id, player_name, rating, created_at")
          .eq("tournament_id", tournamentId)
          .order("rating", { ascending: false });
        
        console.log("✅ Giocatori:", data);
        
        if (error) throw error;
        setPlayers(data || []);
      } catch (err) {
        console.error("❌ Error:", err);
        setError("Errore caricamento giocatori");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="p-6 border rounded-xl shadow bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center gap-3 text-blue-600">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Caricamento giocatori...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border rounded-xl shadow bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-5 h-5">⚠️</div>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-xl shadow bg-white hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          👥 Giocatori Iscritti
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-1 rounded-full">
            {players.length}
          </span>
        </h3>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-lg font-medium">Nessun giocatore iscritto</p>
          <p className="text-sm">Sii il primo!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl hover:from-emerald-50 hover:shadow-sm transition-all group hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {p.player_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate group-hover:text-emerald-700">
                    {p.player_name || 'Giocatore Anonimo'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Iscritto {p.created_at ? new Date(p.created_at).toLocaleDateString('it-IT') : 'appena'}
                  </p>
                </div>
              </div>
              
              <div className="text-right ml-4 flex-shrink-0">
                <div className="text-sm font-bold text-emerald-600">
                  {p.rating || 1500}
                </div>
                <div className="w-12 bg-gray-200 rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min((p.rating || 1500) / 25, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
