import React, { useState, useEffect } from "react";
import { ChevronLeft, Trophy, Users, GripVertical, Edit3, ArrowRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PadelBracket() {
  const navigate = useNavigate();
  const [round, setRound] = useState('ottavi');
  const [players, setPlayers] = useState([
    "Mario Rossi", "Luca Bianchi", "Giulia Verdi", "Sara Nero", 
    "Marco Oro", "Anna Rossi2", "Paolo Verdi2", "Laura Grigi",
    "Antonio Azzurri", "Federica Gialli", "Davide Neri", "Chiara Arancioni",
    "Roberto Blu", "Elena Bianchi2", "Stefano Rossi3", "Martina Bianchi3"
  ]);
  const [bracket, setBracket] = useState({
    ottavi: [
      [[null, null], [null, null]], [[null, null], [null, null]], 
      [[null, null], [null, null]], [[null, null], [null, null]]
    ],
    quarti: [[[null, null], [null, null]], [[null, null], [null, null]]],
    semi: [[[null, null], [null, null]]],
    finale: [[null, null], [null, null]]
  });
  const [results, setResults] = useState({});

  const fields = ["Campo 1", "Campo 2", "Campo 3", "Campo 4"];

  // ✅ AUTO-PROPAGA VINCITORI SQUADRE
  useEffect(() => {
    propagateWinners();
  }, [results]);

  const propagateWinners = () => {
    const newBracket = { ...bracket };
    
    // Ottavi → Quarti
    for (let i = 0; i < 4; i++) {
      const match1 = bracket.ottavi[i];
      const result1 = results[`ottavi_${i}`];
      if (match1[0][0] && match1[0][1] && match1[1][0] && match1[1][1] && result1) {
        const winnerTeam = result1.set1 > result1.set2 ? match1[0] : match1[1];
        newBracket.quarti[Math.floor(i / 2)][i % 2] = winnerTeam;
      }
    }
    
    setBracket(newBracket);
  };

  const onDragStart = (e, player) => {
    e.dataTransfer.setData("player", player);
  };

  const onDrop = (e, round, matchIndex, teamIndex, playerIndex) => {
    e.preventDefault();
    const player = e.dataTransfer.getData("player");
    setBracket(prev => ({
      ...prev,
      [round]: prev[round].map((match, i) => 
        i === matchIndex 
          ? match.map((team, j) => 
              j === teamIndex 
                ? team.map((p, k) => k === playerIndex ? player : p)
                : team
            )
          : match
      )
    }));
    setPlayers(prev => prev.filter(p => p !== player));
  };

  const onDragOver = (e) => e.preventDefault();

  const updateResult = (round, matchIndex, set1, set2) => {
    setResults(prev => ({
      ...prev,
      [`${round}_${matchIndex}`]: { set1: parseInt(set1) || 0, set2: parseInt(set2) || 0 }
    }));
  };

  const rounds = ['ottavi', 'quarti', 'semi', 'finale'];

  return (
    <div className="min-h-screen bg-white py-6">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        
        <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
          ← Indietro
        </button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">🏆 Tabellone Padel 2vs2</h1>
          <div className="flex gap-2 justify-center flex-wrap">
            {rounds.map(r => (
              <button
                key={r}
                onClick={() => setRound(r)}
                className={`px-6 py-2 rounded-lg font-bold ${
                  round === r ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* ISCRITTI */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">👥 Iscritti (Drag)</h2>
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 min-h-96 overflow-y-auto max-h-96">
              {players.map((player, i) => (
                <div
                  key={i}
                  className="bg-white p-4 mb-3 rounded-lg shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing flex items-center gap-3 border-l-4 border-emerald-500"
                  draggable
                  onDragStart={(e) => onDragStart(e, player)}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="font-bold text-lg">{player}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TABELLONE 2vs2 */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">{round.toUpperCase()}</h2>
            <div className="space-y-6">
              {bracket[round].map((matchesGroup, matchIndex) => {
                const resultKey = `${round}_${matchIndex}`;
                const result = results[resultKey] || { set1: 0, set2: 0 };
                return (
                  <div key={matchIndex} className="bg-gray-50 p-6 rounded-xl border hover:shadow-lg">
                    {/* CAMPO */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-emerald-100 rounded-lg">
                      <span className="font-bold text-lg">🏟️ {fields[matchIndex % fields.length]}</span>
                      <span className="font-bold text-lg bg-emerald-600 text-white px-3 py-1 rounded-full">
                        Partita {matchIndex + 1}
                      </span>
                    </div>
                    
                    {/* ✅ SQUADRE 2 GIOCATORI */}
                    <div className="space-y-4 mb-6">
                      {matchesGroup.map((team, teamIndex) => (
                        <div
                          key={teamIndex}
                          className="p-4 border-2 border-dashed rounded-lg min-h-24 flex flex-col gap-2 cursor-pointer hover:border-emerald-400 transition-all"
                          onDragOver={onDragOver}
                        >
                          {team.map((player, playerIndex) => (
                            <div
                              key={playerIndex}
                              className={`p-3 rounded-lg border-2 border-dashed text-center min-h-12 flex items-center justify-center cursor-pointer hover:border-emerald-400 transition-all ${
                                player ? 'bg-white shadow-md border-emerald-500' : 'bg-white/50 border-gray-300'
                              }`}
                              onDrop={(e) => onDrop(e, round, matchIndex, teamIndex, playerIndex)}
                            >
                              {player ? (
                                <div className="font-bold text-sm text-emerald-700 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {player}
                                </div>
                              ) : (
                                <Users className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    
                    {/* RISULTATI */}
                    <div className="flex items-center justify-center gap-6 p-4 bg-white rounded-xl shadow-sm mb-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="9"
                          value={result.set1}
                          onChange={(e) => updateResult(round, matchIndex, e.target.value, result.set2)}
                          className="w-16 p-3 text-2xl font-black text-center border-2 border-gray-300 rounded-lg focus:ring-4 ring-emerald-500 focus:border-emerald-500"
                        />
                        <span className="text-xl font-bold">-</span>
                        <input
                          type="number"
                          min="0"
                          max="9"
                          value={result.set2}
                          onChange={(e) => updateResult(round, matchIndex, result.set1, e.target.value)}
                          className="w-16 p-3 text-2xl font-black text-center border-2 border-gray-300 rounded-lg focus:ring-4 ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <Edit3 className="w-6 h-6 text-emerald-600" />
                    </div>
                    
                    {/* VINCITORE */}
                    {result.set1 > 0 && result.set2 > 0 && (
                      <div className="text-center p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-white font-bold shadow-lg">
                        <div className="text-2xl mb-2">🏆 VINCITORE</div>
                        <div className="text-xl">
                          {result.set1 > result.set2 ? matchesGroup[0][0] || matchesGroup[0][1] : matchesGroup[1][0] || matchesGroup[1][1]}
                        </div>
                        <ArrowRight className="w-8 h-8 mx-auto mt-2 animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="px-12 py-4 bg-emerald-600 text-white font-bold text-xl rounded-2xl hover:bg-emerald-700 shadow-xl hover:shadow-2xl transition-all">
            💾 SALVA TABELLONE
          </button>
        </div>
      </div>
    </div>
  );
}
