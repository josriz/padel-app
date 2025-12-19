// src/components/TournamentViewOnly.jsx - ✅ FIXATO: NO LOOP 400 ERROR + MODALITÀ ADMIN
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, Plus, CheckCircle, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

export default function TournamentViewOnly({ triggerParticipantsRefresh = () => {}, admin = false }) {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [participantsCounts, setParticipantsCounts] = useState({});
  const [myRegistrations, setMyRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, [admin]); // 🔹 aggiorna se cambia modalità admin

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // ✅ Se admin, possiamo mostrare anche tornei non pubblici o gestione
      let query = supabase.from('tournaments').select('*').order('created_at', { ascending: false });
      if (!admin) query = query.eq('status', 'aperto'); // solo tornei aperti per utenti normali

      const { data: tournamentsData, error: tournamentsError } = await query;
      if (tournamentsError) throw tournamentsError;

      const tournamentsWithCounts = await Promise.all(
        (tournamentsData || []).map(async (t) => {
          const { count } = await supabase
            .from('tournament_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('tournament_id', t.id);
          
          return { ...t, totalIscritti: count || 0 };
        })
      );

      setTournaments(tournamentsWithCounts);

      // ✅ Mie iscrizioni solo per utenti normali
      if (!admin) {
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
      }
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (tournamentId) => {
    if (admin) return; // 🔹 gli admin non si registrano ai tornei
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
          tournament_id: tournamentId,
          user_id: user.id
        });
      
      if (error) throw error;

      setMessage({ type: 'success', text: '✅ Iscritto con successo!' });
      fetchData(); 
      triggerParticipantsRefresh();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
      </div>
    );

  if (fetchError)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {fetchError}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 pt-4 pb-12">
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-xl font-bold"
          >
            ← Indietro
          </button>
        </div>

        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-sm border border-gray-200">
            <Calendar className="w-9 h-9 text-gray-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {admin ? 'Gestione Tornei' : 'Tornei Disponibili'}
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            ({tournaments.length}) Tornei {admin ? 'totali' : 'attivi'}
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-4 flex items-start gap-3 shadow-sm border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <CheckCircle className="w-5 h-5 mt-0.5" />
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(t => {
            const iscritti = t.totalIscritti || 0;
            return (
              <div
                key={t.id}
                className="bg-white p-6 rounded-xl shadow border border-gray-200 flex flex-col gap-3"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t.name}</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl border border-gray-200">
                    <Users className="w-4 h-4 text-gray-700" />
                    <span className="text-sm font-semibold text-gray-700">
                      {iscritti}/{t.max_players || 16} • €{t.price || 0}
                    </span>
                  </div>

                  <span className="block w-full px-4 py-2 rounded-xl text-sm font-bold text-center text-white bg-gray-700">
                    {t.status || 'aperto'}
                  </span>
                </div>

                {!admin && (
                  <button
                    disabled={myRegistrations[t.id]}
                    onClick={() => handleRegister(t.id)}
                    className={`w-full py-3 px-6 font-bold rounded-xl text-white flex items-center justify-center gap-2 text-sm transition-all ${
                      myRegistrations[t.id]
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {myRegistrations[t.id] ? 'Già iscritto' : 'Iscriviti'}
                  </button>
                )}

                <button
                  onClick={() => navigate(`/tabellone-demo`)}
                  className="w-full mt-2 py-3 px-6 font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700"
                >
                  🏆 Vai al Tabellone
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
