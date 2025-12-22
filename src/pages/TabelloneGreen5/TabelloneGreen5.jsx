import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TabelloneGreen5 = () => {
  const [gironi, setGironi] = useState({ /* TUO STATE COMPLETO A/B/C/D */ });
const [bracket, setBracket] = useState({ quartiTop: [], quartiFlop: [] });

const aggiornaPunteggio = (gironeKey, partitaIdx, score) => {
  setGironi(prev => {
    const nuovoGirone = {
      ...prev[gironeKey],
      partite: prev[gironeKey].partite.map((p, i) => i === partitaIdx ? { ...p, score } : p
    };
    
    const nuoviPunti = { ...nuovoGirone.punti };
    nuovoGirone.partite.forEach(p => {
      if (p.score) {
        const [s1, s2] = p.score.split('-').map(Number);
        if (!isNaN(s1) && !isNaN(s2)) {
          if (s1 > s2) nuoviPunti[p.t1][3] += 3;
          else if (s1 === s2) { 
            nuoviPunti[p.t1][3] += 1; 
            nuoviPunti[p.t2][3] += 1; 
          }
          else nuoviPunti[p.t2][3] += 3;
        }
      }
    });
    
    nuovoGirone.punti = nuoviPunti;
    nuovoGirone.classifica = Object.entries(nuoviPunti)
      .sort((a,b) => b[1][3] - a[1][3])
      .map(([squadra,pts],i) => ({squadra,pts:pts[3],pos:i+1}));
    
    return { ...prev, [gironeKey]: nuovoGirone };
  });
  
  // ✅ Bracket DOPO setGironi
  setTimeout(() => {
    setBracket({
      quartiTop: [
        [gironi[gironeKey]?.classifica?.[0]?.squadra||'1A', gironi.B?.classifica?.[1]?.squadra||'2B'],
        [gironi.B?.classifica?.[0]?.squadra||'1B', gironi.A?.classifica?.[1]?.squadra||'2A'],
        [gironi.C?.classifica?.[0]?.squadra||'1C', gironi.D?.classifica?.[1]?.squadra||'2D'],
        [gironi.D?.classifica?.[0]?.squadra||'1D', gironi.C?.classifica?.[1]?.squadra||'2C']
      ],
      quartiFlop: [
        [gironi.A?.classifica?.[2]?.squadra||'3A', gironi.B?.classifica?.[3]?.squadra||'4B'],
        [gironi.B?.classifica?.[2]?.squadra||'3B', gironi.A?.classifica?.[3]?.squadra||'4A'],
        [gironi.C?.classifica?.[2]?.squadra||'3C', gironi.D?.classifica?.[3]?.squadra||'4D'],
        [gironi.D?.classifica?.[2]?.squadra||'3D', gironi.C?.classifica?.[3]?.squadra||'4C']
      ]
    });
  }, 0);
};

useEffect(() => {
  const nuoviGironi = { ...gironi };
  Object.keys(nuoviGironi).forEach(key => {
    nuoviGironi[key].classifica = nuoviGironi[key].squadre.map((s,i) => ({
      squadra:s, pts:0, pos:i+1
    }));
  });
  setGironi(nuoviGironi);
}, []);


  return ( /* TUO RETURN COMPLETO */ );
};

export default TabelloneGreen5;
