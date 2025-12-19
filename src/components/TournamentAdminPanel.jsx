import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ChevronLeft, Loader2, Plus, Trash2, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AdminTournamentForm from './AdminTournamentForm';
import { useAuth } from '../context/AuthProvider';

export default function TournamentAdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    if (!user || user?.user_metadata?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchTournaments();
  }, [user, navigate]);

  const fetchTournaments = async () => {
    try {
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select('*, tournament_registrations(*, profiles(full_name))');
      
      setTournaments(tournamentsData || []);

      // Mappa iscrizioni per torneo
      const regs = {};
      tournamentsData?.forEach(t => {
        regs[t.id] = t.tournament_registrations?.map(reg => ({
          ...reg,
          display_name: reg.profiles?.full_name || reg.display_name || 'Anonimo'
        })) || [];
      });
      setRegistrations(regs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = async (tournamentId, tournamentName) => {
    if (!confirm(`Elimina torneo "${tournamentName}"?`)) return;
    
    setDeleting(prev => ({ ...prev, [tournamentId]: true }));
    try {
      await supabase.from('tournaments').delete().eq('id', tournamentId);
      fetchTournaments();
    } catch (err) {
      alert('Errore eliminazione');
    } finally {
      setDeleting(prev => ({ ...prev, [tournamentId]: false }));
    }
  };

  const deleteRegistration = async (registrationId, playerName, tournamentId) => {
    if (!confirm(`Elimina "${playerName}"?`)) return;
    
    try {
      await supabase.from('tournament_registrations').delete().eq('id', registrationId);
      fetchTournaments(); // Ricarica tutto
    } catch (err) {
      alert('Errore eliminazione');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-4 px-2 sm:px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-sm font-bold text-gray-700">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 border rounded hover:bg-gray-50">
            ← Indietro
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">👑 Gestione Tornei</h1>
        </div>

        {/* FORM CREA */}
        <AdminTournamentForm onTournamentCreated={fetchTournaments} />

        {/* LISTA TORNEI */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Tornei ({tournaments.length})
          </h3>
          
          {tournaments.map(t => {
            const regs = registrations[t.id] || [];
            return (
              <div key={t.id} className="bg-gray-50 p-6 rounded-lg border shadow-sm hover:shadow-md transition-all">
                {/* HEADER TORNEO */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{t.name}</h4>
                    <p className="text-sm text-gray-600">
                      📅 {t.data_inizio ? new Date(t.data_inizio).toLocaleDateString('it-IT') : '—'} • 
                      👥 {regs.length} iscritti
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      to={`/tabellone/${t.id}`}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded hover:bg-emerald-700"
                    >
                      📋 Tabellone
                    </Link>
                    <button 
                      onClick={() => deleteTournament(t.id, t.name)}
                      disabled={deleting[t.id]}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Elimina
                    </button>
                  </div>
                </div>

                {/* ISCRITTI */}
                {regs.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2 text-gray-800">
                      <Users className="w-4 h-4" />
                      Iscritti ({regs.length})
                    </h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {regs.map(reg => (
                        <div key={reg.id} className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-emerald-400 hover:bg-emerald-50">
                          <span className="text-sm font-medium">{reg.display_name}</span>
                          <button 
                            onClick={() => deleteRegistration(reg.id, reg.display_name, t.id)}
                            className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Rimuovi
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PULSANTI TIPI */}
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => navigate(`/tabellone/${t.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    ✋ Manuale
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/tabellone/${t.id}`)}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 flex items-center gap-1"
                  >
                    ⚾ Diretto
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/tabellone/${t.id}`)}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded hover:bg-purple-700 flex items-center gap-1"
                  >
                    📊 Gironi
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">Nessun torneo creato</p>
            <p className="text-sm">Usa il form sopra per crearne uno!</p>
          </div>
        )}
      </div>
    </div>
  );
}
