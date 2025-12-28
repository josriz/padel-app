import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthProvider';
import BackButton from './BackButton';

export default function TournamentBracketEditable({ tournamentId, bracketSlots }) {
  const { isAdmin } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [localSlots, setLocalSlots] = useState([]);

  if (!isAdmin) return null;

  useEffect(() => {
    if (bracketSlots) setLocalSlots(bracketSlots);
    if (tournamentId) loadResults();
  }, [tournamentId, bracketSlots]);

  const loadResults = async () => {
    try {
      const { data } = await supabase
        .from('tournament_results')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();
      
      if (data) {
        setResults(data.results || {});
        if (data.bracket_slots) setLocalSlots(data.bracket_slots);
        console.log('? Caricati:', data.results);
      }
    } catch (err) {
      console.log('No data');
    }
  };

  const updateScore = (campoNum, teamIndex, score) => {
    const matchKey = `campo${campoNum}`;
    setResults(prev => {
      const current = prev[matchKey] || { score: ['', ''] };
      const newScore = [...current.score];
      newScore[teamIndex] = score;
      console.log(`?? Campo ${campoNum}: ${newScore.join('-')}`);
      return { ...prev, [matchKey]: { ...current, score: newScore } };
    });
  };

  const passWinners = () => {
    const newSlots = [...localSlots];
    
    const ott1 = localSlots.slice(0, 4);
    if (results.campo1?.winner === 0 && ott1[0] && ott1[1]) {
      newSlots[8] = ott1[0];
      newSlots[9] = ott1[1];
      console.log('? AUTO-PASS CAMPO 3:', ott1[0].nome, '+', ott1[1].nome);
    }
    if (results.campo1?.winner === 1 && ott1[2] && ott1[3]) {
      newSlots[8] = ott1[2];
      newSlots[9] = ott1[3];
      console.log('? AUTO-PASS CAMPO 3:', ott1[2].nome, '+', ott1[3].nome);
    }
    
    const ott2 = localSlots.slice(4, 8);
    if (results.campo2?.winner === 0 && ott2[0] && ott2[1]) {
      newSlots[12] = ott2[0];
      newSlots[13] = ott2[1];
      console.log('? AUTO-PASS CAMPO 4:', ott2[0].nome, '+', ott2[1].nome);
    }
    if (results.campo2?.winner === 1 && ott2[2] && ott2[3]) {
      newSlots[12] = ott2[2];
      newSlots[13] = ott2[3];
      console.log('? AUTO-PASS CAMPO 4:', ott2[2].nome, '+', ott2[3].nome);
    }
    
    setLocalSlots(newSlots);
  };

  const setWinner = (campoNum, winningTeam) => {
    console.log('?? CAMPO', campoNum, '? Squadra', winningTeam + 1, 'VINCE!');
    const matchKey = `campo${campoNum}`;
    const newResults = {
      ...results,
      [matchKey]: {
        score: results[matchKey]?.score || ['', ''],
        winner: winningTeam,
        completed: true
      }
    };
    
    setResults(newResults);
    passWinners();
    console.log('? WINNER SALVATO:', newResults[matchKey]);
  };

  const saveResults = async () => {
    setLoading(true);
    console.log('?? SALVANDO:', results);
    try {
      await supabase.from('tournament_results').upsert({
        tournament_id: tournamentId,
        results: results,
        bracket_slots: localSlots
      });
      alert('? SALVATO CON AUTO-PASS!');
      console.log('? SALVATO IN SUPABASE');
    } catch (err) {
      alert('? ' + err.message);
    }
    setLoading(false);
  };

  const ottaviSlot1 = localSlots.slice(0, 4);
  const ottaviSlot2 = localSlots.slice(4, 8);
  const quartiSlot1 = localSlots.slice(8, 12);
  const quartiSlot2 = localSlots.slice(12, 16);
  const semiSlot1 = localSlots.slice(16, 20);
  const semiSlot2 = localSlots.slice(20, 24);
  const finaleSlot = localSlots.slice(24, 28);

  const renderMatch = (slots, title, campoNum) => {
    const matchKey = `campo${campoNum}`;
    const matchData = results[matchKey];
    const scoreData = matchData?.score || ['', ''];
    const winnerTeam = matchData?.winner;

    return (
      <div className="p-6 bg-white border-4 border-black rounded-lg shadow-lg">
        <div className="text-center mb-4">
          <div className="bg-black text-white px-6 py-3 rounded-lg font-bold text-lg">
            CAMPO {campoNum}
          </div>
          <h3 className="font-bold text-2xl mt-2 text-black">{title}</h3>
          <div className="text-sm bg-gray-100 p-3 rounded mt-2 font-mono text-black border border-black">
            Score: {scoreData.join('-')} | Winner: {winnerTeam ?? '---'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {slots.map((slot, i) => {
            const teamIndex = Math.floor(i / 2);
            const isWinner = winnerTeam === teamIndex;
            return (
              <div key={i} className={`p-6 rounded-lg border-4 transition-all hover:scale-105 ${
                isWinner 
                  ? 'bg-black text-white border-black shadow-2xl animate-pulse font-bold' 
                  : slot 
                    ? 'bg-gray-100 border-black shadow-lg text-black hover:shadow-xl' 
                    : 'bg-white border-dashed border-gray-400 text-gray-500'
              }`}>
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white border-4 border-black flex items-center justify-center font-bold text-xl shadow-lg">
                  {slot ? `${slot.nome?.[0]}${slot.cognome?.[0]}`.toUpperCase() : '??'}
                </div>
                <div className="font-bold text-center text-base min-h-[3rem] text-black">
                  {slot ? `${slot.nome} ${slot.cognome}`.trim() : '---'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-gray-50 border-4 border-black rounded-lg">
          <div className="flex items-center justify-center gap-6 mb-6">
            <input 
              type="number" 
              placeholder="6"
              value={scoreData[0] || ''}
              onChange={(e) => updateScore(campoNum, 0, e.target.value)}
              className="w-24 p-4 text-2xl font-bold text-center border-4 border-black rounded-lg bg-white focus:border-black focus:ring-4 ring-black shadow-lg"
            />
            <span className="text-3xl font-bold text-black tracking-wide">VS</span>
            <input 
              type="number" 
              placeholder="4"
              value={scoreData[1] || ''}
              onChange={(e) => updateScore(campoNum, 1, e.target.value)}
              className="w-24 p-4 text-2xl font-bold text-center border-4 border-black rounded-lg bg-white focus:border-black focus:ring-4 ring-black shadow-lg"
            />
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setWinner(campoNum, 0)}
              className="flex-1 py-4 bg-black hover:bg-gray-900 text-white font-bold text-xl rounded-lg shadow-xl transition-all border-4 border-black hover:shadow-2xl"
            >
              ?? Squadra 1
            </button>
            <button 
              onClick={() => setWinner(campoNum, 1)}
              className="flex-1 py-4 bg-black hover:bg-gray-900 text-white font-bold text-xl rounded-lg shadow-xl transition-all border-4 border-black hover:shadow-2xl"
            >
              ?? Squadra 2
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-12 bg-white">
      <BackButton />
      
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-8 text-black border-b-8 border-black pb-6 tracking-wide">
          COPPA PADEL 2vs2
        </h1>
        <button 
          onClick={saveResults}
          disabled={loading}
          className="px-16 py-6 bg-black hover:bg-gray-900 text-white font-black text-2xl rounded-xl shadow-2xl transition-all border-6 border-black disabled:opacity-50 hover:shadow-4xl tracking-wide"
        >
          {loading ? 'SALVANDO...' : 'SALVA RISULTATI'}
        </button>
      </div>

      <div className="mb-20">
        <h2 className="text-4xl font-black text-center mb-16 text-black border-b-4 border-black pb-4 tracking-wide">OTTAVI</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {renderMatch(ottaviSlot1, 'CAMPO 1', 1)}
          {renderMatch(ottaviSlot2, 'CAMPO 2', 2)}
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-4xl font-black text-center mb-16 text-black border-b-4 border-black pb-4 tracking-wide">QUARTI</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {renderMatch(quartiSlot1, 'CAMPO 3', 3)}
          {renderMatch(quartiSlot2, 'CAMPO 4', 4)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-4xl font-black text-center mb-12 text-black border-b-4 border-black pb-4 tracking-wide">SEMIFINALI</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {renderMatch(semiSlot1, 'CAMPO 5', 5)}
            {renderMatch(semiSlot2, 'CAMPO 6', 6)}
          </div>
        </div>
        <div>
          <h2 className="text-5xl font-black text-center mb-12 text-black border-b-6 border-black pb-6 tracking-wide">FINALE</h2>
          {renderMatch(finaleSlot, 'CAMPO 7', 7)}
        </div>
      </div>
    </div>
  );
}
