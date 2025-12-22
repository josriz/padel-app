import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TabelloneGreen5 = () => {
  const [gironi, setGironi] = useState({
    A: {
      squadre: ['Zagaria-Prisciandaro', 'Smaldino-Stanzione', 'Canonico-Cillo', 'BoveR-Romita'],
      partite: [
        { campo: 2, ora: '9:30', t1: 'Zagaria-Prisciandaro', t2: 'BoveR-Romita', score: '', vincente: null },
        { campo: 3, ora: '9:30', t1: 'Smaldino-Stanzione', t2: 'Canonico-Cillo', score: '', vincente: null },
        { campo: 2, ora: '10:00', t1: 'Zagaria-Prisciandaro', t2: 'Canonico-Cillo', score: '', vincente: null },
        { campo: 3, ora: '10:00', t1: 'Smaldino-Stanzione', t2: 'BoveR-Romita', score: '', vincente: null },
        { campo: 2, ora: '10:30', t1: 'Zagaria-Prisciandaro', t2: 'Smaldino-Stanzione', score: '', vincente: null },
        { campo: 3, ora: '10:30', t1: 'Canonico-Cillo', t2: 'BoveR-Romita', score: '', vincente: null }
      ],
      punti: { 'Zagaria-Prisciandaro': [0,0,0,0], 'Smaldino-Stanzione': [0,0,0,0], 'Canonico-Cillo': [0,0,0,0], 'BoveR-Romita': [0,0,0,0] },
      classifica: []
    },
    B: {
      squadre: ['Marzano-Saracino', 'Scavo-DeVito', 'Avellino-Ferrari', 'BoveN-Carbonara'],
      partite: [
        { campo: 4, ora: '9:30', t1: 'Marzano-Saracino', t2: 'Avellino-Ferrari', score: '', vincente: null },
        { campo: 5, ora: '9:30', t1: 'Scavo-DeVito', t2: 'BoveN-Carbonara', score: '', vincente: null },
        { campo: 4, ora: '10:00', t1: 'Scavo-DeVito', t2: 'Avellino-Ferrari', score: '', vincente: null },
        { campo: 5, ora: '10:00', t1: 'Marzano-Saracino', t2: 'BoveN-Carbonara', score: '', vincente: null },
        { campo: 4, ora: '10:30', t1: 'BoveN-Carbonara', t2: 'Avellino-Ferrari', score: '', vincente: null },
        { campo: 5, ora: '10:30', t1: 'Marzano-Saracino', t2: 'Scavo-DeVito', score: '', vincente: null }
      ],
      punti: { 'Marzano-Saracino': [0,0,0,0], 'Scavo-DeVito': [0,0,0,0], 'Avellino-Ferrari': [0,0,0,0], 'BoveN-Carbonara': [0,0,0,0] },
      classifica: []
    },
    C: {
      squadre: ['Romano-Corchia', 'Francioso-Falba', 'Cassano-Caiati', 'Ricco-Indiveri'],
      partite: [
        { campo: 12, ora: '9:30', t1: 'Romano-Corchia', t2: 'Cassano-Caiati', score: '', vincente: null },
        { campo: 13, ora: '9:30', t1: 'Francioso-Falba', t2: 'Ricco-Indiveri', score: '', vincente: null },
        { campo: 12, ora: '10:00', t1: 'Romano-Corchia', t2: 'Francioso-Falba', score: '', vincente: null },
        { campo: 13, ora: '10:00', t1: 'Ricco-Indiveri', t2: 'Cassano-Caiati', score: '', vincente: null },
        { campo: 12, ora: '10:30', t1: 'Romano-Corchia', t2: 'Ricco-Indiveri', score: '', vincente: null },
        { campo: 13, ora: '10:30', t1: 'Francioso-Falba', t2: 'Cassano-Caiati', score: '', vincente: null }
      ],
      punti: { 'Romano-Corchia': [0,0,0,0], 'Francioso-Falba': [0,0,0,0], 'Cassano-Caiati': [0,0,0,0], 'Ricco-Indiveri': [0,0,0,0] },
      classifica: []
    },
    D: {
      squadre: ['Mastromauro-Pierno', 'Quaranta-Rizzi', 'BoveM-Borracci', 'Crisci-Santantonio'],
      partite: [
        { campo: 11, ora: '9:30', t1: 'Mastromauro-Pierno', t2: 'BoveM-Borracci', score: '', vincente: null },
        { campo: 14, ora: '9:30', t1: 'Quaranta-Rizzi', t2: 'Crisci-Santantonio', score: '', vincente: null },
        { campo: 11, ora: '10:00', t1: 'Mastromauro-Pierno', t2: 'Quaranta-Rizzi', score: '', vincente: null },
        { campo: 14, ora: '10:00', t1: 'Crisci-Santantonio', t2: 'BoveM-Borracci', score: '', vincente: null },
        { campo: 11, ora: '10:30', t1: 'Mastromauro-Pierno', t2: 'Crisci-Santantonio', score: '', vincente: null },
        { campo: 14, ora: '10:30', t1: 'Quaranta-Rizzi', t2: 'BoveM-Borracci', score: '', vincente: null }
      ],
      punti: { 'Mastromauro-Pierno': [0,0,0,0], 'Quaranta-Rizzi': [0,0,0,0], 'BoveM-Borracci': [0,0,0,0], 'Crisci-Santantonio': [0,0,0,0] },
      classifica: []
    }
  });

  const [bracket, setBracket] = useState({ quartiTop: [], quartiFlop: [], semisTop: [], semisFlop: [] });

  // Calcola punti da risultati (3/1/0 per vittoria/dis差/pace)
  const calcolaPunti = (gironeKey) => {
    const girone = gironi[gironeKey];
    const nuoviPunti = { ...girone.punti };
    
    girone.partite.forEach(partita => {
      if (partita.score) {
        const [s1, s2] = partita.score.split('-').map(Number);
        if (s1 > s2) {
          nuoviPunti[partita.t1][3] += 3;
        } else if (s1 === s2) {
          nuoviPunti[partita.t1][3] += 1;
          nuoviPunti[partita.t2][3] += 1;
        } else {
          nuoviPunti[partita.t2][3] += 3;
        }
      }
    });
    
    // Ordina classifica
    const classifica = Object.entries(nuoviPunti)
      .sort((a,b) => b[1][3] - a[1][3])
      .map(([squadra, pts], i) => ({ squadra, pts: pts[3], pos: i+1 }));
    
    setGironi(prev => ({
      ...prev,
      [gironeKey]: { ...prev[gironeKey], punti: nuoviPunti, classifica }
    }));
  };

  // Aggiorna punteggio partita
  const aggiornaPunteggio = (gironeKey, partitaIdx, score) => {
    setGironi(prev => ({
      ...prev,
      [gironeKey]: {
        ...prev[gironeKey],
        partite: prev[gironeKey].partite.map((p, i) => 
          i === partitaIdx ? { ...p, score } : p
        )
      }
    }));
  };

  // Genera bracket automaticamente
  const generaBracket = () => {
    const top = {
      quartiTop: [
        [gironi.A.classifica[0]?.squadra, gironi.B.classifica[1]?.squadra], // 1A vs 2B
        [gironi.B.classifica[0]?.squadra, gironi.A.classifica[1]?.squadra], // 1B vs 2A
        [gironi.C.classifica[0]?.squadra, gironi.D.classifica[1]?.squadra], // 1C vs 2D
        [gironi.D.classifica[0]?.squadra, gironi.C.classifica[1]?.squadra]  // 1D vs 2C
      ],
      quartiFlop: [
        [gironi.A.classifica[2]?.squadra, gironi.B.classifica[3]?.squadra], // 3A vs 4B
        [gironi.B.classifica[2]?.squadra, gironi.A.classifica[3]?.squadra], // 3B vs 4A
        [gironi.C.classifica[2]?.squadra, gironi.D.classifica[3]?.squadra], // 3C vs 4D
        [gironi.D.classifica[2]?.squadra, gironi.C.classifica[3]?.squadra]  // 3D vs 4C
      ]
    };
    setBracket(top);
  };

  useEffect(() => {
    Object.keys(gironi).forEach(calcolaPunti);
    generaBracket();
  }, [gironi]);

  return (
    <div className="tabellone-green5 p-6 bg-gradient-to-br from-emerald-50 to-lime-50 min-h-screen">
      <h1 className="text-4xl font-black mb-8 text-center text-emerald-800 tracking-wide">
        5° Torneo GREEN 2024
      </h1>

      {/* GIRONI */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        {Object.entries(gironi).map(([key, girone]) => (
          <div key={key} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-4 border-emerald-200">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl">
              GIRONE {key}
            </h2>
            
            {/* Partite */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {girone.partite.map((partita, i) => (
                <div key={i} className="border-2 border-gray-200 p-4 rounded-xl hover:shadow-md transition-all">
                  <div className="text-xs font-semibold text-gray-600 mb-2">
                    Campo {partita.campo} - {partita.ora}
                  </div>
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="w-44 font-semibold bg-gray-100 px-3 py-1 rounded">{partita.t1}</span>
                    <span>VS</span>
                    <span className="w-44 font-semibold bg-gray-100 px-3 py-1 rounded">{partita.t2}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <input 
                      className="w-24 p-3 border-2 border-gray-300 rounded-xl text-center text-xl font-mono font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                      placeholder="6-4"
                      value={partita.score}
                      onChange={(e) => aggiornaPunteggio(key, i, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Classifica */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-center">CLASSIFICA GIRONE {key}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-white/50">
                    <th className="p-2">Squadra</th>
                    <th className="p-2">P1</th>
                    <th className="p-2">P2</th>
                    <th className="p-2">P3</th>
                    <th className="p-2 font-bold">TOT</th>
                    <th className="p-2">POS</th>
                  </tr>
                </thead>
                <tbody>
                  {girone.classifica.map((row, i) => (
                    <tr key={i} className={`p-3 ${i === 0 ? 'bg-yellow-300/30' : i === 1 ? 'bg-blue-300/20' : i === 2 ? 'bg-orange-300/20' : 'bg-red-300/20'}`}>
                      <td className="font-semibold">{row.squadra}</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-center font-bold text-xl">{row.pts}</td>
                      <td className="text-center font-bold text-lg">{row.pos}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* BRACKET */}
      <div className="grid grid-cols-2 gap-12 mb-16">
        {/* QUARTI TOP */}
        <div>
          <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl shadow-2xl">
            QUARTI TOP
          </h3>
          <div className="space-y-6">
            {bracket.quartiTop.map((match, i) => (
              <div key={i} className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white p-8 rounded-2xl shadow-xl border-4 border-blue-200">
                <div className="text-center font-bold text-xl mb-6">Campo {i === 0 ? 2 : i === 1 ? 3 : i === 2 ? 4 : 5} Scoperto</div>
                <div className="space-y-4 text-center">
                  <div className="bg-white/20 p-4 rounded-xl font-bold text-lg">{match[0]}</div>
                  <div className="text-3xl font-black">VS</div>
                  <div className="bg-white/20 p-4 rounded-xl font-bold text-lg">{match[1]}</div>
                  <input className="w-32 mx-auto p-3 mt-6 border-2 border-white rounded-xl text-center text-xl font-mono bg-white text-black" placeholder="Risultato" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUARTI FLOP */}
        <div>
          <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl shadow-2xl">
            QUARTI FLOP
          </h3>
          <div className="space-y-6">
            {bracket.quartiFlop.map((match, i) => (
              <div key={i} className="bg-gradient-to-r from-orange-400 to-red-400 text-white p-8 rounded-2xl shadow-xl border-4 border-orange-200">
                <div className="text-center font-bold text-xl mb-6">Campo {i === 0 ? 12 : i === 1 ? 13 : i === 2 ? 14 : 11}{i === 3 ? ' Coperto' : ' Scoperto'}</div>
                <div className="space-y-4 text-center">
                  <div className="bg-white/20 p-4 rounded-xl font-bold text-lg">{match[0]}</div>
                  <div className="text-3xl font-black">VS</div>
                  <div className="bg-white/20 p-4 rounded-xl font-bold text-lg">{match[1]}</div>
                  <input className="w-32 mx-auto p-3 mt-6 border-2 border-white rounded-xl text-center text-xl font-mono bg-white text-black" placeholder="Risultato" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NOTE CAMPI LIBERI */}
      <div className="bg-yellow-100 border-4 border-yellow-400 p-6 rounded-2xl text-center font-bold text-lg">
        <div>📋 CAMPI LIBERI:</div>
        <div className="mt-2 text-sm grid grid-cols-2 gap-4">
          <div>Campo 11 sino alle 12:30</div>
          <div>Campo 3 sino alle 12:30</div>
          <div>Campi 2-5-12 liberi dalle 8:30</div>
        </div>
      </div>
    </div>
  );
};

export default TabelloneGreen5;
