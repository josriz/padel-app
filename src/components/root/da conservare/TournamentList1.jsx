import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../supabaseClient';
import { Trophy, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TournamentList() {
  const { isAdmin } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [participantsCounts, setParticipantsCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const tournamentsData = data || [];
        console.log('🔍 DEBUG Tournaments:', tournamentsData);

        const validTournaments = tournamentsData.filter(t => t && t.id);
        console.log('✅ Tornei validi:', validTournaments.length);

        const counts = {};
        for (const tournament of validTournaments) {
          const { count: regCount } = await supabase
            .from('tournament_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('tournament_id', tournament.id);

          counts[tournament.id] = regCount || 0;
        }

        setTournaments(validTournaments);
        setParticipantsCounts(counts);
      } catch (error) {
        console.error('Errore tornei:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-gray-50 pt-4 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-9 h-9 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tornei</h1>
          <p className="text-lg text-gray-600">
            ({tournaments.length}) tornei • {Object.values(participantsCounts).reduce((a, b) => a + b, 0)} iscritti totali
          </p>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <Trophy className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun torneo trovato</h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => {
              const iscritti = participantsCounts[t.id] || 0;
              const progress = t.max_players ? Math.min((iscritti / t.max_players) * 100, 100) : 0;

              return (
                <Link
                  key={t.id}
                  to={`/tabellone/${t.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200 block h-full hover:border-blue-300"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                      {t.name || '—'}
                    </h2>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
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
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      💰 {t.price ? `€${t.price}` : 'Gratis'} • 📅{' '}
                      {new Date(t.created_at).toLocaleDateString('it-IT')}
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm group-hover:shadow-md transition-all text-sm hover:from-emerald-600 hover:to-green-700">
                      {isAdmin
                        ? <>ADMIN: Tabellone Completo</>
                        : iscritti >= (t.max_players || 16)
                        ? '🏆 Completo'
                        : 'Iscriviti Ora'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
