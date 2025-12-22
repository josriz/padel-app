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

  const calcolaCampo = (campoData) => {
    const { A, B, C } = campoData.partite;
    
    if (A.vincente && B.vincente && C.score) {
      C.vincente = parseInt(C.score.split('-')[0]) > parseInt(C.score.split('-')[1]) 
        ? A.vincente : B.vincente;
    }
    
    if (A.perdente && C.score && !C.vincente) {
      campoData.classifica.primo = C.vincente;
      campoData.classifica.secondo = A.perdente;
    }
  };

  useEffect(() => {
    const nuoviCampi = { ...campi };
    Object.keys(nuoviCampi).forEach(campoId => {
      calcolaCampo(nuoviCampi[campoId]);
    });
    
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
      padding: '2rem',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* HEADER SERIE A */}
      <div style={{
        textAlign: 'center',
        marginBottom: '4rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2rem',
          background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
          padding: '2rem 3rem',
          borderRadius: '50px',
          boxShadow: '0 20px 40px rgba(59,130,246,0.4)'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            🏆
          </div>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              background: 'linear-gradient(45deg, white, #f0f9ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              4° TORNEO GREEN 2024
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#bfdbfe',
              margin: '0.5rem 0 0 0',
              fontWeight: '600'
            }}>
              QUALIFICAZIONI | ORE 9:30
            </p>
          </div>
        </div>
      </div>

      {/* CAMPi */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '2rem',
        marginBottom: '4rem'
      }}>
        {Object.entries(campi).map(([id, campo]) => (
          <div key={id} style={{
            background: 'rgba(15,23,42,0.9)',
            border: '2px solid #3b82f6',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            {/* Header Campo */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'linear-gradient(90deg, #10b981, #059669)',
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                fontWeight: 'bold',
                color: 'white',
                fontSize: '1.2rem'
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  {id}
                </div>
                CAMPO {id}
              </div>
            </div>

            {/* Partite */}
            <div style={{ marginBottom: '2rem' }}>
              {/* Partita A */}
              <div style={{
                background: 'rgba(34,197,94,0.2)',
                border: '2px solid #10b981',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>A</span>
                  <span style={{ color: '#6b7280' }}>PRIMO MATCH</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ 
                    flex: 1, 
                    fontWeight: 'bold', 
                    color: 'white',
                    paddingRight: '1rem'
                  }}>
                    {campo.partite.A.t1}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      style={{
                        width: '80px',
                        height: '40px',
                        background: 'white',
                        border: '2px solid #10b981',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        fontFamily: 'monospace'
                      }}
                      placeholder="6-4"
                      value={campo.partite.A.score}
                      onChange={(e) => aggiornaPunteggio(id, 'A', e.target.value)}
                    />
                    {campo.partite.A.vincente && (
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        background: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Partita B */}
              <div style={{
                background: 'rgba(59,130,246,0.2)',
                border: '2px solid #3b82f6',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>B</span>
                  <span style={{ color: '#6b7280' }}>SECONDO MATCH</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ 
                    flex: 1, 
                    fontWeight: 'bold', 
                    color: 'white',
                    paddingRight: '1rem'
                  }}>
                    {campo.partite.B.t1}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      style={{
                        width: '80px',
                        height: '40px',
                        background: 'white',
                        border: '2px solid #3b82f6',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        fontFamily: 'monospace'
                      }}
                      placeholder="6-4"
                      value={campo.partite.B.score}
                      onChange={(e) => aggiornaPunteggio(id, 'B', e.target.value)}
                    />
                    {campo.partite.B.vincente && (
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        background: '#3b82f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Partita C */}
              <div style={{
                background: 'rgba(251,191,36,0.3)',
                border: '3px solid #fbbf24',
                borderRadius: '20px',
                padding: '2rem',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                }}/>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fbbf24' }}>C</span>
                  <span style={{
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fbbf24',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                  }}>FINALE CAMPO</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ 
                    flex: 1, 
                    fontWeight: '900', 
                    color: 'white',
                    fontSize: '1.1rem',
                    paddingRight: '1rem'
                  }}>
                    {campo.partite.A.vincente || 'V.A'} vs {campo.partite.B.vincente || 'V.B'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      style={{
                        width: '90px',
                        height: '45px',
                        background: 'linear-gradient(90deg, #fef3c7, #fde68a)',
                        border: '3px solid #fbbf24',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '1.4rem',
                        fontWeight: '900',
                        fontFamily: 'monospace'
                      }}
                      placeholder="6-3"
                      value={campo.partite.C.score}
                      onChange={(e) => aggiornaPunteggio(id, 'C', e.target.value)}
                    />
                    {campo.partite.C.vincente && (
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        background: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}>
                        🏆
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Classifica */}
            <div style={{
              background: 'linear-gradient(90deg, #10b981, #059669)',
              padding: '1.5rem',
              borderRadius: '16px',
              borderTop: '4px solid #047857'
            }}>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: '900',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🏅 CLASSIFICA
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {campo.classifica.primo && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '1rem',
                    borderRadius: '12px'
                  }}>
                    <span style={{ width: '3rem', fontSize: '1.4rem', fontWeight: '900', color: '#fbbf24' }}>1°</span>
                    <div style={{ flex: 1, paddingLeft: '0.5rem', fontWeight: 'bold' }}>{campo.classifica.primo}</div>
                  </div>
                )}
                {campo.classifica.secondo && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    padding: '1rem',
                    borderRadius: '12px'
                  }}>
                    <span style={{ width: '3rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#94a3b8' }}>2°</span>
                    <div style={{ flex: 1, paddingLeft: '0.5rem' }}>{campo.classifica.secondo}</div>
                    <span style={{
                      padding: '0.25rem 1rem',
                      background: 'rgba(0,0,0,0.5)',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      color: 'white'
                    }}>RIPESCAGGIO</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUARTI */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#3b82f6',
          marginBottom: '3rem'
        }}>QUARTI DI FINALE</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {quarti.map((match, i) => (
            <div key={i} style={{
              background: 'rgba(59,130,246,0.2)',
              border: '3px solid #3b82f6',
              borderRadius: '20px',
              padding: '2.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#3b82f6', marginBottom: '2rem' }}>
                QUARTO {i+1}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  minHeight: '4rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {match[0] || 'VINCENTE CAMPO 6'}
                </div>
                <div style={{
                  width: '5rem',
                  height: '5rem',
                  border: '3px solid #3b82f6',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>VS</div>
                <input 
                  style={{
                    width: '100px',
                    height: '50px',
                    background: 'white',
                    border: '3px solid #3b82f6',
                    borderRadius: '25px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}
                  placeholder="6-4"
                />
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  minHeight: '4rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {match[1] || 'RIPESCATO CAMPO 7'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabelloneGreen4;
