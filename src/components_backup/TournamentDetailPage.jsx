import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const TournamentDetailPage = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [showPlayersMenu, setShowPlayersMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // ? Torneo OK
      const { data: tournamentData } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();
      setTournament(tournamentData);

      // ? RIGA 22 CORRETTA - TABELL REAL
      const { data: registrations } = await supabase
        .from('registrations')  // ? FIX - Tabella corretta
        .select('player_name, player_surname, player_email, team_name')
        .eq('tournament_id', id);
      setPlayers(registrations || []);
      
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;

  if (!tournament) return <div className="min-h-screen flex items-center justify-center">Torneo non trovato</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center mb-6">
        <div>
          <Link to="/admin" className="text-blue-500 hover:underline mb-2 inline-block">&larr; Torna indietro</Link>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowPlayersMenu(!showPlayersMenu)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ?? {players.length} Iscritti
          </button>
        </div>
      </header>

      <div className="flex gap-6">
        {/* MENU ISCRITTI */}
        {showPlayersMenu && (
          <div className="bg-white p-6 rounded-xl shadow-md w-80 sticky top-8 h-fit">
            <h2 className="font-bold text-xl mb-4">Iscritti ({players.length})</h2>
            {players.length === 0 ? (
              <div className="text-gray-500 text-center py-8">Nessun iscritto</div>
            ) : (
              players.map((p, i) => (
                <div key={p.id || i} className="p-4 border-b last:border-none hover:bg-gray-50 rounded-lg mb-2">
                  <div className="font-semibold">{p.player_name} {p.player_surname}</div>
                  <div className="text-sm text-gray-500">{p.player_email}</div>
                  {p.team_name && <div className="text-sm text-gray-600 mt-1">Team: {p.team_name}</div>}
                </div>
              ))
            )}
          </div>
        )}

        {/* TABELLONE */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-6">Tabellone {tournament.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: tournament.max_players || 16 }, (_, i) => (
              <div key={i} className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center min-h-20 flex items-center justify-center hover:border-blue-300">
                Slot {i + 1}
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Prossimi passi:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <Link to={`/tournaments/${id}/players`} className="p-3 bg-white rounded-lg border hover:shadow-md">?? Gestione Iscritti</Link>
              <Link to={`/tournaments/${id}/bracket`} className="p-3 bg-white rounded-lg border hover:shadow-md">?? Bracket</Link>
              <Link to={`/tournaments/${id}/board`} className="p-3 bg-white rounded-lg border hover:shadow-md">?? Tabellone Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailPage;
