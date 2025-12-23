// src/components/AdminTournamentForm.jsx - SCELTA TIPI TORNEO ATTIVA!
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Plus, X, Calendar, Users, Award } from "lucide-react";
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
    tournament_type: "diretta", // ✅ Default: Diretta
    price: ""
  });
  const [loading, setLoading] = useState(false);

  // ✅ SCELTA COMPLETA TIPI TORNEO!
  const tournamentTypes = [
    { value: "diretta", label: "⚡ DIRETTA - Tabellone classico", icon: "🏆" },
    { value: "ripescaggio", label: "🎯 RIPESCAGGI - TabelloneRipescaggi", icon: "🔄" },
    { value: "doppio", label: "👥 DOPPIO - Coppie padel", icon: "🥉" }
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
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      alert(`✅ Torneo ${formData.tournament_type.toUpperCase()} creato!`);
      
      // 🚀 Redirect dinamico per tipo torneo
      const redirectMap = {
        diretta: `/torneo/${data.id}`,
        ripescaggio: `/ripescaggi/${data.id}`,
        doppio: `/doppio/${data.id}`
      };
      
      navigate(redirectMap[formData.tournament_type] || `/admin-tournaments`);
      
    } catch (error) {
      alert("❌ Errore: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🏆 Crea Torneo
          </h1>
          <button
            onClick={() => navigate("/admin-tournaments")}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
            title="Torna indietro"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
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
              📅 Data e Ora Inizio *
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
              👥 Max Iscrizioni *
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

          {/* ✅ SCELTA TIPO TORNEO ATTIVA! */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 Tipo Torneo *
            </label>
            <select
              required
              value={formData.tournament_type}
              onChange={(e) => setFormData({...formData, tournament_type: e.target.value})}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              {tournamentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💰 Prezzo Iscrizione (€) *
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
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 animate-spin" />
                Creazione...
              </span>
            ) : (
              `🚀 CREA ${formData.tournament_type.toUpperCase()}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
