import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../supabaseClient";
import { Users, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function EventSignup({ eventId }) {  // ✅ eventId = torneoId
  const { user } = useAuth();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      // ✅ CAMBIA: events → tournaments
      const { data } = await supabase
        .from('tournaments')
        .select('id, name, type, players, status, created_at')
        .eq('id', eventId)
        .single();
      
      console.log("✅ Torneo trovato:", data);
      setEventData(data);
    } catch (err) {
      console.error("❌ Torneo non trovato:", err);
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Devi fare login!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // ✅ CHECK se già iscritto
      const { data: existing } = await supabase
        .from('tournament_players')
        .select('id')
        .eq('tournament_id', eventId)
        .eq('player_id', user.id);

      if (existing?.length > 0) {
        setMessage({ type: 'error', text: '❌ Già iscritto a questo torneo!' });
        return;
      }

      // ✅ INSERT in tournament_players (non event_registrations)
      const playerName = user.email?.split('@')[0] || 'Giocatore';
      
      const { error } = await supabase
        .from('tournament_players')
        .insert({
          tournament_id: eventId,  // ✅ torneoId
          player_id: user.id,
          player_name: playerName,
          rating: 1500
        });

      if (error) throw error;
      
      setMessage({ 
        type: 'success', 
        text: `✅ Iscrizione completata! Benvenuto nel torneo ${eventData?.name}!` 
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: `❌ Errore: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="text-center py-12">
      <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
      <p>Caricamento torneo...</p>
    </div>
  );

  if (!eventData) return (
    <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-xl p-8">
      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Torneo non trovato</h2>
      <p className="text-gray-600 mb-6">Il torneo che stai cercando non esiste o è stato cancellato</p>
      <a href="/tournaments" className="inline-block py-3 px-8 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
        ← Lista Tornei
      </a>
    </div>
  );

  if (!user) return (
    <div className="text-center p-8 bg-gradient-to-b from-red-50 to-red-100 border-4 border-red-200 rounded-2xl shadow-lg">
      <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Login richiesto</h2>
      <p className="text-lg text-gray-700 mb-8">Devi effettuare il login per iscriverti al torneo</p>
      <a href="/auth" className="block w-full max-w-sm mx-auto py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 transition-all">
        👤 VAI AL LOGIN
      </a>
    </div>
  );

  const isUserRegistered = false; // ✅ Check lato server già fatto sopra

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-xl border border-gray-200 max-w-2xl mx-auto">
      {/* Header Torneo */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
          {eventData.name}
        </h1>
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
            eventData.type === 'Diretta' ? 'bg-blue-100 text-blue-800' :
            eventData.type === 'Gironi' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {eventData.type}
          </span>
          <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold text-sm">
            {eventData.players} posti
          </span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-6 rounded-2xl shadow-lg flex items-center gap-4 mb-8 ${
          message.type === 'success'
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-4 border-emerald-200 text-emerald-800'
            : 'bg-gradient-to-r from-red-50 to-red-100 border-4 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-8 h-8 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-8 h-8 flex-shrink-0" />
          )}
          <span className="font-semibold text-lg flex-1">{message.text}</span>
        </div>
      )}

      {/* Info Torneo */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-slate-50 rounded-xl">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">📅 Data Creazione</h3>
          <p className="text-lg text-gray-700">
            {new Date(eventData.created_at).toLocaleDateString('it-IT')}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">🎯 Tipo Torneo</h3>
          <p className="text-lg text-gray-700 capitalize">{eventData.type}</p>
        </div>
      </div>

      {/* Pulsante Iscrizione */}
      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full py-5 px-8 bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-green-700"
      >
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Iscrizione in corso...</span>
          </>
        ) : (
          <>
            <Users className="w-7 h-7 group-hover:scale-110 transition-transform" />
            <span>ISCRIVITI AL TORNEO</span>
          </>
        )}
      </button>
    </div>
  );
}
