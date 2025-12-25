import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom"; // ✅ AGGIUNTO

export default function TournamentListAndAdmin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate(); // ✅ AGGIUNTO
  
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchTournaments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log("✅ Tornei caricati:", data?.length || 0);
      if (error) throw error;
      setTournaments(data || []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const registerTournament = async (tournamentId) => {
    if (!user) {
      alert('Devi fare login per iscriverti!');
      return;
    }

    try {
      const playerName = user.email?.split('@')[0] || 'Giocatore';
      
      const { data: existing } = await supabase
        .from('tournament_players')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('player_id', user.id)
        .maybeSingle();

      if (existing) {
        alert('❌ Già iscritto!');
        return;
      }

      const { error } = await supabase
        .from('tournament_players')
        .insert([{
          tournament_id: tournamentId,
          player_id: user.id,
          player_name: playerName,
          rating: 1500
        }]);

      if (error) throw error;
      alert('✅ Iscritto con successo!');
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const createTournament = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const type = formData.get('type');
    const players = parseInt(formData.get('players')) || 16;

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert([{ name, tournament_type: type, max_players: players, status: 'registration' }]) // ✅ tournament_type
        .select()
        .single();
      
      if (error) throw error;
      setTournaments([data, ...tournaments]);
      e.target.reset();
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTournament = async (id) => {
    if (!confirm('Eliminare torneo?')) return;
    setDeletingId(id);
    try {
      await supabase.from('tournament_players').delete().eq('tournament_id', id);
      await supabase.from('matches').delete().eq('tournament_id', id);
      const { error } = await supabase.from('tournaments').delete().eq('id', id);
      if (error) throw error;
      setTournaments(tournaments.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ NAVIGAZIONE TORNEO
  const goToBracket = (tournament) => {
    const params = new URLSearchParams({
      type: tournament.tournament_type || 'diretta',
      id: tournament.id,
      num_campi: '4',
      max_players: tournament.max_players || 16
    });
    navigate(`/bracket?${params}`);
  };

  if (loading) return <div className="text-center py-12 text-xl">⏳ Caricamento tornei...</div>;
  if (error) return <div className="text-red-500 text-center py-12 bg-red-50 p-8 rounded-lg max-w-md mx-auto">❌ {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Tornei Disponibili</h1>
            <p className="text-gray-600 mb-1">
              {user ? user.email : 'Non loggato'} 
              {isAdmin && ' | 👨‍💼 Admin'}
            </p>
            <p className="text-lg font-semibold text-gray-900">{tournaments.length} tornei</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              ➕ Crea Torneo
            </button>
          )}
        </div>
      </div>

      {/* Form Crea Torneo (solo admin) */}
      {isAdmin && showCreateForm && (
        <div className="bg-white border rounded-xl p-8 shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">📝 Crea Nuovo Torneo</h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                document.querySelector('form')?.reset();
              }}
              className="text-2xl text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <form onSubmit={createTournament} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">🏆 Nome Torneo</label>
              <input 
                name="name" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 text-lg" 
                placeholder="KING OF PADEL 2025" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">⚙️ Tipo</label>
              <select name="type" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500 text-lg">
                <option value="">Seleziona tipo...</option>
                <option value="diretta">⚡ Diretta Eliminazione</option>
                <option value="king">👑 KING OF PADEL</option> {/* ✅ KING */}
                <option value="ripescaggio">🎯 Ripescaggi</option>
                <option value="doppio">👥 Doppio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">👥 Numero Giocatori</label>
              <select name="players" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500 text-lg">
                <option value="">Seleziona...</option>
                <optgroup label="KING OF PADEL">
                  <option value={8}>8 giocatori 👑</option>
                </optgroup>
                <optgroup label="Standard (Diretta/Ripescaggi)">
                  <option value={16}>16 giocatori</option>
                  <option value={32}>32 giocatori</option>
                </optgroup>
                <optgroup label="Piccoli">
                  <option value={4}>4 giocatori</option>
                  <option value={6}>6 giocatori</option>
                </optgroup>
              </select>
            </div>
            <div className="flex items-end lg:col-span-3">
              <button 
                type="submit" 
                className="ml-auto px-10 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                ✅ CREA TORNEO
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabella Tornei */}
      <div className="bg-white border rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <h3 className="text-xl font-bold text-gray-900">📋 Lista Tornei</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome Torneo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Iscritti</th> {/* ✅ CORRETTO */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tournaments.map((tournament) => (
                <tr key={tournament.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{tournament.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tournament.tournament_type === 'king' ? 'bg-yellow-100 text-yellow-800' :
                      tournament.tournament_type === 'diretta' ? 'bg-blue-100 text-blue-800' :
                      tournament.tournament_type === 'ripescaggio' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {tournament.tournament_type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tournament.max_players || '?'} posti
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tournament.data_inizio ? new Date(tournament.data_inizio).toLocaleDateString('it-IT') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => goToBracket(tournament)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all"
                      >
                        🎾 Bracket
                      </button>
                      {user && (
                        <button
                          onClick={() => registerTournament(tournament.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-all"
                        >
                          Iscriviti
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => deleteTournament(tournament.id)}
                          disabled={deletingId === tournament.id}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all disabled:opacity-50"
                        >
                          {deletingId === tournament.id ? '🗑️' : '🗑️'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
