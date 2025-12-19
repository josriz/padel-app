// src/components/TournamentAdminPanel.jsx - COMPLETO E FUNZIONANTE
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function AdminTournamentForm({ onTournamentCreated }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Diretta");
  const [players, setPlayers] = useState(16);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("tournaments").insert([
      {
        name: name.trim(),
        type,
        players,
        status: 'registration'
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Errore creazione torneo: " + error.message);
      return;
    }

    if (typeof onTournamentCreated === "function") {
      onTournamentCreated();
    }

    setName(""); 
    setType("Diretta"); 
    setPlayers(16);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
      <h3 className="text-base font-semibold text-gray-800">➕ Nuovo torneo</h3>
      
      <input
        type="text"
        placeholder="Nome torneo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        required
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="Diretta">Diretta</option>
          <option value="Gironi">Gironi</option>
        </select>

        <input
          type="number"
          min="2"
          max="64"
          value={players}
          onChange={(e) => setPlayers(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-500 text-white py-2 rounded-md font-medium text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors"
      >
        {loading ? "Creando..." : "Crea torneo"}
      </button>
    </form>
  );
}

export default function TournamentAdminPanel() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTournaments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("id, name, type, players, status, created_at")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const tournamentsWithCount = await Promise.all(
        (data || []).map(async (t) => {
          const { count } = await supabase
            .from("tournament_players")
            .select("*", { count: "exact", head: true })
            .eq("tournament_id", t.id);
          return { ...t, iscritti: count || 0 };
        })
      );
      
      setTournaments(tournamentsWithCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminare torneo + tutte le iscrizioni?")) return;
    setDeletingId(id);
    
    try {
      await supabase.from("tournament_players").delete().eq("tournament_id", id);
      await supabase.from("tournaments").delete().eq("id", id);
      setTournaments((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      alert("Errore eliminazione: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-6 text-center text-indigo-600 text-sm font-medium">Caricamento tornei...</div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 text-sm border rounded-lg text-center">Errore: {error}</div>;
  if (tournaments.length === 0) return <div className="p-6 text-gray-500 italic text-sm text-center">Nessun torneo creato.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <AdminTournamentForm onTournamentCreated={fetchTournaments} />

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Tornei ({tournaments.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {tournaments.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">{t.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {t.iscritti}/{t.players} iscritti • {t.type} • {t.status}
                </div>
              </div>
              <button
                onClick={() => handleDelete(t.id)}
                disabled={deletingId === t.id}
                className={`ml-4 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  deletingId === t.id 
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
                title="Elimina torneo"
              >
                {deletingId === t.id ? "..." : "🗑️"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
