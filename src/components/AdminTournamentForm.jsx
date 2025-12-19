import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Loader2 } from 'lucide-react';

export default function AdminTournamentForm({ onTournamentCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    data_inizio: '',
    max_players: 16
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('tournaments')
      .insert([formData]);
    
    setLoading(false);
    if (!error) {
      onTournamentCreated();
      setFormData({ name: '', data_inizio: '', max_players: 16 });
      alert('✅ Torneo creato!');
    } else {
      alert('❌ ' + error.message);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-2xl">
      <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <Plus className="w-12 h-12 text-emerald-600" />
        Crea Nuovo Torneo
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <input
          type="text"
          placeholder="Nome Torneo (es: Natale Padel 2025)"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
          required
        />
        <input
          type="date"
          value={formData.data_inizio}
          onChange={(e) => setFormData({...formData, data_inizio: e.target.value})}
          className="p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
          required
        />
        <div className="flex gap-3">
          <input
            type="number"
            min="4"
            max="64"
            value={formData.max_players}
            onChange={(e) => setFormData({...formData, max_players: parseInt(e.target.value)})}
            className="flex-1 p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Crea
          </button>
        </div>
      </form>
    </div>
  );
}
