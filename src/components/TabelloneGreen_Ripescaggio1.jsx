import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TabelloneGreen4 = () => {
  const [campi, setCampi] = useState({
    6: {
      partite: {
        A: { t1: 'Jose Rizzi / Bove Mimmo', t2: '', score: '', vincente: null, perdente: null },
        B: { t1: 'Ricco / Bove Nico', t2: '', score: '', vincente: null },
        C: { t1: '', t2: '', score: '', vincente: null }
      },
      classifica: { primo: null, secondo: null }
    },
    7: {
      partite: {
        A: { t1: 'Quaranta/Francioso', t2: '', score: '', vincente: null, perdente: null },
        B: { t1: 'Stanzione/Carbonara', t2: '', score: '', vincente: null },
        C: { t1: '', t2: '', score: '', vincente: null }
      },
      classifica: { primo: null, secondo: null }
    },
    10: {
      partite: {
        A: { t1: 'Zagaria/Crisci', t2: '', score: '', vincente: null, perdente: null },
        B: { t1: 'Falba/Romita', t2: '', score: '', vincente: null },
        C: { t1: '', t2: '', score: '', vincente: null }
      },
      classifica: { primo: null, secondo: null }
    },
    11: {
      partite: {
        A: { t1: 'Lattarulo/Cillo', t2: '', score: '', vincente: null, perdente: null },
        B: { t1: 'Corchia/Bove Roby', t2: '', score: '', vincente: null },
        C: { t1: '', t2: '', score: '', vincente: null }
      },
      classifica: { primo: null, secondo: null }
    }
  });

  const [quarti, setQuarti] = useState([]);

  // Calcola logica campo
  const calcolaCampo = (campoData) => {
    const { A, B, C } = campoData.partite;
    
    // C: Vincente A vs Vincente B
    if (A.vincente && B.vincente && C.score) {
      C.vincente = parseInt(C.score.split('-')[0]) > parseInt(C.score.split('-')[1]) 
        ? A.vincente : B.vincente;
    }
    
    // Ripescaggio: Perdente A vs Perdente C → 2°
    if (A.perdente && C.score && !C.vincente) {
      campoData.classifica.primo = C.vincente;
      campoData.classifica.secondo = A.perdente; // Ripescato
    }
  };

  useEffect(() => {
    // Ricalcola tutti i campi e quarti
    const nuoviCampi = { ...campi };
    Object.keys(nuoviCampi).forEach(campoId => {
      calcolaCampo(nuoviCampi[campoId]);
    });
    
    // Quarti: 1° Campo6 vs 2° Campo7 | 1° Campo11 vs 2° Campo10
    const quartiNuovi = [
      [nuoviCampi[6].classifica.primo, nuoviCampi[7].classifica.secondo],
      [nuoviCampi[11].classifica.primo, nuoviCampi[10].classifica.secondo]
    ];
    setQuarti(quartiNuovi);
    setCampi(nuoviCampi);
  }, [campi]);

  const aggiornaPunteggio = (campoId, partita, score) => {
    setCampi(prev => {
      const nuovo = { ...prev };
      nuovo[campoId].partite[partita].score = score;
      
      // Determina vincente/perdente
      if (score) {
        const [s1, s2] = score.split('-').map(Number);
        nuovo[campoId].partite[partita].vincente = s1 > s2 ? 
          nuovo[campoId].partite[partita].t1 : nuovo[campoId].partite[partita].t2;
        nuovo[campoId].partite[partita].perdente = s1 > s2 ? 
          nuovo[campoId].partite[partita].t2 : nuovo[campoId].partite[partita].t1;
      }
      return nuovo;
    });
  };

  return (
    <div className="tabellone-green4 p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-green-800">
        4° Torneo GREEN 2024 - Qualificazioni ore 9:30
      </h2>

      {/* Campi */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        {Object.entries(campi).map(([id, campo]) => (
          <div key={id} className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-200">
            <h3 className="text-xl font-bold mb-4 text-center bg-green-100 p-2 rounded">
              CAMPO {id}
            </h3>
            
            <div className="space-y-3 mb-6">
              {/* Partita A */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-48 font-semibold">A) {campo.partite.A.t1}</div>
                <div className="flex-1 text-center">
                  <input 
                    className="w-20 p-2 border rounded text-center font-mono"
                    placeholder="6-4"
                    value={campo.partite.A.score}
                    onChange={(e) => aggiornaPunteggio(id, 'A', e.target.value)}
                  />
                  {campo.partite.A.vincente && (
                    <div className="text-green-600 font-bold mt-1">✓ {campo.partite.A.vincente}</div>
                  )}
                </div>
              </div>

              {/* Partita B */}
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-48 font-semibold">B) {campo.partite.B.t1}</div>
                <div className="flex-1 text-center">
                  <input 
                    className="w-20 p-2 border rounded text-center font-mono"
                    placeholder="6-4"
                    value={campo.partite.B.score}
                    onChange={(e) => aggiornaPunteggio(id, 'B', e.target.value)}
                  />
                  {campo.partite.B.vincente && (
                    <div className="text-green-600 font-bold mt-1">✓ {campo.partite.B.vincente}</div>
                  )}
                </div>
              </div>

              {/* Partita C: Vincente A vs B */}
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg border-2 border-dashed">
                <div className="w-48 font-semibold">
                  C) {campo.partite.A.vincente} vs {campo.partite.B.vincente}
                </div>
                <div className="flex-1 text-center">
                  <input 
                    className="w-20 p-2 border rounded text-center font-mono bg-yellow-100"
                    placeholder="6-3"
                    value={campo.partite.C.score}
                    onChange={(e) => aggiornaPunteggio(id, 'C', e.target.value)}
                  />
                  {campo.partite.C.vincente && (
                    <div className="text-green-600 font-bold mt-1 text-lg">🏆 1° CAMPO</div>
                  )}
                </div>
              </div>
            </div>

            {/* Classifica Campo */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="font-bold text-lg">CLASSIFICA</div>
              {campo.classifica.primo && (
                <div className="flex items-center mt-2">
                  <span className="w-6 font-bold text-yellow-300">1°</span>
                  <span className="ml-2">{campo.classifica.primo}</span>
                </div>
              )}
              {campo.classifica.secondo && (
                <div className="flex items-center mt-1 text-sm opacity-90">
                  <span className="w-6 font-bold text-gray-200">2°</span>
                  <span className="ml-2">(Ripescaggio) {campo.classifica.secondo}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quarti */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-center">QUARTI</h3>
        <div className="grid grid-cols-2 gap-6">
          {quarti.map((match, i) => (
            <div key={i} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-2xl">
              <div className="text-center font-bold text-lg mb-4">
                Quarto {i+1}
              </div>
              <div className="space-y-3 text-center">
                <div className="bg-white/20 p-3 rounded-lg font-semibold">
                  {match[0]}
                </div>
                <div className="text-2xl font-bold">VS</div>
                <div className="bg-white/20 p-3 rounded-lg font-semibold">
                  {match[1]}
                </div>
                <input 
                  className="w-24 mx-auto p-2 mt-4 border rounded-lg text-center font-mono bg-white text-black"
                  placeholder="Risultato"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabelloneGreen4;
