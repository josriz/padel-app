// src/components/TournamentListAndAdmin.jsx - COMPLETO STILE LOGIN
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthProvider';
import TournamentLayout from './TournamentLayout';
import { Trophy, Users, Loader2, UserPlus, CheckCircle, LinkIcon, Trash2, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TournamentListAndAdmin() {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';
  const [tournaments, setTournaments] = useState([]);
  const [participantsCounts, setParticipantsCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState({});
  const [deleting, setDeleting] = useState({});
  const [registeredTournaments, setRegisteredTournaments] = useState(new Set());
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchTournaments();
    if (!isAdmin) checkRegistrations();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tournaments')
      .select('id, name, max_players, status, data_inizio');
    
    setTournaments(data || []);

    const counts = {};
    for (const t of data || []) {
      const { count } = await supabase
        .from('tournament_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', t.id);
      counts[t.id] = count || 0;
    }
    setParticipantsCounts(counts);
    setLoading(false);
  };

  const checkRegistrations = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('tournament_registrations')
      .select('tournament_id')
      .eq('user_id', user.id);
    
    const registered = new Set(data?.map(r => r.tournament_id) || []);
    setRegisteredTournaments(registered);
  };

  const handleDeleteTournament = async (tournamentId) => {
    if (!confirm('Eliminare torneo? Gli iscritti saranno rimossi.')) return;
    
    setDeleting(prev => ({ ...prev, [tournamentId]: true }));
    
    const { error: regError } = await supabase
      .from('tournament_registrations')
      .delete()
      .eq('tournament_id', tournamentId);
    
    const { error: tourError } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId);
    
    setDeleting(prev => ({ ...prev, [tournamentId]: false }));
    
    if (!regError && !tourError) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      fetchTournaments();
    }
  };

  const handleRegister = async (tournamentId) => {
    if (registeredTournaments.has(tournamentId)) return;

    setRegistering(prev => ({ ...prev, [tournamentId]: true }));
    
    const { error } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: tournamentId,
        user_id: user?.id || 'anonymous-user',
        player_name: user?.email?.split('@')[0] || 'Giocatore'
      });
    
    setRegistering(prev => ({ ...prev, [tournamentId]: false }));
    
    if (!error) {
      setRegisteredTournaments(prev => new Set([...prev, tournamentId]));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      fetchTournaments();
    }
  };

  if (loading) {
    return (
      <TournamentLayout title="Caricamento..." subtitle="Tornei in caricamento">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
      </TournamentLayout>
    );
  }

  return (
    <>
      {showToast && (
        <div className="fixed top-4 right-4 z-[1000] bg-blue-600 text-white px-6 py-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">{isAdmin ? 'Torneo eliminato!' : 'Iscritto! 🎾'}</span>
          </div>
        </div>
      )}

      <TournamentLayout 
        title={isAdmin ? "Gestione Tornei" : "Tornei Disponibili"} 
        subtitle={isAdmin ? "👑 Modalità Admin" : `(${tournaments.length}) tornei attivi`}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(t => {
            const iscritti = participantsCounts[t.id] || 0;
            const max = t.max_players || 16;
            const pieno = iscritti >= max;
            const giaIscritto = registeredTournaments.has(t.id);

            return (
              <div key={t.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md hover:bg-gray-50 transition-all group">
                
                {isAdmin && (
                  <div className="flex justify-end mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      ADMIN
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">{t.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-lg font-semibold text-emerald-700">
                    {iscritti}/{max} iscritti
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((iscritti/max)*100, 100)}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    📅 {t.data_inizio ? new Date(t.data_inizio).toLocaleDateString('it-IT') : '—'}
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    to={`/tournaments/${t.id}`}
                    className="block w-full text-center border border-gray-200 bg-white text-blue-600 font-semibold p-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    VEDI DETTAGLI
                  </Link>

                  {!isAdmin && (
                    <button
                      onClick={() => handleRegister(t.id)}
                      disabled={pieno || giaIscritto || registering[t.id]}
                      className={`w-full text-center p-3 rounded-xl font-semibold transition-all ${
                        pieno || giaIscritto || registering[t.id]
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600'
                      }`}
                    >
                      {registering[t.id] ? '...' : giaIscritto ? 'ISCRITTO ✓' : pieno ? 'TORNEO PIENO' : 'ISCRIVITI'}
                    </button>
                  )}

                  {isAdmin && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleDeleteTournament(t.id)}
                        disabled={deleting[t.id]}
                        className="bg-red-600 text-white p-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {deleting[t.id] ? '...' : 'ELIMINA'}
                      </button>
                      <Link 
                        to="/admin-tournaments" 
                        className="bg-blue-600 text-white p-3 rounded-xl font-semibold text-center hover:bg-blue-700 transition flex items-center justify-center"
                      >
                        GESTIONE
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </TournamentLayout>
    </>
  );
}
