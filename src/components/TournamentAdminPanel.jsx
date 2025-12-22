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
      console.log('🔥 Fetch tornei...');
      
      // TORNEI
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, name, data_inizio, status, created_at')
        .order('created_at', { ascending: false });

      if (tournamentsError) throw tournamentsError;
      console.log('✅ Tornei:', tournamentsData?.length);
      setTournaments(tournamentsData || []);

      // ISCRITTI - UNA SOLA QUERY
      const { data: allRegs, error: regsError } = await supabase
        .from('tournament_registrations')
        .select('id, display_name, status, user_id, tournament_id')
        .order('created_at');

      if (regsError) {
        console.warn('No iscrizioni:', regsError.message);
        setRegistrations({});
      } else {
        // GROUP BY torneo
        const regsByTournament = {};
        allRegs?.forEach(r => {
          if (!regsByTournament[r.tournament_id]) {
            regsByTournament[r.tournament_id] = [];
          }
          regsByTournament[r.tournament_id].push(r);
        });
        console.log('✅ Iscritti grouped:', Object.keys(regsByTournament));
        setRegistrations(regsByTournament);
      }
      
    } catch (err) {
      console.error('❌ Errore:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = async (tournamentId, tournamentName) => {
    if (!confirm(`Elimina "${tournamentName}"?`)) return;
    setDeleting(prev => ({ ...prev, [tournamentId]: true }));
    try {
      const { error } = await supabase.from('tournaments').delete().eq('id', tournamentId);
      if (!error) fetchTournaments();
      else alert('Errore: ' + error.message);
    } finally {
      setDeleting(prev => ({ ...prev, [tournamentId]: false }));
    }
  };

  const deleteRegistration = async (registrationId, playerName, tournamentId) => {
    if (!confirm(`Elimina "${playerName}"?`)) return;
    try {
      const { error } = await supabase
        .from('tournament_registrations')
        .delete()
        .eq('id', registrationId);
      if (!error) {
        fetchTournaments();
        alert('✅ Eliminato!');
      } else {
        alert('❌ ' + error.message);
      }
    } catch (err) {
      alert('❌ Errore');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 border rounded-lg hover:bg-gray-50">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Tornei</h1>
        </div>

        {/* FORM */}
        <AdminTournamentForm onTournamentCreated={fetchTournaments} />

        {/* TORNEI */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            Tornei ({tournaments.length})
          </h2>
          
          {tournaments.map(t => {
            const regs = registrations[t.id] || [];
            return (
              <div key={t.id} className="bg-white border rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all">
                {/* HEADER TORNEO */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t.name}</h3>
                    <p className="text-lg text-gray-600 mt-1">
                      {t.data_inizio ? new Date(t.data_inizio).toLocaleDateString('it-IT') : '—'} • 
                      <span className="font-semibold text-emerald-600 ml-2">{regs.length} iscritti</span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link to={`/tabellone/${t.id}`} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">
                      Tabellone
                    </Link>
                    <button 
                      onClick={() => deleteTournament(t.id, t.name)}
                      disabled={deleting[t.id]}
                      className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      {deleting[t.id] ? '...' : 'Elimina'}
                    </button>
                  </div>
                </div>

                {/* ISCRITTI */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border-2 border-emerald-200">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-emerald-600" />
                    Iscritti ({regs.length})
                  </h4>
                  
                  {regs.length === 0 ? (
                    <div className="p-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center text-lg">
                      Nessun iscritto
                    </div>
                  ) : (
                    <div className="grid gap-4 max-h-80 overflow-y-auto">
                      {regs.map(r => (
                        <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md border hover:border-emerald-300 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                              {r.display_name?.charAt(0)?.toUpperCase() || 'G'}
                            </div>
                            <div>
                              <div className="font-bold text-xl text-gray-900">
                                {r.display_name || 'Giocatore'}
                              </div>
                              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                                {r.status || 'registered'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteRegistration(r.id, r.display_name || 'giocatore', t.id)}
                            className="p-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-2xl transition-all hover:scale-105 shadow-sm"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AZIONI */}
                <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-gray-200">
                  <Link to={`/tabellone/${t.id}`} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                    Tabellone Manuale
                  </Link>
                  <Link to={`/tabellone/${t.id}`} className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">
                    Tabellone Diretto
                  </Link>
                  <Link to={`/tabellone/${t.id}`} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">
                    Tabellone Gironi
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
