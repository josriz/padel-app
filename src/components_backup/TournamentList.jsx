import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../supabaseClient';
import { Trophy, Users, Loader2, Calendar } from 'lucide-react';

export default function TournamentList() {
  const { isAdmin } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('id, nome, max_players, status')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setTournaments(data || []);
      } catch (error) {
        console.error('Errore caricamento tornei:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  if (loading) return (
    <div className="min-h-[90vh] flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-[90vh] bg-gray-50 pt-4 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-9 h-9 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tornei</h1>
          <p className="text-lg text-gray-600">({tournaments.length}) Scopri i tornei disponibili</p>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <Trophy className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun torneo trovato</h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <Link
                key={t.id}
                to={`/torneo/${t.id}`} 
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200 block h-full"
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">{t.nome || '—'}</h2>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{t.max_players || '—'} max</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      t.status === 'completato' ? 'bg-green-100 text-green-800' :
                      t.status === 'in_corso' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>{t.status || '—'}</span>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm group-hover:shadow-md transition-all text-sm">
                    {isAdmin ? (
                      <>
                        <Trophy className="w-4 h-4" />
                        ADMIN: Tabellone
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        Iscriviti
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
