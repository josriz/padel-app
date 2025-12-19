// src/components/TournamentDetailPage.jsx - ✅ 100% FUNZIONANTE!
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const TournamentDetailPage = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [showPlayersMenu, setShowPlayersMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // ✅ 1. Torneo (colonna CORRETTA: players)
        const { data: tournamentData } = await supabase
          .from('tournaments')
          .select('id, name, type, players, status, created_at')
          .eq('id', id)
          .single();
        
        console.log("✅ Torneo:", tournamentData);
        setTournament(tournamentData);

        // ✅ 2. FIX: tournament_players + player_name (NO JOIN!)
        const { data, count, error } = await supabase
          .from('tournament_players')
          .select('id, player_name, rating, created_at', { count: 'exact' })
          .eq('tournament_id', id);

        if (error) {
          console.error('❌ tournament_players:', error);
        } else {
          console.log(`✅ ISCRITTI: ${data?.length || 0} giocatori trovati`);
          
          // ✅ Usa player_name diretto (NO profiles!)
          const playersWithNames = data?.map(reg => ({
            id: reg.id,
            full_name: reg.player_name || 'Giocatore Anonimo',
            rating: reg.rating || 1500,
            created_at: reg.created_at
          })) || [];
          
          setPlayers(playersWithNames);
          setParticipantsCount(count || data?.length || 0);
          console.log('✅ Giocatori caricati:', playersWithNames.slice(0, 3));
        }
        
      } catch (err) {
        console.error('❌ fetchData:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl text-gray-600 font-semibold">Caricamento torneo...</p>
      </div>
    </div>
  );

  if (!tournament) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🏆</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Torneo non trovato</h1>
        <Link to="/tournaments" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
          ← Torna ai Tornei
        </Link>
      </div>
    </div>
  );

  const getPlayerName = (player) => {
    return player.full_name || 'N/D';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-6 md:p-8">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-white/50 mb-8 sticky top-4 z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start lg:items-center justify-between">
          <div className="flex-1">
            <Link 
              to="/tournaments" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 text-sm bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 transition-all"
            >
              ← Torna ai tornei
            </Link>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 bg-clip-text text-transparent mb-2">
              {tournament.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <span className={`px-4 py-2 rounded-full font-semibold text-xs ${
                tournament.type === 'Diretta' ? 'bg-blue-100 text-blue-800' :
                tournament.type === 'Gironi' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {tournament.type}
              </span>
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-semibold rounded-full text-sm flex items-center gap-1">
                {participantsCount}/{tournament.players || 16}
              </span>
              <span className={`px-4 py-2 rounded-full font-semibold text-xs ${
                tournament.status === 'registration' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {tournament.status === 'registration' ? '📝 ISCRIZIONI' : tournament.status}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowPlayersMenu(!showPlayersMenu)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-3 whitespace-nowrap group hover:-translate-y-1"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">👥</span>
            <span>{participantsCount} Iscritti</span>
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* MENU ISCRITTI */}
        {showPlayersMenu && (
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 sticky top-24 h-fit max-h-[70vh] overflow-y-auto">
            <h2 className="font-black text-xl mb-6 flex items-center gap-3 text-blue-800 border-b pb-4 border-blue-100">
              👥 Lista Iscritti
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                {players.length}
              </span>
            </h2>
            
            {players.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-1">Nessun iscritto</p>
                <p className="text-sm text-gray-500">Sii il primo giocatore!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {players.slice(0, 10).map((p, i) => (
                  <div key={p.id || i} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl hover:shadow-md hover:border-blue-200 transition-all group">
                    <div className="font-bold text-gray-900 text-sm mb-1 truncate">
                      {getPlayerName(p)}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      Rating: {p.rating || 1500}
                    </div>
                    {p.created_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(p.created_at).toLocaleDateString('it-IT')}
                      </div>
                    )}
                  </div>
                ))}
                {players.length > 10 && (
                  <div className="text-center py-4 text-sm text-gray-500 border-t">
                    +{players.length - 10} altri...
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/50">
          <h2 className="text-3xl font-black mb-8 flex items-center gap-4 text-gray-900 bg-gradient-to-r from-gray-900 to-slate-900 bg-clip-text text-transparent">
            🏆 Tabellone {tournament.name}
          </h2>
          
          {/* SLOTS TABELLONE */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-12">
            {Array.from({ length: tournament.players || 16 }, (_, i) => (
              <div key={i} className="group relative p-8 border-2 border-dashed border-gray-300 rounded-3xl text-center min-h-32 flex flex-col items-center justify-center hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.03] hover:-translate-y-2 bg-white/50 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:from-emerald-400 group-hover:to-emerald-500 group-hover:shadow-emerald-200 group-hover:scale-110 transition-all duration-300">
                  <span className="text-xl font-black text-gray-700 group-hover:text-white">
                    P{i + 1}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-800 group-hover:text-emerald-700">
                  Slot {i + 1}
                </span>
                <span className="text-xs text-gray-500 mt-1">Libero</span>
              </div>
            ))}
          </div>
          
          {/* PROSSIMI PASSI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border-4 border-blue-100 shadow-2xl">
            <Link 
              to={`/tournaments/${id}/players`} 
              className="group p-8 bg-white/80 rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-2 transition-all backdrop-blur-md flex flex-col items-center justify-center gap-3 font-bold text-blue-800 hover:text-blue-900"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                <span className="text-white text-xl">👥</span>
              </div>
              <span className="text-lg">Gestione Iscritti</span>
              <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full group-hover:bg-blue-200">
                {participantsCount} giocatori
              </span>
            </Link>
            
            <Link 
              to={`/tournaments/${id}/bracket`} 
              className="group p-8 bg-white/80 rounded-2xl border-2 border-green-200 hover:border-green-400 hover:shadow-2xl hover:-translate-y-2 transition-all backdrop-blur-md flex flex-col items-center justify-center gap-3 font-bold text-green-800 hover:text-green-900"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                <span className="text-white text-xl">🏆</span>
              </div>
              <span className="text-lg">Genera Bracket</span>
              <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full group-hover:bg-green-200">
                Automatico
              </span>
            </Link>
            
            <Link 
              to={`/tournaments/${id}/board`} 
              className="group p-8 bg-white/80 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl hover:-translate-y-2 transition-all backdrop-blur-md flex flex-col items-center justify-center gap-3 font-bold text-purple-800 hover:text-purple-900"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                <span className="text-white text-xl">🎾</span>
              </div>
              <span className="text-lg">Tabellone Admin</span>
              <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full group-hover:bg-purple-200">
                Drag & Drop
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailPage;
