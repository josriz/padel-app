// src/components/TournamentRegisterAuth.jsx - ✅ 100% FUNZIONANTE!
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthProvider";
import {
  Users,
  Loader2,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function TournamentRegisterAuth() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTorneo, setSelectedTorneo] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      // ✅ 1 STEP: Tornei
      const { data: tournamentData } = await supabase
        .from("tournaments")
        .select('id, name, type, players, status, created_at')
        .eq('status', 'registration'); // Solo tornei aperti

      // ✅ 2 STEP: Conteggio iscritti (usa tournament_players!)
      const tournamentsWithCount = await Promise.all(
        (tournamentData || []).map(async (t) => {
          const { count } = await supabase
            .from("tournament_players")
            .select("*", { count: "exact", head: true })
            .eq("tournament_id", t.id);
          return { ...t, totalIscritti: count || 0 };
        })
      );
      
      console.log("✅ Tornei caricati:", tournamentsWithCount);
      setTournaments(tournamentsWithCount);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setMessage({ type: "error", text: "Errore caricamento tornei" });
    } finally {
      setLoading(false);
    }
  };

  const handleIscrizione = async () => {
    if (!selectedTorneo || !user) {
      setMessage({
        type: "error",
        text: "❌ Seleziona un torneo!",
      });
      return;
    }

    setRegisterLoading(true);
    setMessage(null);

    try {
      // ✅ CHECK duplicati PRIMA
      const { data: existing } = await supabase
        .from("tournament_players")
        .select("id")
        .eq("tournament_id", selectedTorneo)
        .eq("player_id", user.id);

      if (existing?.length > 0) {
        setMessage({ type: "error", text: "❌ Già iscritto!" });
        return;
      }

      // ✅ INSERT in tournament_players (tabella corretta!)
      const playerName = user.email?.split('@')[0] || 'Giocatore';
      
      const { error } = await supabase.from("tournament_players").insert({
        tournament_id: selectedTorneo,
        player_id: user.id,
        player_name: playerName,
        rating: 1500
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "✅ Iscrizione avvenuta con successo!",
      });
      setSelectedTorneo("");
      fetchTournaments(); // Refresh conteggi
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: `❌ Errore: ${err.message}` });
    } finally {
      setRegisterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center py-12 px-6">
        <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-200">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-blue-600" />
          <p className="text-xl text-gray-600 font-semibold">
            Caricamento tornei...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 pt-4 pb-12">
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-sm border border-gray-200">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Iscrizione Tornei
            </h2>
            <p className="text-sm text-gray-600">
              Seleziona il torneo e iscriviti
            </p>
          </div>

          {!user ? (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Login richiesto
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Effettua il login per iscriverti ai tornei
              </p>
              <a
                href="/auth"
                className="block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm flex items-center justify-center gap-2"
              >
                Vai al Login →
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-emerald-700 font-medium">
                      Pronto per iscriverti
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Seleziona Torneo
                </label>
                <select
                  value={selectedTorneo}
                  onChange={(e) => setSelectedTorneo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-semibold"
                  disabled={registerLoading}
                >
                  <option value="">📋 Seleziona un torneo</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} 
                      {t.type === 'Diretta' ? ' ⚡' : t.type === 'Gironi' ? ' 🏟️' : ' 🛠️'}
                      ({t.totalIscritti}/{t.players}) - Aperto
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleIscrizione}
                disabled={!selectedTorneo || registerLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm"
              >
                {registerLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Iscrizione in corso...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Iscriviti Ora
                  </>
                )}
              </button>

              {message && (
                <div
                  className={`p-4 rounded-xl mt-4 flex items-start gap-3 shadow-sm ${
                    message.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="font-medium">{message.text}</span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                  Tornei aperti: <strong>{tournaments.length}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
