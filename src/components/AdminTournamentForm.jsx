// src/components/AdminTournamentForm.jsx - SEMPRE RIPESCAGGI!
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function AdminTournamentForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!user) {
    return <div className="p-8 text-center">Accesso riservato agli admin</div>;
  }
  
  const [formData, setFormData] = useState({
    name: "",
    data_inizio: "",
    max_players: "",
    tournament_type: "ripescaggio", // ✅ SEMPRE ripescaggio!
    price: ""
  });
  const [loading, setLoading] = useState(false);

  // ✅ SOLO RIPESCAGGI!
  const tournamentTypes = [
    { value: "ripescaggio", label: "🎯 RIPESCAGGI - TabelloneRipescaggi" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert([{
          ...formData,
          max_players: parseInt(formData.max_players),
          price: parseFloat(formData.price),
          created_by: user.id  // ✅ created_by corretto
        }])
        .select()
        .single();

      if (error) throw error;
      
      alert("✅ Torneo RIPESCAGGI creato!");
      
      // 🚀 SEMPRE verso TabelloneRipescaggi!
      navigate(`/ripescaggi/${data.id}`);
      
    } catch (error) {
      alert("❌ Errore: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          🏆 RIPESCAGGI Tabellone
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Torneo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="TEST RIPESCAGGI 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data e Ora Inizio *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.data_inizio}
              onChange={(e) => setFormData({...formData, data_inizio: e.target.value})}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Iscrizioni *
            </label>
            <input
              type="number"
              min="4"
              max="64"
              required
              value={formData.max_players}
              onChange={(e) => setFormData({...formData, max_players: e.target.value})}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo Torneo
            </label>
            <select
              value={formData.tournament_type}
              onChange={(e) => setFormData({...formData, tournament_type: e.target.value})}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled
            >
              <option>🎯 RIPESCAGGI - TabelloneRipescaggi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prezzo (€) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="25.00"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-green-700 focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="animate-pulse">🚀 Creazione...</span>
            ) : (
              "🎯 CREA RIPESCAGGI → TabelloneRipescaggi"
            )}
          </button>
        </form>

        <button
          onClick={() => navigate("/admin-tournaments")}
          className="w-full mt-6 bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all border"
        >
          ← Torna alla Gestione Tornei
        </button>
      </div>
    </div>
  );
}
