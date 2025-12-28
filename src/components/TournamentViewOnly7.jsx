// src/components/TournamentViewOnly.jsx - ✅ LAYOUT DASHBOARD COMPATTO
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, Plus, CheckCircle, Loader2, Calendar } from 'lucide-react';

export default function TournamentViewOnly() {
  const [tournaments, setTournaments] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tournamentsError) throw tournamentsError;
      setTournaments(tournamentsData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id) {
        const { data: myRegs } = await supabase
          .from('tournament_registrations')
          .select('tournament_id')
          .eq('user_id', user.id);
        const regsMap = {};
        myRegs?.forEach(reg => regsMap[reg.tournament_id] = true);
        setMyRegistrations(regsMap);
      }
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (tournamentId) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ type: 'error', text: '❌ Effettua il login!' });
        return;
      }

      const { error } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: Number(tournamentId),
          user_id: user.id
        });
      
      if (error) throw error;
      setMessage({ type: 'success', text: '✅ Iscritto con successo!' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12 text-blue-600" /></div>;
  if (fetchError) return <div className="min-h-screen flex items-center justify-center text-red-600">{fetchError}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 pt-4 pb-12">
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-sm border border-gray-200">
            <Calendar className="w-9 h-9 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tornei Disponibili</h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            ({tournaments.length}) Iscriviti ai tornei padel
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 shadow-sm ${
            message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <Users className="w-5 h-5 mt-0.5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3 group">
              <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2">{t.name}</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">{t.max_players || 16} posti | €{t.price || 0}</span>
                </div>
                <span className={`block w-full px-4 py-2 rounded-xl text-sm font-bold text-center text-white ${
                  t.status === 'pianificato' ? 'bg-blue-600' :
                  t.status === 'in_corso' ? 'bg-yellow-600' : 'bg-green-600'
                }`}>{t.status}</span>
              </div>

              <button
                disabled={myRegistrations[t.id]}
                onClick={() => handleRegister(t.id)}
                className={`w-full py-3 px-6 font-bold rounded-xl text-white flex items-center justify-center gap-2 text-sm transition-all hover:-translate-y-0.5 ${
                  myRegistrations[t.id] ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-md'
                }`}
              >
                <Plus className="w-4 h-4" />
                {myRegistrations[t.id] ? 'Già iscritto' : 'Iscriviti'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
