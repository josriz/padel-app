// src/components/EventiTornei.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../supabaseClient';
import PageContainer from './PageContainer';

export default function EventiTornei({ torneoId }) {
  const { user } = useAuth();
  const [torneo, setTorneo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTorneo();
    fetchParticipants();
  }, [torneoId]);

  const fetchTorneo = async () => {
    const { data } = await supabase.from('tournaments').select('*').eq('id', torneoId).single();
    setTorneo(data);
  };

  const fetchParticipants = async () => {
    const { data } = await supabase.from('tournament_participants').select('*').eq('torneo_id', torneoId);
    setParticipants(data || []);
    setLoading(false);
  };

  const handleIscrizione = async (e) => {
    e.preventDefault();
    if (!user) return alert('Devi fare login!');
    const { error } = await supabase.from('tournament_participants').insert({
      torneo_id: torneoId,
      user_id: user.id,
      nome: user.email.split('@')[0],
      status: 'iscritto'
    });
    if (error) alert(error.message);
    else fetchParticipants();
  };

  if (loading) return <div>? Caricamento torneo...</div>;

  return (
    <PageContainer title="Eventi e Tornei">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">{torneo?.name}</h1>
        <p>?? Data inizio: {torneo?.data_inizio}</p>
        <p>?? Prezzo: €{torneo?.prezzo}</p>
        <p>?? Max giocatori: {torneo?.max_players}</p>
        <p>Status: {torneo?.status}</p>

        {torneo?.status === 'pianificato' && user && !participants.find(p => p.user_id === user.id) && (
          <button onClick={handleIscrizione} className="mt-4 px-6 py-3 bg-green-500 text-white rounded-xl">Iscriviti</button>
        )}

        {participants.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Iscritti:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {participants.map(p => (
                <div key={p.id} className="border p-2 rounded">
                  {p.nome} - {p.email || 'Email non disponibile'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
