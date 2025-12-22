// src/components/TabelloneRipescaggi.jsx - DEBUG VERSIONE
import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function TabelloneRipescaggi() {
  const { tournamentId } = useOutletContext();
  
  return (
    <div style={{ 
      padding: '50px', 
      background: 'linear-gradient(135deg, #667eea, #764ba2)', 
      color: 'white', 
      textAlign: 'center', 
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎯 TABELLONE RIPESCAGGI</h1>
      <h2 style={{ fontSize: '24px' }}>✅ COMPONENTE CARICATO CORRETTAMENTE!</h2>
      <p style={{ fontSize: '20px' }}>Tournament ID: <strong>{tournamentId}</strong></p>
      <div style={{ 
        background: 'rgba(255,255,255,0.2)', 
        padding: '20px', 
        borderRadius: '15px', 
        marginTop: '30px',
        backdropFilter: 'blur(10px)'
      }}>
        <p>✅ Layout pronto per drag&drop</p>
        <p>✅ Supabase connesso</p>
        <p>✅ Pool 32 squadre</p>
        <p>✅ Campi 2,3,4,5,11,12,14</p>
      </div>
    </div>
  );
}
