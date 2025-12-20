import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const PadelMatch = ({ match, players, tournamentId, onUpdate }) => {
  const [score1, setScore1] = useState(match.score1 || '');
  const [score2, setScore2] = useState(match.score2 || '');

  const getPlayerName = (playerId) => {
    if (!playerId) return '---';
    const player = players?.find(p => 
      p.player_id === playerId || 
      p.id === playerId || 
      p.player?.id === playerId
    );
    return player?.player?.name || 
           player?.name || 
           player?.display_name || 
           `ID: ${playerId?.slice(-6)}`;
  };

  const player1Name = getPlayerName(match.player1_id);
  const player2Name = getPlayerName(match.player2_id);

  const updateScore = async () => {
    const updatedMatch = { 
      ...match, 
      score1, 
      score2,
      updated_at: new Date().toISOString()
    };

    // Salva su Supabase
    const { error } = await supabase
      .from('padel_brackets')
      .upsert(updatedMatch);

    if (onUpdate) onUpdate(updatedMatch);
    if (!error) console.log("✅ Match salvato:", updatedMatch.id);
  };

  return (
    <div className="match bg-white border-2 border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-4">
      <div className="flex justify-between items-center mb-3 pb-2 border-b">
        <span className="font-semibold text-gray-700">Match {match.match_number}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="font-bold text-lg mb-2 truncate max-w-[120px] mx-auto bg-gradient-to-r from-blue-400 to-blue-600 text-white px-3 py-1 rounded-full text-sm">
            {player1Name}
          </div>
          <input
            type="number"
            min="0"
            max="99"
            placeholder="0"
            value={score1}
            onChange={(e) => setScore1(e.target.value)}
            className="w-16 h-12 text-2xl font-bold border-2 border-gray-300 rounded-lg text-center focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            onBlur={updateScore}
          />
        </div>
        
        <div className="text-center">
          <div className="font-bold text-lg mb-2 truncate max-w-[120px] mx-auto bg-gradient-to-r from-red-400 to-red-600 text-white px-3 py-1 rounded-full text-sm">
            {player2Name}
          </div>
          <input
            type="number"
            min="0"
            max="99"
            placeholder="0"
            value={score2}
            onChange={(e) => setScore2(e.target.value)}
            className="w-16 h-12 text-2xl font-bold border-2 border-gray-300 rounded-lg text-center focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            onBlur={updateScore}
          />
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        {score1 && score2 && `${score1}-${score2}`}
      </div>
    </div>
  );
};

export default PadelMatch;
