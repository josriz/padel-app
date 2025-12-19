// src/components/TournamentBracketMobile.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function TournamentBracketMobile({ tournamentId }) {
  const [bracket, setBracket] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [currentPhase, setCurrentPhase] = useState("Primo Turno");
  const [tournamentWinner, setTournamentWinner] = useState(null);
  const [status, setStatus] = useState("Caricamento...");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!tournamentId) return;

      const { data: regs } = await supabase
        .from("tournament_registrations")
        .select("user_id, full_name, display_name")
        .eq("tournament_id", tournamentId);

      const players = regs?.map((r, i) => ({
        id: r.user_id,
        fullName: r.full_name || r.display_name || `Giocatore ${i + 1}`,
      })) || [];
      setParticipants(players);

      const { data: bracketData } = await supabase
        .from("tournament_brackets")
        .select("bracket, phase, winner_team")
        .eq("tournament_id", tournamentId)
        .maybeSingle();

      if (bracketData) {
        setBracket(bracketData.bracket || []);
        setCurrentPhase(bracketData.phase || "Primo Turno");
        setTournamentWinner(bracketData.winner_team || null);
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

  const handleScoreChange = (matchIdx, teamIdx, value) => {
    const updated = bracket.map(m => ({ ...m }));
    updated[matchIdx].scores[teamIdx] = value;
    updated[matchIdx].score = updated[matchIdx].scores.join("-");
    setBracket(updated);
    supabase.from("tournament_brackets").upsert({
      tournament_id: tournamentId,
      bracket: updated,
      phase: currentPhase,
      winner_team: tournamentWinner,
      updated_at: new Date().toISOString(),
    });
  };

  if (!isLoaded) return <div className="p-6 text-center">Caricamento tabellone...</div>;

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-slate-50 to-emerald-50 min-h-screen">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-700">{currentPhase}</span>
        <span className="text-sm text-gray-500">{status}</span>
      </div>

      {bracket.map((match) => (
        <div key={match.id} className="bg-white p-3 rounded-xl shadow flex flex-col gap-2">
          <div className="font-semibold text-gray-700">Campo {match.field}</div>
          {match.teams.map((team, tIdx) => (
            <div key={tIdx} className="flex gap-2 items-center">
              <div className="flex-1 bg-gray-50 p-2 rounded">
                {team.map(p => (
                  <div key={p.id} className="flex justify-between">
                    <span>{p.fullName}</span>
                    {p.status === "avanzato" && <span className="text-green-600 font-bold">✅</span>}
                    {p.status === "ripescato" && <span className="text-yellow-600 font-bold">🔄</span>}
                    {p.status === "eliminato" && <span className="text-red-600 font-bold">❌</span>}
                  </div>
                ))}
              </div>
              <input
                type="number"
                value={match.scores[tIdx] || ""}
                onChange={(e) => handleScoreChange(match.id, tIdx, e.target.value)}
                placeholder="0"
                className="w-12 p-1 rounded border border-gray-300 text-center"
              />
            </div>
          ))}
        </div>
      ))}

      {tournamentWinner && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center font-bold text-green-800">
          🏆 Vincitore: {tournamentWinner.map(p => p.fullName).join(" / ")}
        </div>
      )}
    </div>
  );
}
