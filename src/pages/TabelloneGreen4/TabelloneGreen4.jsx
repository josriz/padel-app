import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TabelloneGreen2024 = () => {
  const [gironi, setGironi] = useState({
    A: { 
      squadre: ['Zagaria-Prisciandaro', 'Smaldino-Stanzione', 'Canonico-Cillo', 'BoveR-Romita'], 
      partite: [{1vs2:'', 2vs3:'', 1vs3:'', 2vs4:''}], 
      classifica: [] 
    },
    B: { 
      squadre: ['Marzano-Saracino', 'Lattarulo-DeVito', 'Avellino-Ferrari', 'BoveN-Carbonara'], 
      partite: [{1vs2:'', 2vs3:'', 1vs4:'', 3vs2:''}], 
      classifica: [] 
    },
    C: { 
      squadre: ['Squadra C1', 'Squadra C2', 'Squadra C3', 'Squadra C4'], 
      partite: [{1vs2:'', 2vs3:'', 1vs3:'', 2vs4:''}], 
      classifica: [] 
    },
    D: { 
      squadre: ['Squadra D1', 'Squadra D2', 'Squadra D3', 'Squadra D4'], 
      partite: [{1vs2:'', 2vs3:'', 1vs4:'', 3vs2:''}], 
      classifica: [] 
    }
  });
  
  const [risultati, setRisultati] = useState({ 
    quartiTop: [], 
    quartiFlop: [], 
    semi: [], 
    finale: '' 
  });

  // Calcola classifica girone (punti: 3 vittoria, 1 pareggio, 0 sconfitta)
  const calcolaClassifica = (girone) => {
    const pts = {};
    girone.squadre.forEach(squadra => {
      pts[squadra] = { v: 0, p: 0, s: 0, pt: 0, df: 0 };
    });

    // Simula logica punti dalle partite (da implementare con risultati reali)
    Object.keys(girone.partite[0]).forEach(partita => {
      const score = girone.partite[0][partita];
      if (score) {
        const [s1, s2] = score.split('-').map(Number);
        if (s1 > s2) pts[girone.squadre[0]] = { ...pts[girone.squadre[0]], v: 1, pt: 3 };
        else if (s2 > s1) pts[girone.squadre[1]] = { ...pts[girone.squadre[1]], v: 1, pt: 3 };
        else {
          pts[girone.squadre[0]].p++;
          pts[girone.squadre[1]].p++;
          pts[girone.squadre[0]].pt++;
          pts[girone.squadre[1]].pt++;
        }
      }
    });

    return Object.entries(pts)
      .sort((a, b) => b[1].pt - a[1].pt || b[1].df - a[1].df)
      .map(([squadra, stats], i) => ({ squadra, pos: i+1, ...stats }));
  };

  useEffect(() => {
    const fetchDati = async () => {
      try {
        const { data } = await supabase.from('partite_green2024').select('*');
        if (data) {
          // Popola gironi da Supabase (esempio)
          console.log('Dati caricati:', data);
        }
      } catch (error) {
        console.error('Errore fetch:', error);
      }
    };
    fetchDati();
  }, []);

  useEffect(() => {
    const nuoviGironi = { ...gironi };
    Object.keys(nuoviGironi).forEach(key => {
      nuoviGironi[key].classifica = calcolaClassifica(nuoviGironi[key]);
    });
    setGironi(nuoviGironi);

    // Auto-avanzamento quarti
    const topA1 = nuoviGironi.A.classifica[0]?.squadra;
    const topB2 = nuoviGironi.B.classifica[1]?.squadra;
    const topC1 = nuoviGironi.C.classifica[0]?.squadra;
    const topD2 = nuoviGironi.D.classifica[1]?.squadra;

    setRisultati(prev => ({ 
      ...prev, 
      quartiTop: [[topA1, topB2], [topC1, topD2]],
      quartiFlop: [
        [nuoviGironi.A.classifica[3]?.squadra, nuoviGironi.B.classifica[2]?.squadra],
        [nuoviGironi.C.classifica[3]?.squadra, nuoviGironi.D.classifica[2]?.squadra]
      ]
    }));
  }, [gironi]);

  const aggiornaPunteggio = (girone, partitaIdx, score) => {
    setGironi(prev => {
      const nuovo = { ...prev };
      const partitaKey = Object.keys(nuovo[girone].partite[0])[partitaIdx];
      nuovo[girone].partite[0][partitaKey] = score;
      
      // Salva su Supabase
      supabase.from('partite_green2024').upsert({
        girone,
        partita: partitaKey,
        score,
        updated_at: new Date().toISOString()
      });
      
      return nuovo;
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
      padding: '2rem',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* HEADER SERIE A */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2rem',
          background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
          padding: '2.5rem 4rem',
          borderRadius: '50px',
          boxShadow: '0 25px 50px -12px rgba(251, 191, 36, 0.4)'
        }}>
          <div style={{
            width: '5rem', height: '5rem',
            background: 'rgba(255,255,255,0.2)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
          }}>🏆</div>
          <div>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900,
              background: 'linear-gradient(45deg, #ffffff, #fef3c7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              margin: 0, letterSpacing: '-0.03em'
            }}>5° TORNEO GREEN 2024</h1>
            <p style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', color: '#fef3c7',
              margin: '0.5rem 0 0 0', fontWeight: 600, letterSpacing: '0.05em'
            }}>GIRONI ALLITALIANA - LIVE</p>
          </div>
        </div>
      </div>

      {/* GIRONI - 2x2 GRID */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '2.5rem', marginBottom: '4rem', maxWidth: '1400px', margin: '0 auto 4rem auto'
      }}>
        {Object.entries(gironi).map(([key, g]) => (
          <div key={key} style={{
            background: 'rgba(15,23,42,0.9)', border: '3px solid #3b82f6',
            borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Header Girone */}
            <div style={{
              background: `linear-gradient(90deg, ${key === 'A' ? '#10b981' : key === 'B' ? '#3b82f6' : '#fbbf24' : '#ef4444'}, ${key === 'A' ? '#059669' : key === 'B' ? '#1d4ed8' : '#f59e0b' : '#dc2626'})`,
              padding: '1.5rem 2rem', borderRadius: '20px', textAlign: 'center',
              marginBottom: '2rem', color: 'white', fontWeight: '900', fontSize: '1.6rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              🏟️ GIRONE {key}
            </div>

            {/* Partite */}
            <div style={{ marginBottom: '2rem' }}>
              {Object.keys(g.partite[0]).map((partita, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.1)', padding: '1.5rem',
                  borderRadius: '16px', marginBottom: '1rem', borderLeft: '4px solid #10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {partita.replace('vs', 'vs').toUpperCase()}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      Campo {['2/9:30', '3/9:30', '2/10:00', '3/10:00'][i]}
                    </div>
                  </div>
                  <input 
                    style={{
                      width: '100px', height: '45px', background: 'rgba(255,255,255,0.95)',
                      border: '2px solid #10b981', borderRadius: '12px', textAlign: 'center',
                      fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'monospace'
                    }}
                    placeholder="6-4"
                    value={g.partite[0][partita]}
                    onChange={(e) => aggiornaPunteggio(key, i, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Classifica */}
            <div style={{
              background: 'rgba(16,185,129,0.2)', padding: '1.5rem',
              borderRadius: '20px', borderTop: '4px solid #10b981'
            }}>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '1rem', color: '#10b981' }}>
                🥇 CLASSIFICA
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px 60px 60px 50px', gap: '0.5rem', fontSize: '0.95rem' }}>
                <div style={{ fontWeight: 'bold' }}></div>
                <div style={{ fontWeight: 'bold' }}>SQUADRA</div>
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>V</div>
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>P</div>
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>PT</div>
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>POS</div>
                
                {g.classifica.map((squadra, i) => (
                  <React.Fragment key={i}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#94a3b8' }}>
                      {i+1}°
                    </div>
                    <div style={{ fontWeight: 'bold', padding: '0.5rem 0' }}>{squadra.squadra}</div>
                    <div style={{ textAlign: 'center' }}>{squadra.v}</div>
                    <div style={{ textAlign: 'center' }}>{squadra.p}</div>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>{squadra.pt}</div>
                    <div style={{ textAlign: 'center' }}>{squadra.pos}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUARTI TOP & FLOP */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem',
        maxWidth: '1400px', margin: '0 auto 4rem auto'
      }}>
        <div>
          <div style={{
            background: 'linear-gradient(90deg, #10b981, #059669)', padding: '2rem',
            borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(16,185,129,0.3)'
          }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '2rem' }}>⚽ QUARTI TOP</h3>
            {risultati.quartiTop.map((match, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px',
                marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '2rem'
              }}>
                <div style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>
                  {match[0] || 'VINCENTE A1'}
                </div>
                <div style={{
                  width: '4rem', height: '4rem', borderRadius: '50%', background: '#fbbf24',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black',
                  fontWeight: 'bold', fontSize: '1.2rem'
                }}>VS</div>
                <div style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>
                  {match[1] || '2° GIRONE B'}
                </div>
                <input style={{
                  width: '90px', height: '45px', borderRadius: '25px', border: '2px solid #10b981',
                  textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold'
                }} placeholder="6-4" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{
            background: 'linear-gradient(90deg, #ef4444, #dc2626)', padding: '2rem',
            borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(239,68,68,0.3)'
          }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '2rem', color: 'white' }}>🔻 QUARTI FLOP</h3>
            {risultati.quartiFlop.map((match, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px',
                marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '2rem'
              }}>
                <div style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>
                  {match[0] || '4° GIRONE A'}
                </div>
                <div style={{
                  width: '4rem', height: '4rem', borderRadius: '50%', background: '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                  fontWeight: 'bold', fontSize: '1.2rem'
                }}>VS</div>
                <div style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>
                  {match[1] || '3° GIRONE B'}
                </div>
                <input style={{
                  width: '90px', height: '45px', borderRadius: '25px', border: '2px solid #ef4444',
                  textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold'
                }} placeholder="6-4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEMIFINALI & FINALE */}
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', padding: '3rem 2.5rem',
          borderRadius: '32px', boxShadow: '0 35px 70px rgba(251,191,36,0.4)'
        }}>
          <h3 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '2.5rem', color: 'black' }}>
            🏆 SEMIFINALI → FINALE
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.3)', padding: '1.5rem', borderRadius: '20px', marginBottom: '1rem', fontWeight: 'bold' }}>
                VINCENTE QUARTI TOP 1
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'black' }}>SF1</div>
              <input style={{ width: '100px', height: '50px', borderRadius: '25px', fontSize: '1.2rem' }} placeholder="6-4" />
            </div>
            <div style={{
              width: '6rem', height: '6rem', background: 'linear-gradient(45deg, gold, #fbbf24)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: '900', color: 'black', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>🏆</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.3)', padding: '1.5rem', borderRadius: '20px', marginBottom: '1rem', fontWeight: 'bold' }}>
                VINCENTE QUARTI TOP 2
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'black' }}>SF2</div>
              <input style={{ width: '100px', height: '50px', borderRadius: '25px', fontSize: '1.2rem' }} placeholder="6-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabelloneGreen2024;
