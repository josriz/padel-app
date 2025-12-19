// src/components/ParticipantsList.jsx - ✅ FIX COMPLETO: UUID → NOMI REALI
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../supabaseClient';
import { Users, Loader2, AlertCircle } from 'lucide-react';

export default function ParticipantsList({ torneoId }) {
  const { user, isAdmin } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!torneoId) {
        setError('ID torneo mancante');
        setLoading(false);
        return;
      }
      if (!user) {
        setError('Effettua il login per vedere i partecipanti');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // ✅ FIX: Usa tournament_registrations + JOIN profiles
        let query = supabase
          .from('tournament_registrations')
          .select(`
            *,
            profiles (
              id,
              full_name,
              email,
              first_name,
              last_name
            )
          `)
          .eq('tournament_id', torneoId);

        // Se NON admin, filtriamo solo i propri record
        if (!isAdmin) {
          query = query.eq('profile_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        // ✅ Trasforma dati per render
        const participantsList = (data || []).map(reg => ({
          id: reg.id,
          full_name: reg.profiles?.full_name || 
                    `${reg.profiles?.first_name || ''} ${reg.profiles?.last_name || ''}`.trim() || 
                    'N/D',
          email: reg.profiles?.email || 'N/D',
          profile_id: reg.profile_id
        }));

        setParticipants(participantsList);
        console.log('✅ Partecipanti con nomi reali:', participantsList);
      } catch (err) {
        console.error('Errore fetch participants:', err);
        setError('Errore nel caricamento partecipanti');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [torneoId, user, isAdmin]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p>Login richiesto per visualizzare i partecipanti</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">
        Iscrizioni
      </h2>
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <strong>Registrati al torneo</strong>
      </div>
      {participants.length === 0 ? (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          Nessun partecipante iscritto
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((p) => (
            <div key={p.id} className="p-3 bg-white border rounded-lg hover:bg-gray-50">
              {p.full_name} - {p.email}
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 pt-4 border-t">
        <h3 className="font-bold mb-2">Match del torneo</h3>
        <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
          Nessun match programmato
        </div>
      </div>
    </div>
  );
}
