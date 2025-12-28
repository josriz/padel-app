// src/components/TournamentList.jsx - COMPLETO CON BACK SMART + NOMI + ICONE ORGANIZZATORI + NOMI SPOSATE ACCANTO LOGO INGROSSATE
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Trophy, Users, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function TournamentList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [participantsCounts, setParticipantsCounts] = useState({});
  const [userRegistrations, setUserRegistrations] = useState({});
  const [playerNames, setPlayerNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState({});

  // ✅ BACK BUTTON INTELLIGENTE
  const goBackSmart = () => {
    const currentPath = window.location.pathname;
    if (currentPath === '/tournaments') {
      navigate('/dashboard'); // Da lista tornei → dashboard
    } else {
      navigate(-1); // Altrimenti pagina precedente
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      const counts = {};
      const playerNamesData = {};
      
      for (const t of tournamentsData || []) {
        const { count } = await supabase
          .from('tournament_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('tournament_id', t.id);
        counts[t.id] = count || 0;

        if (count > 0) {
          const { data: registrations } = await supabase
            .from('tournament_registrations')
            .select(`
              *,
              profiles!inner(full_name, display_name, player_name)
            `)
            .eq('tournament_id', t.id);
          
          playerNamesData[t.id] = registrations?.map(r => 
            r.profiles?.full_name || 
            r.profiles?.display_name || 
            r.profiles?.player_name || 
            r.display_name || 
            'Anonimo'
          ) || [];
        }
      }

      if (user) {
        const { data: registrations } = await supabase
          .from('tournament_registrations')
          .select('tournament_id')
          .eq('user_id', user.id);
        const userRegs = {};
        registrations?.forEach(r => { userRegs[r.tournament_id] = true; });
        setUserRegistrations(userRegs);
      }

      setTournaments(tournamentsData || []);
      setParticipantsCounts(counts);
      setPlayerNames(playerNamesData);
    } catch (err) {
      console.error('Errore:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (tournamentId) => {
    if (!user) {
      alert('❌ Effettua login per iscriverti!');
      return;
    }

    setRegistering(prev => ({ ...prev, [tournamentId]: true }));

    const { error } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: tournamentId,
        user_id: user.id,
        status: 'pending',
        display_name: user.user_metadata?.display_name || user.email.split('@')[0],
        player_name: user.user_metadata?.player_name || user.email.split('@')[0]
      });

    if (error) {
      if (error.message.includes('already exists')) {
        alert('✅ Già iscritto a questo torneo!');
      } else {
        alert('❌ Errore: ' + error.message);
      }
    } else {
      alert('🎾 ISCRIZIONE EFFETTUATA! Adesione in attesa approvazione admin');
      fetchData();
    }

    setRegistering(prev => ({ ...prev, [tournamentId]: false }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-[#001F5B] via-[#003A8F] to-[#001F5B] pt-4 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ✅ BACK BUTTON INTELLIGENTE */}
        <button
          onClick={goBackSmart}
          className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50"
        >
          ← Indietro
        </button>

        {/* HEADER CON ICONE SPOSATE ACCANTO LOGO + INGROSSATE */}
        <div className="text-center text-white flex flex-col items-center">
          <div className="flex items-center gap-4 mb-6">
            {/* LOGO COPPA */}
            <div className="w-28 h-28 bg-white/10 border border-white/40 rounded-3xl flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.35)] overflow-hidden">
              <img
                src="/images/tornei-header.png"
                alt="Tornei Padel"
                className="w-full h-full object-cover"
              />
            </div>

            {/* ✅ ICONE ORGANIZZATORI INGROSSATE ACCANTO LOGO */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                <div className="flex flex-col items-center">
                  <img
                    src="/images/icon-robertobove.jpg"
                    alt="Roberto Bove"
                    className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-bold italic text-white drop-shadow-md">Roberto Bove</span>
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src="/images/icon-claudiofalba.jpg"
                    className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-bold italic text-white drop-shadow-md">Claudio Falba</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-white drop-shadow-lg bg-blue-900/50 px-2 py-1 rounded-full">
                Tournament Organizers
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-wide mb-2 drop-shadow-sm">
            TORNEI PADEL
          </h1>
          <p className="text-lg text-blue-100 mb-4">
            ({tournaments.length}) tornei •{" "}
            {Object.values(participantsCounts).reduce((a, b) => a + b, 0)} iscritti totali
          </p>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <Trophy className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun torneo trovato</h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(t => {
              const iscritti = participantsCounts[t.id] || 0;
              const isFull = iscritti >= (t.max_players || 16);
              const isRegistered = userRegistrations[t.id];
              const isRegistering = registering[t.id];
              const namesList = playerNames[t.id] || [];

              return (
                <div
                  key={t.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200 flex flex-col h-full"
                >
                  <Link
                    to={`/tabellone/${t.id}`}
                    className="block flex-1 p-6 border-b border-gray-100"
                  >
                    <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                      {t.name || '—'}
                    </h2>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{iscritti}/{t.max_players || '—'} iscritti</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            t.status === 'completato'
                              ? 'bg-green-100 text-green-800'
                              : t.status === 'in_corso'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {t.status || 'aperto'}
                        </span>
                      </div>

                      {/* ✅ NOMI GIOCATORI AVANZATI */}
                      {namesList.length > 0 && (
                        <div className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                          <p className="text-xs font-semibold text-emerald-800 mb-2 flex items-center gap-1">
                            👥 Iscritti:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {namesList.slice(0, 5).map((name, i) => (
                              <span
                                key={i}
                                className="text-xs bg-white px-2 py-1 rounded-full text-gray-800 border border-gray-200 shadow-sm"
                                title={name}
                              >
                                {name.length > 8 ? name.slice(0, 8) + '...' : name}
                              </span>
                            ))}
                            {namesList.length > 5 && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                +{namesList.length - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (iscritti / (t.max_players || 16)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      💰 {t.price ? `€${t.price}` : 'Gratis'} • 📅{' '}
                      {t.data_inizio
                        ? new Date(t.data_inizio).toLocaleDateString('it-IT')
                        : '—'}
                    </div>
                  </Link>

                  <div className="p-6 pt-3">
                    {isFull ? (
                      <div className="w-full text-center bg-orange-100 text-orange-800 py-3 px-4 rounded-xl font-bold text-sm border-2 border-orange-200 flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        TORNEIO COMPLETO
                      </div>
                    ) : isRegistered ? (
                      <div className="w-full bg-emerald-100 text-emerald-800 py-3 px-4 rounded-xl font-bold text-sm border-2 border-emerald-200 flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        ISCRITTO ✅
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegister(t.id)}
                        disabled={isRegistering}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-green-700 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            ISCRIZIONE...
                          </>
                        ) : (
                          '🎾 ISCRIVITI ORA'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}