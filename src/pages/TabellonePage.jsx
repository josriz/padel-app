// src/pages/TabellonePage.jsx - COMPLETO STILE LOGIN
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthProvider';
import TournamentLayout from '../components/TournamentLayout';
import { Trophy, Users, Loader2, Crown, Move } from 'lucide-react';

export default function TabellonePage() {
  const { tournamentId } = useParams();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [positions, setPositions] = useState(Array(16).fill(null));
  const [loading, setLoading] = useState(true);
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  
  // ✅ FIX: Check tournamentId DOPO tutti gli useState
  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }
    fetchTournamentData();
  }, [tournamentId]);

  const fetchTournamentData = async () => {
    setLoading(true);
    
    try {
      const { data: tourneyData } = await supabase
        .from('tournaments')
        .select('id, name, max_players')
        .eq('id', tournamentId)
        .single();
      
      const { data: regsData } = await supabase
        .from('tournament_registrations')
        .select('id, display_name, created_at') // ✅ FIX: display_name
        .eq('tournament_id', tournamentId)
        .order('created_at');
      
      setTournament(tourneyData);
      setParticipants(regsData || []);
      
      const { data: posData } = await supabase
        .from('tournament_brackets')
        .select('position, player_name')
        .eq('tournament_id', tournamentId)
        .order('position');
      
      const savedPositions = posData?.reduce((acc, p) => {
        acc[p.position] = p.player_name;
        return acc;
      }, Array(16).fill(null)) || Array(16).fill(null);
      
      setPositions(savedPositions);
    } catch (error) {
      console.error('❌ Errore fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = useCallback((e, playerIndex) => {
    setDraggedPlayer(participants[playerIndex]);
    e.dataTransfer.effectAllowed = 'move';
  }, [participants]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, positionIndex) => {
    e.preventDefault();
    if (!draggedPlayer) return;

    const newPositions = [...positions];
    newPositions[positionIndex] = draggedPlayer.display_name; // ✅ FIX: display_name
    setPositions(newPositions);
    
    supabase
      .from('tournament_brackets')
      .upsert([{ 
        tournament_id: tournamentId, 
        position: positionIndex, 
        player_name: draggedPlayer.display_name 
      }]);
    
    setDraggedPlayer(null);
  }, [draggedPlayer, positions, tournamentId]);

  const clearPosition = useCallback((positionIndex) => {
    const newPositions = [...positions];
    newPositions[positionIndex] = null;
    setPositions(newPositions);
    
    supabase
      .from('tournament_brackets')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('position', positionIndex);
  }, [positions, tournamentId]);

  if (loading) {
    return (
      <TournamentLayout title="Caricamento..." subtitle="Tabellone torneo">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
      </TournamentLayout>
    );
  }

  if (!tournamentId || !tournament) {
    return (
      <TournamentLayout title="Torneo non trovato" subtitle="">
        <div className="text-center py-20">
          <Trophy className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <p className="text-2xl text-gray-500">Tabellone non disponibile</p>
          <Link 
            to="/admin-tournaments" 
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 mt-4 inline-block"
          >
            ← Torna ai Tornei
          </Link>
        </div>
      </TournamentLayout>
    );
  }

  return (
    <TournamentLayout 
      title={tournament.name} 
      subtitle={isAdmin ? "👑 Tabellone Drag & Drop" : "Tabellone Torneo"}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ISCRITTI */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="w-6 h-6" />
            Iscritti ({participants.length}/{tournament.max_players || 16})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {participants.map((player, i) => (
              <div
                key={player.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm transition cursor-move"
                draggable={isAdmin}
                onDragStart={isAdmin ? (e) => handleDragStart(e, i) : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{player.display_name}</h4> {/* ✅ FIX: display_name */}
                    <p className="text-sm text-gray-600">{new Date(player.created_at).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TABELLONE */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            🏓 Tabellone
            {isAdmin && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">ADMIN</span>}
          </h3>
          <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-xl">
            {positions.map((playerName, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border h-24 flex flex-col items-center justify-center transition-all ${
                  playerName
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-semibold hover:bg-emerald-200 cursor-pointer'
                    : 'bg-white border-gray-200 border-dashed hover:border-blue-300 hover:bg-blue-50'
                }`}
                onDragOver={isAdmin ? handleDragOver : undefined}
                onDrop={isAdmin ? (e) => handleDrop(e, index) : undefined}
                onClick={isAdmin && playerName ? () => clearPosition(index) : undefined}
              >
                {playerName ? (
                  <>
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm mb-1 border">
                      {index + 1}
                    </div>
                    <div className="text-xs text-center truncate max-w-[80px]">{playerName}</div>
                  </>
                ) : (
                  <div className="text-xs text-gray-500 text-center">
                    Pos. {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TournamentLayout>
  );
}
