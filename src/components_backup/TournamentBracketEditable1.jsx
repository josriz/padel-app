import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthProvider';
import BackButton from './BackButton';

export default function TournamentBracketEditable({ tournamentId, bracketSlots, setBracketSlots }) {
  const { isAdmin } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return null;

  useEffect(() => {
    if (tournamentId) loadResults();
  }, [tournamentId]);

  const loadResults = async () => {
    try {
      const { data } = await supabase
        .from('tournament_results')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();
      
      if (data) {
        setResults(data.results || {});
        if (data.bracket_slots && setBracketSlots) setBracketSlots(data.bracket_slots);
        console.log('? Caricati:', data.results);
      }
    } catch (err) {
      console.log('No data');
    }
  };

  const ottaviSlot1 = bracketSlots.slice(0, 4);
  const ottaviSlot2 = bracketSlots.slice(4, 8);
  const quartiSlot1 = bracketSlots.slice(8, 12);
  const quartiSlot2 = bracketSlots.slice(12, 16);
  const semiSlot1 = bracketSlots.slice(16, 20);
  const semiSlot2 = bracketSlots.slice(20, 24);
  const finaleSlot = bracketSlots.slice(24, 28);

  const updateScore = (campoNum, teamIndex, score) => {
    const matchKey = `campo${campoNum}`;
    setResults(prev => {
      const current = prev[matchKey] || { score: ['', ''] };
      const newScore = [...current.score];
      newScore[teamIndex] = score;
      console.log(`?? Campo ${campoNum} Team ${teamIndex}: ${score}`);
      return { ...prev, [matchKey]: { ...current, score: newScore } };
    });
  };

  const passWinnersWithNewResults = (currentResults) => {
    console.log('?? AUTO-PASS START:', currentResults);
    const newSlots = [...bracketSlots];
    
    // Campo 1 ? Campo 3
    const ott1 = bracketSlots.slice(0, 4);
    if (currentResults.campo1?.winner === 0 && ott1[0] && ott1[1]) {
      newSlots[8] = ott1[0];
      newSlots[9] = ott1[1];
      console.log('? CAMPO 3:', ott1[0].nome, '+', ott1[1].nome);
    }
    if (currentResults.campo1?.winner === 1 && ott1[2] && ott1[3]) {
      newSlots[8] = ott1[2];
      newSlots[9] = ott1[3];
      console.log('? CAMPO 3:', ott1[2].nome, '+', ott1[3].nome);
    }
    
    // Campo 2 ? Campo 4
    const ott2 = bracketSlots.slice(4, 8);
    if (currentResults.campo2?.winner === 0 && ott2[0] && ott2[1]) {
      newSlots[12] = ott2[0];
      newSlots[13] = ott2[1];
    }
    if (currentResults.campo2?.winner === 1 && ott2[2] && ott2[3]) {
      newSlots[12] = ott2[2];
      newSlots[13] = ott2[3];
    }
    
    setBracketSlots(newSlots);
    console.log('? AUTO-PASS COMPLETATO');
  };

  const setWinner = (campoNum, winningTeam) => {
    const matchKey = `campo${campoNum}`;
    const newResults = {
      ...results,
      [matchKey]: {
        score: results[matchKey]?.score || ['', ''],
        winner: winningTeam,
        completed: true
      }
    };
    
    console.log(`?? CAMPO ${campoNum} ? Squadra ${winningTeam + 1} VINCE!`);
    console.log('?? NEW RESULTS:', newResults);
    
    setResults(newResults);
    passWinnersWithNewResults(newResults);
  };

  const saveResults = async () => {
    setLoading(true);
    console.log('?? SALVANDO:', results);
    
    try {
      const { error } = await supabase.from('tournament_results').upsert({
        tournament_id: tournamentId,
        results: results,
        bracket_slots: bracketSlots
      });
      
      if (error) throw error;
      console.log('? SALVATO!', results);
      alert('? SALVATO CON VINCITORI!');
    } catch (err) {
      console.error('?', err);
      alert('? ' + err.message);
    }
    setLoading(false);
  };

  const renderMatch = (slots, title, campoNum) => {
    const matchKey = `campo${campoNum}`;
    const matchData = results[matchKey];
    const scoreData = matchData?.score || ['', ''];
    const winnerTeam = matchData?.winner;

    return (
      <div className="p-6 bg-white border-4 border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl">
        <div className="text-center mb-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg inline-block">
            ?? CAMPO {campoNum}
          </div>
          <h3 className="font-bold text-xl mt-2">{title}</h3>
        </div>

        <div className="text-xs text-gray-500 text-center mb-2 bg-yellow-50 p-2 rounded font-mono">
          {matchData ? `Score: ${scoreData.join('-')} Winner: ${winnerTeam ?? '---'}` : 'No data'}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {slots.map((slot, i) => {
            const teamIndex = Math.floor(i / 2);
            const isWinner = winnerTeam === teamIndex;
            return (
              <div key={i} className={`p-4 rounded-xl border-3 transition-all hover:scale-105 ${
                isWinner 
                  ? 'bg-yellow-400 border-yellow-500 ring-4 ring-yellow-300 shadow-2xl animate-pulse text-white' 
                  : slot 
                    ? 'bg-emerald-500 border-emerald-500 shadow-lg text-white' 
                    : 'bg-gray-100 border-dashed border-gray-400 hover:bg-blue-50'
              }`}>
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/80 flex items-center justify-center font-bold text-lg shadow-md">
                  {slot ? `${slot.nome?.[0]}${slot.cognome?.[0]}`.toUpperCase() : '??'}
                </div>
                <div className="font-semibold text-center text-sm min-h-[2.5rem]">
                  {slot ? `${slot.nome} ${slot.cognome}`.trim() : '---'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <input 
              type="number" 
              placeholder="6"
              value={scoreData[0] || ''}
              onChange={(e) => updateScore(campoNum, 0, e.target.value)}
              className="w-20 p-3 text-xl font-bold text-center border-2 border-blue-400 rounded-lg focus:ring-2 ring-blue-500 bg-white"
            />
            <span className="text-2xl font-bold text-gray-700">VS</span>
            <input 
              type="number" 
              placeholder="4"
              value={scoreData[1] || ''}
              onChange={(e) => updateScore(campoNum, 1, e.target.value)}
              className="w-20 p-3 text-xl font-bold text-center border-2 border-blue-400 rounded-lg focus:ring-2 ring-blue-500 bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setWinner(campoNum, 0)}
              disabled={!scoreData[0] || !scoreData[1]}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-lg shadow-md transition-all"
            >
              ?? Squadra 1
            </button>
            <button 
              onClick={() => setWinner(campoNum, 1)}
              disabled={!scoreData[0] || !scoreData[1]}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold rounded-lg shadow-md transition-all"
            >
              ?? Squadra 2
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <BackButton />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
          ?? COPPA PADEL 2vs2
        </h1>
        <button 
          onClick={saveResults}
          disabled={loading}
          className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50"
        >
          {loading ? '? SALVANDO...' : '?? SALVA RISULTATI'}
        </button>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-black text-center mb-12 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">?? OTTAVI</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {renderMatch(ottaviSlot1, 'CAMPO 1', 1)}
          {renderMatch(ottaviSlot2, 'CAMPO 2', 2)}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-black text-center mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">?? QUARTI</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {renderMatch(quartiSlot1, 'CAMPO 3', 3)}
          {renderMatch(quartiSlot2, 'CAMPO 4', 4)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">?? SEMIFINALI</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderMatch(semiSlot1, 'CAMPO 5', 5)}
            {renderMatch(semiSlot2, 'CAMPO 6', 6)}
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-black text-center mb-8 bg-gradient-to-r from-red-600 via-yellow-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-2xl">?? FINALE</h2>
          {renderMatch(finaleSlot, 'CAMPO 7', 7)}
        </div>
      </div>
    </div>
  );
}
