import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ChevronLeft, Trophy, Users, GripVertical, User, Save, ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function PadelBracket() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [round, setRound] = useState('ottavi');
  const [players, setPlayers] = useState([]);
  const [bracket, setBracket] = useState({
    ottavi: [[[null,null],[null,null]], [[null,null],[null,null]]],
    quarti: [[[null,null],[null,null]]],
    semi: [[null,null]],
    finale: [[null,null]]
  });
  const [results, setResults] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tournamentName, setTournamentName] = useState('Tabellone Padel');
  const [bracketType, setBracketType] = useState('diretto');

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    propagateWinners();
  }, [results]);

  const propagateWinners = () => {
    const newBracket = JSON.parse(JSON.stringify(bracket));
    bracket.ottavi?.forEach?.((match, matchIndex) => {
      const resultKey = `ottavi_${matchIndex}`;
      const result = results[resultKey];
      if (result?.set1 > 0 && result?.set2 > 0 && match?.[0]?.[0] && match?.[1]?.[0]) {
        const winnerTeam = result.set1 > result.set2 ? match[0] : match[1];
        if (matchIndex === 0) newBracket.quarti[0][0] = winnerTeam;
        if (matchIndex === 1) newBracket.quarti[0][1] = winnerTeam;
      }
    });
    setBracket(newBracket);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: tournamentData } = await supabase
        .from('tournaments')
        .select('name')
        .eq('id', id)
        .single();
      
      setTournamentName(tournamentData?.name || 'Tabellone Padel');

      const { data: tournamentPlayers } = await supabase
        .from('tournament_registrations')
        .select('display_name')
        .eq('tournament_id', id);
      
      setPlayers(tournamentPlayers?.map(p => p.display_name).filter(Boolean) || []);

      const { data: bracketData } = await supabase
        .from('padel_brackets')
        .select('*')
        .eq('tournament_id', id)
        .single();
      
      if (bracketData) {
        setBracketType(bracketData.bracket_type || 'diretto');
        setBracket(bracketData.bracket || bracket);
        setResults(bracketData.results || {});
        setRound(bracketData.round || 'ottavi');
      } else {
        setBracketType('diretto');
        await supabase.from('padel_brackets').insert({
          tournament_id: id,
          bracket_type: 'diretto',
          bracket: bracket,
          status: 'active'
        });
      }
    } catch (error) {
      console.log('Demo mode');
      setTournamentName('Tabellone Test');
      setPlayers(['Mario Rossi', 'Luca Verdi', 'Giulia Bianchi', 'Sara Neri']);
    } finally {
      setLoading(false);
    }
  };

  const saveBracket = async () => {
    setSaving(true);
    try {
      const bracketData = {
        tournament_id: id,
        bracket_type: bracketType,
        bracket,
        results,
        round,
        saved_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('padel_brackets')
        .upsert(bracketData);

      if (!error) {
        alert('✅ Tabellone salvato!');
      } else {
        alert('❌ Errore: ' + error.message);
      }
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const onDragStart = (e, player) => {
    e.dataTransfer.setData("player", player);
  };

  const onDrop = (e, roundKey, matchIndex, teamIndex, playerIndex) => {
    e.preventDefault();
    const player = e.dataTransfer.getData("player");
    setBracket(prev => {
      const newBracket = JSON.parse(JSON.stringify(prev));
      if (newBracket[roundKey]?.[matchIndex]?.[teamIndex]) {
        newBracket[roundKey][matchIndex][teamIndex][playerIndex] = player;
      }
      return newBracket;
    });
    setPlayers(prev => prev.filter(p => p !== player));
  };

  const onDragOver = (e) => e.preventDefault();

  const updateResult = (roundKey, matchIndex, set1, set2) => {
    setResults(prev => ({
      ...prev,
      [`${roundKey}_${matchIndex}`]: { set1: parseInt(set1) || 0, set2: parseInt(set2) || 0 }
    }));
  };

  const rounds = ['ottavi', 'quarti', 'finale'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-4 px-2 sm:px-4">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 px-2 sm:px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 border rounded-lg hover:bg-gray-50 flex items-center gap-1 text-sm">
            <ChevronLeft className="w-4 h-4" />
            Indietro
          </button>
          <h1 className="text-xl font-bold text-center flex-1 truncate">🏆 {tournamentName}</h1>
          <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full whitespace-nowrap">
            {bracketType.toUpperCase()}
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 overflow-x-auto pb-2 border-b border-gray-200">
          {rounds.map(r => (
            <button
              key={r}
              onClick={() => setRound(r)}
              className={`px-4 py-2 text-sm font-bold rounded-t-md whitespace-nowrap flex-shrink-0 transition-all ${
                round === r 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        {/* SALVA IN ALTO */}
        <div className="flex justify-center mb-6">
          <button 
            onClick={saveBracket}
            disabled={saving}
            className="px-8 py-2.5 bg-emerald-600 disabled:bg-gray-400 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 shadow-md flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? '⏳ Salvando...' : '💾 Salva Tabellone'}
          </button>
        </div>

        {/* LAYOUT PRINCIPALE - FULL RESPONSIVE */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[70vh]">
          
          {/* MOBILE: Lista in alto, Tabellone sotto */}
          <div className="xl:order-2 space-y-3">
            <h3 className="font-semibold text-sm text-center flex items-center justify-center gap-2 text-gray-800">
              👥 Iscritti ({players.length})
            </h3>
            <div className="bg-gray-50 p-3 rounded-xl border xl:h-80 h-48 overflow-y-auto space-y-1.5">
              {players.length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-4">Nessun giocatore</div>
              ) : (
                players.map((player, i) => (
                  <div
                    key={i}
                    className="bg-white p-2.5 rounded-lg text-xs shadow-sm cursor-grab hover:bg-emerald-50 flex items-center gap-2 border border-gray-200 hover:border-emerald-400 transition-all hover:shadow-md"
                    draggable
                    onDragStart={(e) => onDragStart(e, player)}
                  >
                    <GripVertical className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    <span className="font-medium truncate text-gray-800 flex-1">{player}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TABELLONE - SEMPRE CENTRALE */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-center flex items-center justify-center gap-2 text-gray-800">
              {round.toUpperCase()} 
              {round === 'quarti' && <span className="text-xs text-emerald-600 font-medium">(AUTO)</span>}
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl border flex-1 min-h-[400px] xl:min-h-[500px] overflow-y-auto space-y-3">
              {bracket[round] && Array.isArray(bracket[round]) ? bracket[round].map((matchesGroup, matchIndex) => {
                if (!matchesGroup || !Array.isArray(matchesGroup)) return null;
                
                const resultKey = `${round}_${matchIndex}`;
                const result = results[resultKey] || { set1: 0, set2: 0 };
                
                return (
                  <div key={matchIndex} className={`p-4 rounded-xl border shadow-sm hover:shadow-md transition-all ${
                    round === 'quarti' 
                      ? 'ring-2 ring-emerald-200 bg-emerald-50/50 border-emerald-200' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-gray-200">
                      <span className="text-xs font-semibold text-gray-700">🏟️ Campo {matchIndex + 1}</span>
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                        P{matchIndex + 1}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {matchesGroup.map((team, teamIndex) => (
                        <div key={teamIndex} className="border rounded-lg p-2.5 bg-white/70 backdrop-blur-sm border-gray-200 hover:border-emerald-300 transition-all min-h-[68px]">
                          {Array.isArray(team) ? team.map((player, playerIndex) => (
                            <div
                              key={playerIndex}
                              className={`p-1.5 rounded-md border text-center text-xs flex items-center justify-center cursor-pointer h-9 hover:border-emerald-400 transition-all flex-1 ${
                                player 
                                  ? 'bg-white/80 border-emerald-400 shadow-sm font-semibold backdrop-blur-sm' 
                                  : 'bg-gray-50/50 border-gray-300'
                              }`}
                              onDrop={(e) => onDrop(e, round, matchIndex, teamIndex, playerIndex)}
                              onDragOver={onDragOver}
                            >
                              {player ? (
                                <div className="flex items-center gap-1.5 text-emerald-700 text-xs">
                                  <User className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate font-medium">{player}</span>
                                </div>
                              ) : (
                                <Users className="w-4.5 h-4.5 text-gray-400" />
                              )}
                            </div>
                          )) : <Users className="w-7 h-7 text-gray-400 mx-auto my-auto" />}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2.5 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-inner">
                      <input
                        type="number"
                        min="0" max="9"
                        value={result.set1}
                        onChange={(e) => updateResult(round, matchIndex, e.target.value, result.set2)}
                        className="w-14 h-11 p-2.5 text-xl font-black text-center border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 focus:outline-none shadow-sm hover:shadow-md transition-all"
                      />
                      <span className="text-xl font-black text-gray-500 font-mono">−</span>
                      <input
                        type="number"
                        min="0" max="9"
                        value={result.set2}
                        onChange={(e) => updateResult(round, matchIndex, result.set1, e.target.value)}
                        className="w-14 h-11 p-2.5 text-xl font-black text-center border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 focus:outline-none shadow-sm hover:shadow-md transition-all"
                      />
                    </div>

                    {result.set1 > 0 && result.set2 > 0 && (
                      <div className="mt-2.5 p-2.5 bg-gradient-to-r from-emerald-500/90 to-emerald-600 rounded-xl text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-sm border border-emerald-300/50">
                        <Trophy className="w-4 h-4" />
                        <span className="truncate font-semibold">
                          {result.set1 > result.set2 
                            ? matchesGroup[0]?.[0] || matchesGroup[0]?.[1] || 'Squadra 1'
                            : matchesGroup[1]?.[0] || matchesGroup[1]?.[1] || 'Squadra 2'
                          }
                        </span>
                        <ArrowRight className="w-4 h-4 animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Caricamento partite...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
