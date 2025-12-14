// src/components/TournamentListAndAdmin.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../supabaseClient";
import { Plus, RefreshCw } from "lucide-react";
import TournamentBracket from "./TournamentBracket";

export default function TournamentListAndAdmin() {
  const { isAdmin } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Errore tornei:", error);
        setLoading(false);
        return;
      }

      setTournaments(data || []);
      setLoading(false);
    }

    fetchTournaments();
  }, []);

  const handleDeleteTournament = async (id) => {
    const { error } = await supabase
      .from("tournaments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Errore eliminazione torneo:", error);
      return;
    }

    setTournaments((prev) => prev.filter((t) => t.id !== id));
    if (selectedTournament === id) {
      setSelectedTournament(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <RefreshCw className="animate-spin mr-2 w-8 h-8 text-blue-600" />
        <span className="text-lg font-semibold text-gray-700">Caricamento tornei...</span>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        🏆 Tornei
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer transition-all"
            onClick={() => setSelectedTournament(t.id)}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.name}</h2>

            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTournament(t.id);
                }}
                className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 font-bold text-sm rounded-xl hover:bg-red-200 transition-all"
              >
                Elimina
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedTournament && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            🏆 Tabellone
          </h2>
          <TournamentBracket tournamentId={selectedTournament} />
        </div>
      )}
    </div>
  );
}
