// src/components/TournamentListAndAdmin.jsx - ✅ VERSIONE CORRETTA AVANZATA
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../supabaseClient";
import { RefreshCw } from "lucide-react";
import AdminTournamentForm from "./AdminTournamentForm";

export default function TournamentListAndAdmin() {
  const { isAdmin, user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState({});
  const [error, setError] = useState(null);

  // 🔹 Carica tornei e iscritti - useEffect senza loop
  useEffect(() => {
    fetchTournaments();
  }, []); // ✅ Dipendenze vuote per evitare loop

  const fetchTournaments = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Carica tutti i tornei
      const { data: tournamentData, error: tError } = await supabase
        .from("tournaments")
        .select("*")
        .order("name");

      if (tError) throw tError;

      // 2️⃣ Carica TUTTE le iscrizioni
      const { data: registrationData, error: rError } = await supabase
        .from("tournament_registrations")
        .select("tournament_id, display_name");

      if (rError) throw rError;

      // 3️⃣ Raggruppa per torneo
      const registrationsByTournament = {};
      registrationData?.forEach(reg => {
        if (!registrationsByTournament[reg.tournament_id]) {
          registrationsByTournament[reg.tournament_id] = [];
        }
        registrationsByTournament[reg.tournament_id].push(reg.display_name || "Utente");
      });

      setTournaments(tournamentData || []);
      setRegistrations(registrationsByTournament);
    } catch (err) {
      console.error("Errore caricamento tornei:", err);
      setError(err.message || "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo torneo?")) return;
    try {
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
      if (error) throw error;
      // 🔹 Aggiorna solo lo stato locale senza causare loop
      setTournaments(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Errore eliminazione torneo:", err);
      alert("Errore eliminazione: " + (err.message || err));
    }
  };

  const registerToTournament = async (tournamentId) => {
    if (!user) return;

    try {
      // Verifica se già iscritto
      const { data: existing } = await supabase
        .from("tournament_registrations")
        .select("*")
        .eq("tournament_id", tournamentId)
        .eq("profile_id", user.id)
        .single();

      if (existing) {
        alert("Già iscritto!");
        return;
      }

      // Inserisci iscrizione
      const { error } = await supabase.from("tournament_registrations").insert({
        tournament_id: tournamentId,
        profile_id: user.id
      });

      if (error) throw error;

      // Aggiorna solo lo stato locale
      setRegistrations(prev => ({
        ...prev,
        [tournamentId]: [...(prev[tournamentId] || []), user.email || "Utente"]
      }));
    } catch (err) {
      console.error("Errore iscrizione:", err);
      alert("Errore iscrizione: " + (err.message || err));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <RefreshCw className="animate-spin mr-2 w-8 h-8 text-blue-600" />
        Caricamento tornei...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 font-semibold">Errore: {error}</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🏆 Tornei</h1>

      {isAdmin && (
        <div className="mb-6">
          <AdminTournamentForm onTournamentCreated={fetchTournaments} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.map((t) => {
          const regs = registrations[t.id] || [];
          return (
            <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-lg transition-all">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t.name}</h2>
              
              <div className="mb-4 space-y-1">
                <p className="text-sm text-gray-500">
                  {t.tournament_type || "Diretta"} • Max: {t.max_players || 16}
                </p>
                
                {regs.length > 0 ? (
                  <>
                    <p className="text-sm font-bold text-emerald-700">
                      ✅ {regs.length} iscritto/i
                    </p>
                    <div className="text-xs bg-gray-50 p-2 rounded max-h-16 overflow-auto border">
                      {regs.join(', ')}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">Nessun iscritto</p>
                )}
              </div>

              {!isAdmin && (
                <button
                  onClick={() => registerToTournament(t.id)}
                  className="w-full py-2 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
                >
                  Iscriviti
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => handleDeleteTournament(t.id)}
                  className="w-full py-2 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
                >
                  Elimina
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
