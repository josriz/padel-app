// src/components/TournamentBracket.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function TournamentBracket({ tournamentId }) {
  const [participants, setParticipants] = useState([]);
  const [bracket, setBracket] = useState([]);
  const [currentPhase, setCurrentPhase] = useState("Ottavi");
  const [isLoaded, setIsLoaded] = useState(false);
  const [tournamentWinner, setTournamentWinner] = useState(null);
  const [status, setStatus] = useState("Caricando...");
  const [history, setHistory] = useState([]);

  const ensureTournamentExists = async () => {
    if (!tournamentId) return;
    const { data } = await supabase
      .from("tournaments")
      .select("id")
      .eq("id", tournamentId)
      .single();
    if (!data) {
      await supabase.from("tournaments").insert({
        id: tournamentId,
        created_at: new Date().toISOString(),
      });
    }
  };

  const saveToSupabase = async (message = "Salvato") => {
    setStatus("💾 Salvando...");
    try {
      const { error } = await supabase
        .from("tournament_brackets")
        .upsert(
          {
            tournament_id: tournamentId,
            bracket,
            phase: currentPhase,
            history,
            winner_team: tournamentWinner,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "tournament_id" }
        );
      if (!error) setStatus(`✅ ${message}`);
    } catch {
      setStatus("❌ Errore Supabase");
    }
  };

  const fetchRealParticipants = async () => {
    const { data } = await supabase
      .from("tournament_registrations")
      .select("id, user_id, full_name, display_name")
      .eq("tournament_id", tournamentId);
    if (data?.length) {
      setParticipants(
        data.slice(0, 16).map((r, i) => ({
          id: r.user_id,
          fullName: r.full_name || r.display_name || `Giocatore ${i + 1}`,
        }))
      );
    }
  };

  const goBackPhase = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setBracket([...last.bracket]);
    setCurrentPhase(last.phase);
    setTournamentWinner(last.winner || null);
    setHistory((prev) => prev.slice(0, -1));
    setTimeout(() => saveToSupabase("Indietro fase"), 500);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, matchIdx, teamIdx) => {
    e.preventDefault();
    const player = JSON.parse(e.dataTransfer.getData("text/plain"));
    const updated = bracket.map((m) => ({
      ...m,
      teams: m.teams ? m.teams.map((t) => [...t]) : [[], []],
    }));
    if (!updated[matchIdx].teams[teamIdx]) updated[matchIdx].teams[teamIdx] = [];
    if (updated[matchIdx].teams[teamIdx].length < 2) {
      updated[matchIdx].teams[teamIdx].push(player);
      setBracket(updated);
      setTimeout(() => saveToSupabase("Giocatore OK"), 500);
    }
  };

  const removePlayerFromTeam = (matchIdx, teamIdx, playerIdx) => {
    const updated = bracket.map((m) => ({
      ...m,
      teams: m.teams ? m.teams.map((t) => [...t]) : [[], []],
    }));
    if (updated[matchIdx]?.teams[teamIdx]) {
      updated[matchIdx].teams[teamIdx].splice(playerIdx, 1);
      setBracket(updated);
      setTimeout(() => saveToSupabase("Rimosso OK"), 500);
    }
  };

  const handleScoreChange = (matchIdx, teamIdx, value) => {
    const updated = bracket.map((m) => ({ ...m }));
    if (!updated[matchIdx].scores) updated[matchIdx].scores = ["", ""];
    updated[matchIdx].scores[teamIdx] = value;
    updated[matchIdx].score = updated[matchIdx].scores.join("-");
    setBracket(updated);
    setTimeout(() => saveToSupabase("Punteggio OK"), 500);
  };

  const getWinnersFromMatch = (match) => {
    if (!match?.scores || match.scores.some((s) => !s)) return [];
    const [a, b] = match.scores.map((s) => parseInt(s) || 0);
    if (a > b) return match.teams?.[0] || [];
    if (b > a) return match.teams?.[1] || [];
    return [];
  };

  const advancePhase = () => {
    setHistory((prev) => [
      ...prev,
      {
        phase: currentPhase,
        bracket: bracket.map((m) => ({ ...m, teams: m.teams?.map((t) => [...t]) || [[], []] })),
        winner: tournamentWinner,
      },
    ]);
    const winners = bracket.flatMap(getWinnersFromMatch).filter(Boolean);

    if (currentPhase === "Ottavi") {
      setBracket([
        { id: 0, field: 1, teams: [winners.slice(0, 2), winners.slice(2, 4)], scores: ["", ""], score: "", phase: "Quarti" },
        { id: 1, field: 2, teams: [winners.slice(4, 6), winners.slice(6, 8)], scores: ["", ""], score: "", phase: "Quarti" },
      ]);
      setCurrentPhase("Quarti");
    } else if (currentPhase === "Quarti") {
      setBracket([
        { id: 0, field: 1, teams: [winners.slice(0, 2), winners.slice(2, 4)], scores: ["", ""], score: "", phase: "Finale" },
      ]);
      setCurrentPhase("Finale");
    } else if (currentPhase === "Finale") {
      const champs = getWinnersFromMatch(bracket[0]);
      if (champs.length === 2) setTournamentWinner(champs);
    }
    saveToSupabase("Avanzata OK");
  };

  const resetTournament = () => {
    if (confirm("⚠️ ELIMINA TUTTO DAL WEB?")) {
      supabase.from("tournament_brackets").delete().eq("tournament_id", tournamentId);
      setBracket(
        Array.from({ length: 4 }, (_, i) => ({
          id: i,
          field: i + 1,
          teams: [[], []],
          scores: ["", ""],
          score: "",
          phase: "Ottavi",
        }))
      );
      setCurrentPhase("Ottavi");
      setTournamentWinner(null);
      setHistory([]);
      setStatus("Reset OK");
    }
  };

  const fetchSavedBracket = async () => {
    try {
      setStatus("📂 Caricando...");
      const { data } = await supabase
        .from("tournament_brackets")
        .select("bracket, phase, winner_team, history")
        .eq("tournament_id", tournamentId)
        .maybeSingle();
      if (data) {
        setBracket((data.bracket || []).map((m) => ({ ...m, scores: m.score ? m.score.split("-") : ["", ""] })));
        setCurrentPhase(data.phase || "Ottavi");
        setTournamentWinner(data.winner_team || null);
        setHistory(data.history || []);
        setStatus("✅ Caricato dal WEB!");
      } else {
        setStatus("Nuovo torneo");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Errore caricamento");
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    const init = async () => {
      await ensureTournamentExists();
      await Promise.all([fetchRealParticipants(), fetchSavedBracket()]);
      if (!Array.isArray(bracket) || bracket.length === 0) {
        setBracket(
          Array.from({ length: 4 }, (_, i) => ({
            id: i,
            field: i + 1,
            teams: [[], []],
            scores: ["", ""],
            score: "",
            phase: "Ottavi",
          }))
        );
      }
      setIsLoaded(true);
    };
    init();
  }, [tournamentId]);

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center min-h-screen p-8 text-lg font-medium text-gray-600">
        Caricando tabellone...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        {/* HEADER E PULSANTI */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={goBackPhase}
              disabled={history.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={18} /> Indietro Fase
              {history.length > 0 && (
                <span className="text-xs bg-orange-200 px-2 py-0.5 rounded-full">{history.length}</span>
              )}
            </button>

            <button
              onClick={() => {
                if (confirm("🏁 Uscire dal torneo? Tornerai alla lista tornei.")) {
                  window.location.href = '/tournaments';
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all hover:shadow-sm"
            >
              🚪 Esci Torneo
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
              {status} {tournamentWinner && " 🏆 COMPLETATO"}
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-medium transition-all"
            >
              <Printer size={18} /> Stampa
            </button>
          </div>
        </div>

        {/* Tabellone e iscritti */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-1 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              👥 Iscritti
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                {participants.length}
              </span>
            </h3>
            <div className="space-y-2 max-h-96 overflow-auto">
              {participants.map((p) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify(p))}
                  className="p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-100 hover:border-emerald-200 hover:shadow-sm cursor-grab transition-all text-sm font-medium text-gray-800 hover:scale-[1.02]"
                >
                  {p.fullName}
                </div>
              ))}
            </div>
          </div>

          {/* Tabellone */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {bracket.map((match, matchIdx) => (
                <div key={match.id} className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">
                    Campo {match.field}
                  </h3>

                  {/* TEAM 1 */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, matchIdx, 0)}
                    className="p-4 mb-4 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-lg border border-gray-200 hover:border-emerald-300 min-h-[60px] flex items-center transition-all"
                  >
                    <div className="flex-1 flex gap-2 flex-wrap">
                      {match.teams?.[0]?.map((player, idx) => (
                        <span key={idx} className="font-medium text-gray-800 bg-white px-3 py-1 rounded-lg shadow-sm text-sm flex items-center gap-1">
                          {player.fullName}
                          <button
                            onClick={() => removePlayerFromTeam(matchIdx, 0, idx)}
                            className="text-red-400 hover:text-red-500 font-bold text-xs"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="tel"
                      value={match.scores?.[0] || ""}
                      onChange={(e) => handleScoreChange(matchIdx, 0, e.target.value)}
                      placeholder="6"
                      className="w-20 h-10 border border-gray-200 rounded-lg text-center font-bold text-sm shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none ml-2"
                    />
                  </div>

                  <div className="text-center py-2 font-semibold text-gray-500 text-sm uppercase tracking-wide">
                    vs
                  </div>

                  {/* TEAM 2 */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, matchIdx, 1)}
                    className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-lg border border-gray-200 hover:border-emerald-300 min-h-[60px] flex items-center transition-all"
                  >
                    <div className="flex-1 flex gap-2 flex-wrap">
                      {match.teams?.[1]?.map((player, idx) => (
                        <span key={idx} className="font-medium text-gray-800 bg-white px-3 py-1 rounded-lg shadow-sm text-sm flex items-center gap-1">
                          {player.fullName}
                          <button
                            onClick={() => removePlayerFromTeam(matchIdx, 1, idx)}
                            className="text-red-400 hover:text-red-500 font-bold text-xs"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="tel"
                      value={match.scores?.[1] || ""}
                      onChange={(e) => handleScoreChange(matchIdx, 1, e.target.value)}
                      placeholder="4"
                      className="w-20 h-10 border border-gray-200 rounded-lg text-center font-bold text-sm shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none ml-2"
                    />
                  </div>

                  {currentPhase === "Finale" && tournamentWinner && matchIdx === 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                      <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-sm shadow-sm">
                        🏆 Campioni!
                        <span>{tournamentWinner.map((p) => p.fullName).join(" + ")}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PULSANTI SALVA / AVANZA / RESET */}
        <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
          <button
            onClick={() => saveToSupabase("Manuale OK")}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
          >
            💾 Salva
          </button>

          <button
            onClick={advancePhase}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
          >
            ⏭️ Avanza Fase
          </button>

          <button
            onClick={resetTournament}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
          >
            🔄 Reset Torneo
          </button>
        </div>
      </div>
    </div>
  );
}
