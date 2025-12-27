import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ChevronLeft, Loader2, Plus, Trash2, Users, Crown, Calendar, Award, ArrowRight } from 'lucide-react';
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
  const [userRole, setUserRole] = useState(null); // ✅ AGGIUNTO
  const [roleLoading, setRoleLoading] = useState(true); // ✅ AGGIUNTO

  // ✅ NUOVO useEffect per ruoli
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('❌ Errore ruolo:', error);
          } else {
            console.log('🎾 Ruolo trovato:', data?.role);
            setUserRole(data?.role);
          }
          setRoleLoading(false);
        })
        .catch(err => {
          console.error('❌ Errore fetch ruolo:', err);
          setRoleLoading(false);
        });
    } else {
      setRoleLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // ✅ MODIFICATO: usa NUOVO controllo ruoli
    if (!user || roleLoading || !userRole) {
      return;
    }
    
    if (!['super_admin', 'tornei_admin'].includes(userRole)) {
      console.log('🚫 Accesso negato. Ruolo:', userRole);
      navigate('/dashboard');
      return;
    }
    
    fetchTournaments();
  }, [user, navigate, userRole, roleLoading]); // ✅ AGGIUNTO userRole, roleLoading

  const fetchTournaments = async () => {
    try {
      console.log('🔥 Fetch tornei...');
      
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (tournamentsError) throw tournamentsError;
      console.log('✅ Tornei:', tournamentsData?.length);
      setTournaments(tournamentsData || []);

      const { data: allRegs, error: regsError } = await supabase
        .from('tournament_registrations')
        .select('id, display_name, status, user_id, tournament_id')
        .order('created_at');

      if (regsError) {
        console.warn('No iscrizioni:', regsError.message);
        setRegistrations({});
      } else {
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

  // ✅ PROTEZIONE ruolo (PRIMA del return)
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="mt-4 text-lg text-emerald-600 font-semibold">Verifica ruolo admin...</p>
      </div>
    );
  }

  if (!userRole || !['super_admin', 'tornei_admin'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Crown className="w-24 h-24 text-red-500 mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl font-black text-gray-800 mb-4">Accesso Negato</h1>
          <p className="text-xl text-gray-600 mb-8">Ruolo richiesto: tornei_admin o super_admin</p>
          <p className="text-lg font-semibold text-gray-700 bg-gray-100 px-6 py-3 rounded-2xl mb-8">
            Il tuo ruolo: <span className="font-black text-red-600">{userRole || 'nessuno'}</span>
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-12 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition-all text-lg"
          >
            Torna al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  // ✅ HEADER con RUOLO VISIBILE
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ✅ HEADER con ruolo */}
        <div className="flex items-center gap-4 mb-8 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50">
          <button onClick={() => navigate(-1)} className="p-3 bg-emerald-100 hover:bg-emerald-200 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105">
            <ChevronLeft className="w-6 h-6 text-emerald-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Gestione Tornei Admin
            </h1>
            <p className="text-lg text-gray-600 font-semibold">
              Ruolo: <span className="font-black text-emerald-600">{userRole}</span> | 
              Crea, modifica ed elimina tornei
            </p>
          </div>
        </div>

        {/* ✅ RESTO IDENTICO AL TUO CODICE */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
          <AdminTournamentForm onTournamentCreated={fetchTournaments} />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            <Users className="w-10 h-10" />
            I Tuoi Tornei ({tournaments.length})
          </h2>
          
          {tournaments.map(t => {
            const regs = registrations[t.id] || [];
            return (
              <div key={t.id} className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 border border-white/60 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 pb-6 border-b-2 border-emerald-100">
                  <div className="flex flex-col">
                    <div className="flex gap-2 mb-3">
                      {t.tournament_type === 'diretta' && (
                        <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-2xl text-sm shadow-lg">⚡ DIRETTA</span>
                      )}
                      {t.tournament_type === 'ripescaggio' && (
                        <span className="px-4 py-2 bg-purple-100 text-purple-800 font-bold rounded-2xl text-sm shadow-lg">🎯 RIPESCAGGI</span>
                      )}
                      {t.tournament_type === 'king' && (
                        <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl text-sm shadow-lg">👑 KING</span>
                      )}
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">{t.name}</h3>
                    <p className="text-xl text-gray-600 flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-blue-500" />
                      {t.data_inizio ? new Date(t.data_inizio).toLocaleDateString('it-IT', { 
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      }) : '—'}
                      <span className="font-bold text-emerald-600 ml-6">{regs.length} iscritti</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Link 
                      to={`/tabellone/${t.id}?type=${t.tournament_type || 'diretta'}&num_campi=${t.num_campi || 4}&max_players=${t.max_players || 16}`}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                    >
                      <ArrowRight className="w-5 h-5" />
                      APRI TABELLONE
                    </Link>
                    <button 
                      onClick={() => deleteTournament(t.id, t.name)}
                      disabled={deleting[t.id]}
                      className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash2 className={`w-5 h-5 ${deleting[t.id] ? 'animate-spin' : ''}`} />
                      {deleting[t.id] ? '...' : 'Elimina'}
                    </button>
                  </div>
                </div>

                {/* ISCRITTI */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-8 rounded-3xl border-4 border-emerald-200 shadow-2xl">
                  <h4 className="text-2xl font-black mb-6 flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    <Users className="w-8 h-8" />
                    Iscritti ({regs.length})
                  </h4>
                  
                  {regs.length === 0 ? (
                    <div className="p-12 bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-yellow-200 rounded-3xl text-center shadow-xl">
                      <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-yellow-700">Nessun iscritto</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {regs.map(r => (
                        <div key={r.id} className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-300 border-2 border-transparent transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-2xl">
                                {r.display_name?.charAt(0)?.toUpperCase() || 'G'}
                              </div>
                              <div>
                                <div className="font-bold text-xl text-gray-900 group-hover:text-emerald-600 transition-colors">
                                  {r.display_name || 'Giocatore'}
                                </div>
                                <div className="text-sm text-gray-500 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-1 rounded-xl font-semibold inline-block mt-1">
                                  {r.status || 'registered'}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteRegistration(r.id, r.display_name || 'giocatore', t.id)}
                              className="p-3 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group-hover:bg-red-500 group-hover:text-white"
                            >
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tournaments.length === 0 && !loading && (
          <div className="text-center py-32 bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/50">
            <Award className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-4xl font-black text-gray-500 mb-4">Nessun torneo creato</h3>
            <p className="text-xl text-gray-400 mb-12">Inizia creando il tuo primo torneo padel!</p>
            <button
              onClick={() => navigate("/admin-tournament")}
              className="px-16 py-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
            >
              🚀 CREA PRIMO TORNEO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
