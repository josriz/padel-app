// src/components/TournamentAdminPanel.jsx - ✅ Versione definitiva
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { RefreshCw } from "lucide-react";

export default function TournamentAdminPanel() {
  const [tournaments, setTournaments] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      // 1. Carica tornei
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("*")
        .order("name");
      if (tournamentError) throw tournamentError;

      // 2. Carica iscrizioni con display_name
      const { data: registrationData, error: registrationError } = await supabase
        .from("tournament_registrations")
        .select("tournament_id, display_name");
      if (registrationError) throw registrationError;

      // 3. Raggruppa iscritti per torneo
      const registrationsByTournament = {};
      registrationData?.forEach(reg => {
        if (!registrationsByTournament[reg.tournament_id]) {
          registrationsByTournament[reg.tournament_id] = [];
        }
        if (reg.display_name) {
          registrationsByTournament[reg.tournament_id].push(reg.display_name);
        }
      });

      setTournaments(tournamentData || []);
      setRegistrations(registrationsByTournament);

    } catch (error) {
      console.error("Errore fetchTournaments:", error);
      alert("Errore caricamento tornei: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (id) => {
    try {
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
      if (error) throw error;
      fetchTournaments();
    } catch (error) {
      console.error("Errore eliminazione torneo:", error);
      alert("Errore eliminazione torneo: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <RefreshCw className="animate-spin mr-2 w-8 h-8 text-blue-600" />
        Caricamento...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <h1 className="text-3xl font-bold mb-6">Admin Tornei</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.map(t => {
          const regs = registrations[t.id] || [];
          return (
            <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-lg transition-all">
              <h2 className="text-xl font-bold mb-2">{t.name}</h2>
              <p className="text-sm text-gray-500">
                {t.tournament_type || "Diretta"} • Max: {t.max_players || 16}
              </p>
              {regs.length > 0 ? (
                <>
                  <p className="text-sm font-bold text-emerald-700">✅ {regs.length} iscritto/i</p>
                  <div className="text-xs bg-gray-50 p-2 rounded max-h-16 overflow-auto border">
                    {regs.join(', ')}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">Nessun iscritto</p>
              )}
              <button
                onClick={() => handleDeleteTournament(t.id)}
                className="mt-3 w-full py-2 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
              >
                Elimina
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
