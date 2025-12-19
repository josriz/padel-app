// src/components/TournamentSignup.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function TournamentSignup() {
  const { tournamentId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!user) {
      alert("Devi essere loggato per iscriverti al torneo!");
      return;
    }

    setLoading(true);

    try {
      const { data: existing, error: checkError } = await supabase
        .from("tournament_registrations")
        .select("*")
        .eq("tournament_id", tournamentId)
        .eq("user_id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existing) {
        alert("Sei già iscritto a questo torneo!");
        return;
      }

      const { error } = await supabase
        .from("tournament_registrations")
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          name: user.email
        });

      if (error) throw error;

      alert("Iscrizione effettuata!");
      navigate(-1);
    } catch (err) {
      console.error("Errore iscrizione:", err);
      alert("Errore durante l'iscrizione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-xl shadow">
      <h3 className="text-xl font-bold mb-4">Iscriviti al torneo</h3>
      {!user ? (
        <p className="text-red-600">Devi essere loggato per iscriverti.</p>
      ) : (
        <button
          onClick={handleSignup}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Iscrivendo..." : "Iscriviti"}
        </button>
      )}
    </div>
  );
}
