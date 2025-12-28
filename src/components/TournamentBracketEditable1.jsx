// src/components/TournamentBracketEditable.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthProvider';
import PageContainer from './PageContainer';

export default function TournamentBracketEditable({ torneoId, bracketSlots }) {
  const { user, isAdmin } = useAuth();
  const [torneo, setTorneo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState({});
  const [localSlots, setLocalSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTorneo();
    fetchParticipants();
    if (bracketSlots) setLocalSlots(bracketSlots);
    if (torneoId) loadResults();
  }, [torneoId, bracketSlots]);

  const fetchTorneo = async () => {
    const { data } = await supabase.from('tournaments').select('*').eq('id', torneoId).single();
    setTorneo(data);
  };

  const fetchParticipants = async () => {
    const { data } = await supabase.from('tournament_participants').select('*').eq('torneo_id', torneoId);
    setParticipants(data || []);
    setLoading(false);
  };

  const handleIscrizione = async () => {
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

  const loadResults = async () => {
    try {
      const { data } = await supabase
        .from('tournament_results')
        .select('*')
        .eq('tournament_id', torneoId)
        .single();

      if (data) {
        setResults(data.results || {});
        if (data.bracket_slots) setLocalSlots(data.bracket_slots);
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
      return { ...prev, [matchKey]: { ...current, score: newScore } };
    });
  };

  const passWinners = () => {
    const newSlots = [...localSlots];
    const ott1 = localSlots.slice(0, 4);
    if (results.campo1?.winner === 0 && ott1[0] && ott1[1]) { newSlots[8] = ott1[0]; newSlots[9] = ott1[1]; }
    if (results.campo1?.winner === 1 && ott1[2] && ott1[3]) { newSlots[8] = ott1[2]; newSlots[9] = ott1[3]; }
    const ott2 = localSlots.slice(4, 8);
    if (results.campo2?.winner === 0 && ott2[0] && ott2[1]) { newSlots[12] = ott2[0]; newSlots[13] = ott2[1]; }
    if (results.campo2?.winner === 1 && ott2[2] && ott2[3]) { newSlots[12] = ott2[2]; newSlots[13] = ott2[3]; }
    setLocalSlots(newSlots);
  };

  const setWinner = (campoNum, winningTeam) => {
    const matchKey = `campo${campoNum}`;
    setResults({
      ...results,
      [matchKey]: {
        score: results[matchKey]?.score || ['', ''],
        winner: winningTeam,
        completed: true
      }
    });
    passWinners();
  };

  const saveResults = async () => {
    setSaving(true);
    try {
      await supabase.from('tournament_results').upsert({
        tournament_id: torneoId,
        results: results,
        bracket_slots: localSlots
      });
      alert('? SALVATO!');
    } catch (err) {
      alert('? ' + err.message);
    }
    setSaving(false);
  };

  if (loading) return <PageContainer title="Caricamento..."><div>? Caricamento torneo...</div></PageContainer>;

  // Slot slices
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
      <div className="p-4 bg-white rounded-xl shadow-md mb-4">
        <div className="text-center font-bold mb-2">{title} (Campo {campoNum})</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {slots.map((slot, i) => {
            const teamIndex = Math.floor(i / 2);
            const isWinner = winnerTeam === teamIndex;
            return (
              <div key={i} className={`p-2 rounded border ${isWinner ? 'bg-orange-400 text-white font-bold' : slot ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <div className="text-center">{slot ? `${slot.nome} ${slot.cognome}` : '---'}</div>
                <input
                  type="number"
                  value={scoreData[i % 2] || ''}
                  onChange={e => updateScore(campoNum, i % 2, e.target.value)}
                  className="w-full mt-1 p-1 text-center rounded border"
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setWinner(campoNum, 0)} className="flex-1 py-1 bg-green-500 text-white rounded">Vince Squadra 1</button>
          <button onClick={() => setWinner(campoNum, 1)} className="flex-1 py-1 bg-red-500 text-white rounded">Vince Squadra 2</button>
        </div>
      </div>
    );
  };

  return (
    <PageContainer title={torneo?.name}>
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">Dettagli Torneo</h2>
        <p>?? Data inizio: {torneo?.data_inizio}</p>
        <p>?? Prezzo: €{torneo?.prezzo}</p>
        <p>?? Max giocatori: {torneo?.max_players}</p>
        <p>Status: {torneo?.status}</p>

        {torneo?.status === 'pianificato' && user && !participants.find(p => p.user_id === user.id) && (
          <button onClick={handleIscrizione} className="mt-4 px-6 py-2 bg-green-500 text-white rounded-xl">Iscriviti</button>
        )}

        {participants.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold mb-2">Iscritti:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {participants.map(p => (
                <div key={p.id} className="border p-2 rounded">{p.nome} - {p.email || 'Email non disponibile'}</div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold mt-6 mb-2">Tabellone</h3>
        {renderMatch(ottaviSlot1, 'Ottavi 1', 1)}
        {renderMatch(ottaviSlot2, 'Ottavi 2', 2)}
        {renderMatch(quartiSlot1, 'Quarti 1', 3)}
        {renderMatch(quartiSlot2, 'Quarti 2', 4)}
        {renderMatch(semiSlot1, 'Semifinale 1', 5)}
        {renderMatch(semiSlot2, 'Semifinale 2', 6)}
        {renderMatch(finaleSlot, 'Finale', 7)}

        <button onClick={saveResults} disabled={saving} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl">
          {saving ? 'Salvando...' : 'Salva Risultati'}
        </button>
      </div>
    </PageContainer>
  );
}
