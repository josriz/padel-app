// src/components/AdminTournamentForm.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminTournamentForm({ onTournamentCreated }) {
  const [name, setName] = useState("");
  const [tournamentType, setTournamentType] = useState("eliminazione");
  const [numberOfPlayers, setNumberOfPlayers] = useState(8);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !numberOfPlayers) {
      setStatus("⚠️ Inserisci tutti i dati!");
      return;
    }

    const { data, error } = await supabase
      .from("tournaments")
      .insert([
        {
          name,
          tournament_type: tournamentType,
          number_of_players: numberOfPlayers,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      setStatus("❌ Errore durante la creazione del torneo");
      return;
    }

    setStatus("✅ Torneo creato!");
    setName("");
    setNumberOfPlayers(8);
    setTournamentType("eliminazione");

    // Comunica al componente padre che c'è un nuovo torneo
    if (onTournamentCreated) onTournamentCreated(data);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 max-w-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">📋 Crea nuovo torneo</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome torneo:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            placeholder="Inserisci nome torneo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo torneo:
          </label>
          <select
            value={tournamentType}
            onChange={(e) => setTournamentType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
          >
            <option value="eliminazione">Eliminazione diretta</option>
            <option value="avanzato">Avanzato (con ripescaggi)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numero partecipanti:
          </label>
          <input
            type="number"
            min={2}
            value={numberOfPlayers}
            onChange={(e) => setNumberOfPlayers(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all"
          >
            💾 Crea torneo
          </button>
          <span className="text-sm font-medium text-gray-600">{status}</span>
        </div>
      </form>
    </div>
  );
}
