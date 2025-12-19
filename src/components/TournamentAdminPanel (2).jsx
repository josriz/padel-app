// src/components/AdminTournamentDashboard.jsx - COMPLETO STILE LOGIN
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from '../context/AuthProvider';
import TournamentLayout from './TournamentLayout';
import AdminTournamentForm from './AdminTournamentForm';
import { Plus, Edit3, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminTournamentDashboard() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    setTournaments(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare torneo?')) return;
    
    setDeleting(prev => ({ ...prev, [id]: true }));
    
    await supabase.from('tournament_registrations').delete().eq('tournament_id', id);
    await supabase.from('tournaments').delete().eq('id', id);
    
    setDeleting(prev => ({ ...prev, [id]: false }));
    fetchTournaments();
  };

  if (loading) {
    return (
      <TournamentLayout title="Caricamento..." subtitle="Gestione tornei">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
      </TournamentLayout>
    );
  }

  return (
    <TournamentLayout 
      title="Gestione Tornei" 
      subtitle="👑 Crea e modifica tornei"
      backLink="/tournaments"
    >
      <div className="space-y-6">
        {/* ✅ ADMINTOURNAMENTFORM - BOTTONE INDIETRO DENTRO */}
        <AdminTournamentForm onTournamentCreated={fetchTournaments} />

        {/* LISTA TORNEI - STILE LOGIN */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Tornei Attivi ({tournaments.length})</h3>
          
          {tournaments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nessun torneo creato. Crea il primo!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm transition">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{t.name}</h4>
                    <p className="text-sm text-gray-600">
                      📅 {t.data_inizio ? new Date(t.data_inizio).toLocaleDateString('it-IT') : '—'} • 
                      {t.max_players || t.number_of_players} giocatori
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    <Link
                      to={`/tournaments/${t.id}`}
                      className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-1 text-sm font-semibold"
                      title="Vedi dettagli"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting[t.id]}
                      className="bg-red-600 text-white p-2 rounded-xl hover:bg-red-700 transition flex items-center gap-1 text-sm font-semibold disabled:opacity-50"
                      title="Elimina"
                    >
                      {deleting[t.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TournamentLayout>
  );
}
