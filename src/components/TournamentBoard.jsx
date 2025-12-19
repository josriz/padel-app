import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Trophy } from "lucide-react";

export default function TournamentBoard({ tournamentId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from("tournament_matches")
        .select(`
          id, round, player1:profiles(full_name), player2:profiles(full_name), winner:profiles(full_name)
        `)
        .eq("tournament_id", tournamentId)
        .order("round", { ascending: true });

      if (error) console.error(error);
      else setMatches(data || []);
      setLoading(false);
    };

    fetchMatches();
  }, [tournamentId]);

  if (loading) return <p>Caricamento tabellone...</p>;
  if (!matches.length) return <p>Ancora nessuna partita disponibile</p>;

  const rounds = Array.from(new Set(matches.map((m) => m.round)));

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tabellone Torneo</h2>
      {rounds.map((round) => (
        <div key={round} className="mb-6">
          <h3 className="font-semibold mb-2">Round {round}</h3>
          <ul className="space-y-2">
            {matches
              .filter((m) => m.round === round)
              .map((m) => (
                <li key={m.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{m.player1?.full_name || "?"} vs {m.player2?.full_name || "?"}</span>
                  {m.winner && (
                    <Trophy className="w-5 h-5 text-yellow-500 ml-2" title={`Vincitore: ${m.winner.full_name}`} />
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
