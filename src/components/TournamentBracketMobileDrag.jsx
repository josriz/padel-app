// src/components/TournamentBracketMobileDrag.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function TournamentBracketMobileDrag({ tournamentId }) {
  const [participants, setParticipants] = useState([]);
  const [bracket, setBracket] = useState([]);
  const [currentPhase, setCurrentPhase] = useState("Primo Turno");
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState("Caricamento...");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!tournamentId) return;

      // 🔹 Prendi giocatori iscritti
      const { data: regs } = await supabase
        .from("tournament_registrations")
        .select("user_id, full_name, display_name")
        .eq("tournament_id", tournamentId);
      const players = regs?.map((r, i) => ({
        id: r.user_id,
        fullName: r.full_name || r.display_name || `Giocatore ${i + 1}`,
      })) || [];
      setParticipants(players);

      // 🔹 Carica tabellone salvato
      const { data: saved } = await supabase
        .from("tournament_brackets")
        .select("bracket, phase, winner_team")
        .eq("tournament_id", tournamentId)
        .maybeSingle();
      if (saved) {
        setBracket(saved.bracket || []);
        setCurrentPhase(saved.phase || "Primo Turno");
        setWinner(saved.winner_team || null);
      } else {
        setBracket(Array.from({ length: 10 }, (_, i) => ({
          id: i,
          field: i + 1,
          teams: [[], []],
          scores: ["", ""],
          score: "",
          phase: "Primo Turno",
        })));
      }

      setIsLoaded(true);
    };
    init();
  }, [tournamentId]);

  // 🔹 Drag & Drop
  const handleDragStart = (e, player) => {
    e.dataTransfer.setData("player", JSON.stringify(player));
  };

  const handleDrop = (e, matchIdx, teamIdx) => {
    e.preventDefault();
    const player = JSON.parse(e.dataTransfer.getData("player"));
    const updated = bracket.map(m => ({ ...m, teams: m.teams ? m.teams.map(t => [...t]) : [[], []] }));
    if (!updated[matchIdx].teams[teamIdx]) updated[matchIdx].teams[teamIdx] = [];
    if (updated[matchIdx].teams[teamIdx].length < 2) {
      updated[matchIdx].teams[teamIdx].push(player);
      setBracket(updated);
      saveBracket(updated);
    }
  };

  const saveBracket = async (updated) => {
    setStatus("💾 Salvando...");
    await supabase.from("tournament_brackets").upsert({
      tournament_id: tournamentId,
      bracket: updated,
      phase: currentPhase,
      winner_team: winner,
      updated_at: new Date().toISOString(),
    });
    setStatus("✅ Salvato");
  };

  if (!isLoaded) return <div className="p-6 text-center">Caricamento tabellone...</div>;

  return (
    <div className="p-4 space-y-4 min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="flex flex-col gap-2">
        {participants.map((p) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => handleDragStart(e, p)}
            className="p-2 bg-blue-50 rounded shadow text-center font-semibold"
          >
            {p.fullName}
          </div>
        ))}
      </div>

      {bracket.map((match, mIdx) => (
        <div key={match.id} className="bg-white p-3 rounded-xl shadow flex flex-col gap-2">
          <div className="font-bold text-gray-700 mb-1">Campo {match.field} - {match.phase}</div>
          {match.teams.map((team, tIdx) => (
            <div
              key={tIdx}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, mIdx, tIdx)}
              className="p-2 border border-gray-300 rounded flex flex-col gap-1 min-h-[50px]"
            >
              {team.map((p) => (
                <div key={p.id} className="flex justify-between">
                  <span>{p.fullName}</span>
                  {p.status === "avanzato" && <span className="text-green-600 font-bold">✅</span>}
                  {p.status === "ripescato" && <span className="text-yellow-600 font-bold">🔄</span>}
                  {p.status === "eliminato" && <span className="text-red-600 font-bold">❌</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {winner && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center font-bold text-green-800">
          🏆 Vincitore: {winner.map(p => p.fullName).join(" / ")}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">{status}</div>
    </div>
  );
}
