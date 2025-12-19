// src/components/TournamentBracket.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Users, Loader2 } from "lucide-react";

export default function TournamentBracket({ tournamentId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!tournamentId) {
        console.error("Errore: tournamentId non definito!");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("tournament_registrations")
          .select("user_id, users!inner(email, first_name, last_name)")
          .eq("tournament_id", tournamentId);

        if (error) throw error;

        setParticipants(data || []);
      } catch (err) {
        console.error("Errore registrazioni:", err);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="animate-spin mr-2" /> Caricamento partecipanti...
      </div>
    );
  }

  if (participants.length === 0) {
    return <div>Nessun partecipante trovato</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {participants.map((p) => (
        <div
          key={p.user_id}
          className="flex items-center border p-2 rounded shadow-sm"
        >
          <Users className="mr-2" />
          <span>{p.users.first_name} {p.users.last_name} ({p.users.email})</span>
        </div>
      ))}
    </div>
  );
}
