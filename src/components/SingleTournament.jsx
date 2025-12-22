// src/components/SingleTournament.jsx - COMPLETO STILE LOGIN
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthProvider';
import TournamentLayout from './TournamentLayout';
import { Users, Trophy, Loader2, UserPlus, CheckCircle } from 'lucide-react';

export default function SingleTournament() {
  const { tournamentId } = useParams();
  const { user, role } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  const fetchTournament = async () => {
    setLoading(true);
    const { data: tourneyData } = await supabase
      .from('tournaments')
      .select('id, name, max_players, status, data_inizio')
      .eq('id', tournamentId)
      .single();
    
    const { data: regsData } = await supabase
      .from('tournament_registrations')
      .select('id, player_name, created_at')
      .eq('tournament_id', tournamentId);
    
    setTournament(tourneyData);
    setParticipants(regsData || []);
    setLoading(false);
  };

  const handleRegister = async () => {
    setRegistering(true);
    const { error } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: tournamentId,
        user_id: user?.id || 'anonymous',
        player_name: user?.email?.split('@')[0] || 'Giocatore'
      });
    
    if (!error) fetchTournament();
    setRegistering(false);
  };

  if (loading) {
    return (
      <TournamentLayout title="Caricamento..." subtitle="Dettagli torneo">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
      </TournamentLayout>
    );
  }

  if (!tournament) {
    return (
      <TournamentLayout title="Torneo non trovato" subtitle="">
        <div className="text-center py-20">
          <Trophy className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <p className="text-2xl text-gray-500">Torneo non disponibile</p>
        </div>
      </TournamentLayout>
    );
  }

  const max = tournament.max_players || 16;
  const iscritti = participants.length;
  const pieno = iscritti >= max;
  const isAdmin = role === 'admin';

  return (
    <TournamentLayout 
      title={tournament.name} 
      subtitle={`${iscritti}/${max} iscritti • ${tournament.status}`}
    >
      <div className="space-y-6">
        {/* STATS */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-700">{iscritti}/{max}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${(iscritti/max)*100}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">
            📅 {new Date(tournament.data_inizio).toLocaleDateString('it-IT')}
          </div>
        </div>

        {/* ✅ BUTTONS CON RIPESCAGGI */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!pieno && !isAdmin && (
            <button
              onClick={handleRegister}
              disabled={registering}
              className="w-full bg-emerald-600 text-white p-4 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 text-lg flex items-center justify-center gap-2"
            >
              {registering ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  ISCRIVITI ORA
                </>
              )}
            </button>
          )}
          
          <Link
            to={`/tabellone/${tournamentId}`}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-semibold text-center hover:bg-blue-700 transition flex items-center justify-center gap-2 text-lg"
          >
            <Trophy className="w-5 h-5" />
            VEDI TABELLONE
          </Link>
          
          {/* 🎯 NUOVO BUTTON RIPESCAGGI */}
          <Link
            to={`/ripescaggi/${tournamentId}`}
            className="w-full bg-orange-600 text-white p-4 rounded-xl font-semibold text-center hover:bg-orange-700 transition flex items-center justify-center gap-2 text-lg"
          >
            🎯 TABELLONE RIPESCAGGI
          </Link>
        </div>

        {/* LISTA ISCRITTI */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="w-6 h-6" />
            Lista Iscritti ({iscritti}/{max})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((p, i) => (
              <div key={p.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{p.player_name}</h4>
                    <p className="text-sm text-gray-600">{new Date(p.created_at).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>
              </div>
            ))}
            {iscritti === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nessun iscritto ancora</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TournamentLayout>
  );
}
