// src/components/TournamentAdminPanel.jsx - ✅ CREAZIONE SOLA (NO ISCRITTI!)
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { Plus, Loader2, CheckCircle } from 'lucide-react';
import BackButton from './BackButton';

export default function TournamentAdminPanel() {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    max_players: 16,
    date: '',
    status: 'pianificato'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isAdmin) return null;

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('tournaments').insert([formData]);
      if (error) throw error;

      setMessage({ type: 'success', text: '✅ Torneo creato con successo!' });
      setFormData({ name: '', price: 0, max_players: 16, date: '', status: 'pianificato' });
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-8">
      <BackButton />
      
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-12 border border-emerald-200">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <Plus className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-4">
            🏆 CREA TORNEO
          </h1>
          <p className="text-xl text-gray-600 font-semibold">Gestione tornei PadelClub</p>
        </div>

        {message && (
          <div className={`p-6 rounded-2xl mb-8 flex items-center gap-4 font-bold text-lg ${
            message.type === 'success'
              ? 'bg-emerald-50 border-4 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-4 border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleCreateTournament} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-4">🏆 Nome Torneo</label>
              <input
                type="text"
                placeholder="Es: CieffePadelADMIN 2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-6 text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-gray-900 mb-4">💰 Prezzo (€)</label>
              <input
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full p-6 text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-lg"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-4">📅 Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-6 text-xl font-bold border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-lg"
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-gray-900 mb-4">👥 Max Giocatori</label>
              <select
                value={formData.max_players}
                onChange={(e) => setFormData({ ...formData, max_players: Number(e.target.value) })}
                className="w-full p-6 text-xl font-bold border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-lg"
              >
                <option value={8}>8 giocatori</option>
                <option value={16}>16 giocatori</option>
                <option value={24}>24 giocatori</option>
                <option value={32}>32 giocatori</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.name}
            className="w-full py-8 px-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-2xl font-black rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 mx-auto"
          >
            {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" />}
            CREA TORNEO ORA
          </button>
        </form>
      </div>
    </div>
  );
}
