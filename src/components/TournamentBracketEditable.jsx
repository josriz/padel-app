// src/components/TournamentBracketEditable.jsx
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
        console.log('? TournamentBracketEditable: risultati caricati');
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
      newSlots[8] = ott1[0]; newSlots[9] = ott1[1];
      console.log('? AUTO-PASS CAMPO 3:', getPlayerName(ott1[0]));
    }
    if (results.campo1?.winner === 1 && ott1[2] && ott1[3]) {
      newSlots[8] = ott1[2]; newSlots[9] = ott1[3];
      console.log('? AUTO-PASS CAMPO 3:', getPlayerName(ott1[2]));
    }
    const ott2 = localSlots.slice(4, 8);
    if (results.campo2?.winner === 0 && ott2[0] && ott2[1]) {
      newSlots[12] = ott2[0]; newSlots[13] = ott2[1];
      console.log('? AUTO-PASS CAMPO 4:', getPlayerName(ott2[0]));
    }
    if (results.campo2?.winner === 1 && ott2[2] && ott2[3]) {
      newSlots[12] = ott2[2]; newSlots[13] = ott2[3];
      console.log('? AUTO-PASS CAMPO 4:', getPlayerName(ott2[2]));
    }
    setLocalSlots(newSlots);
  };

  // ? FUNZIONE FLESSIBILE PER NOMI MULTI-TABELLA
  const getPlayerName = (slot) => {
    if (!slot) return '';
    const nome = slot.nome || slot.name || slot.player_name || slot.full_name || 'N/D';
    const cognome = slot.cognome || slot.surname || slot.player_surname || '';
    return `${nome} ${cognome}`.trim();
  };

  const getPlayerInitials = (slot) => {
    if (!slot) return '??';
    const nome = slot.nome || slot.name || slot.player_name || slot.full_name || '';
    const cognome = slot.cognome || slot.surname || slot.player_surname || '';
    return `${nome[0] || ''}${cognome[0] || ''}`.toUpperCase();
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
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl transition-all mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-black text-gray-900">{title}</h3>
          <div className="text-sm bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-xl font-bold">
            Campo {campoNum}
          </div>
        </div>

        {/* GIOCATORI */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {slots.map((slot, i) => {
            const teamIndex = Math.floor(i / 2);
            const isWinner = winnerTeam === teamIndex;
            return (
              <div
                key={i}
                className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center transition-all text-sm font-bold shadow-md ${
                  isWinner
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-600 shadow-green-300 animate-pulse scale-105'
                    : slot
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400 hover:shadow-lg'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 border-dashed border-gray-300 text-gray-400 hover:border-gray-400'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center mb-3 shadow-lg border">
                  <span className="text-xl font-black">
                    {getPlayerInitials(slot)}
                  </span>
                </div>
                <div className="text-center leading-tight min-h-[3rem]">
                  <div className="text-sm font-bold">{getPlayerName(slot)}</div>
                  {slot && (
                    <div className="text-xs text-gray-500 mt-1">
                      {slot.level || 'Livello N/D'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SCORE + CONTROLLI */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100 shadow-inner">
          <div className="flex justify-center items-center gap-4 mb-4">
            <input
              type="number"
              value={scoreData[0] || ''}
              onChange={(e) => updateScore(campoNum, 0, e.target.value)}
              className="w-20 p-3 text-2xl font-bold text-center border-2 border-blue-300 rounded-2xl bg-white focus:ring-4 focus:ring-blue-500 focus:border-blue-500 shadow-lg"
              placeholder="6"
            />
            <span className="text-3xl font-black text-gray-700">VS</span>
            <input
              type="number"
              value={scoreData[1] || ''}
              onChange={(e) => updateScore(campoNum, 1, e.target.value)}
              className="w-20 p-3 text-2xl font-bold text-center border-2 border-blue-300 rounded-2xl bg-white focus:ring-4 focus:ring-blue-500 focus:border-blue-500 shadow-lg"
              placeholder="4"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setWinner(campoNum, 0)}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-lg"
            >
              ?? Squadra 1
            </button>
            <button
              onClick={() => setWinner(campoNum, 1)}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-lg"
            >
              ?? Squadra 2
            </button>
          </div>
        </div>

        <div className="text-center mt-4 text-sm text-gray-500 font-mono">
          Score: {scoreData.join('-')} | Vincitore: {winnerTeam !== undefined ? `Squadra ${winnerTeam + 1}` : '---'}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <BackButton />

      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-purple-800 via-pink-800 to-emerald-800 bg-clip-text text-transparent">
          ?? COPPA PADEL 2vs2
        </h1>
        <button
          onClick={saveResults}
          disabled={loading}
          className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '? SALVANDO...' : '?? SALVA RISULTATI'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {renderMatch(ottaviSlot1, '?? OTTAVI CAMPO 1', 1)}
        {renderMatch(ottaviSlot2, '?? OTTAVI CAMPO 2', 2)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {renderMatch(quartiSlot1, '?? QUARTI CAMPO 3', 3)}
        {renderMatch(quartiSlot2, '?? QUARTI CAMPO 4', 4)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderMatch(semiSlot1, '?? SEMIFINALE CAMPO 5', 5)}
            {renderMatch(semiSlot2, '?? SEMIFINALE CAMPO 6', 6)}
          </div>
        </div>
        <div>
          {renderMatch(finaleSlot, '?? GRAN FINALE CAMPO 7', 7)}
        </div>
      </div>
    </div>
  );
}
