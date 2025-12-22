// src/components/TabelloneRipescaggi.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { supabase } from '../supabaseClient';
import { useOutletContext } from 'react-router-dom';
import './TabelloneRipescaggi.css';

const SquadraDraggable = ({ id, nome }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'squadra',
    item: { id, nome },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  return (
    <div ref={drag} className={`squadra-draggable ${isDragging ? 'dragging' : ''}`} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {nome || 'Trascina squadra'}
    </div>
  );
};

const SquadraDroppable = ({ index, onDrop, nome, campo, chiave }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'squadra',
    drop: (item) => onDrop(item.nome, campo, chiave, index),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });
  return (
    <div ref={drop} className={`squadra-droppable ${isOver ? 'drop-over' : ''}`}>
      {nome || 'Drop qui'}
    </div>
  );
};

export default function TabelloneRipescaggi() {
  const { tournamentId } = useOutletContext();
  const [partite, setPartite] = useState({
    poolSquadre: [
      'Zagaria - Prisciandaro', 'Bove R. - Romita', 'Smaldino- Stanzione', 'Canonico - Cillo',
      'Marzano - Saracino', 'Avellino - Ferrari', 'Scavo-De Vito', 'Bove. N. - Carbonara',
      'Romano - Corchia', 'Cassano - Caiati', 'Francioso - Falba', 'Ricco - Indiveri',
      'Mastromauro - Pierno', 'Bove M. -Borracci', 'Quaranta -Rizzi', 'Crisci - Santantonio',
      '1° Class. Girone A', '2° Class. Girone B', '1° Class. Girone B', '2° Class. Girone D',
      '3° Class.Girone A', '4° Class. Girone B', '3° Class. Girone C', '4° Class. Girone D'
    ],
    campo2: { n2_930: ['', ''], n3_930: ['', ''], n2_1000: ['', ''], n3_1000: ['', ''], n2_1030: ['', ''], n3_1030: ['', ''] },
    campo3: { n2_930: ['', ''], n3_930: ['', ''], n2_1000: ['', ''], n3_1000: ['', ''], n2_1030: ['', ''], n3_1030: ['', ''] },
    campo4: { n4_930: ['', ''], n5_930: ['', ''], n4_1000: ['', ''], n5_1000: ['', ''], n4_1030: ['', ''], n5_1030: ['', ''] },
    campo5: { n4_1030: ['', ''], n5_1030: ['', ''] },
    campo12: { n12_930: ['', ''], n13_930: ['', ''], n12_1000: ['', ''], n13_1000: ['', ''], n12_1030: ['', ''], n13_1030: ['', ''] },
    campo11: { n11_930: ['', ''], n11_1000: ['', ''], n11_1030: ['', ''] },
    campo14: { n14_930: ['', ''], n14_1000: ['', ''], n14_1030: ['', ''] },
    gironeA: { squadre: ['', '', '', ''], p1: ['', '', '', ''], p2: ['', '', '', ''], p3: ['', '', '', ''], tot: ['', '', '', ''], pos: ['', '', '', ''] },
    gironeB: { squadre: ['', '', '', ''], p1: ['', '', '', ''], p2: ['', '', '', ''], p3: ['', '', '', ''], tot: ['', '', '', ''], pos: ['', '', '', ''] },
    gironeC: { squadre: ['', '', '', ''], p1: ['', '', '', ''], p2: ['', '', '', ''], p3: ['', '', '', ''], tot: ['', '', '', ''], pos: ['', '', '', ''] },
    gironeD: { squadre: ['', '', '', ''], p1: ['', '', '', ''], p2: ['', '', '', ''], p3: ['', '', '', ''], tot: ['', '', '', ''], pos: ['', '', '', ''] }
  });
  const [status, setStatus] = useState('Pronto');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tournamentId) loadTabellone();
  }, [tournamentId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tournamentId) saveTabellone();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [partite, tournamentId]);

  const loadTabellone = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('tabelloni_ripescaggi').select('dati').eq('tournament_id', tournamentId).single();
      if (data) {
        setPartite(data.dati);
        setStatus('Caricato da Supabase');
      }
    } catch (error) {
      setStatus('Nuovo tabellone');
    } finally {
      setLoading(false);
    }
  };

  const saveTabellone = async () => {
    try {
      setStatus('Salvando...');
      await supabase.from('tabelloni_ripescaggi').upsert({ 
        tournament_id: tournamentId, 
        dati: partite, 
        updated_at: new Date().toISOString() 
      });
      setStatus('Salvato ✅');
    } catch (error) {
      setStatus('Errore save');
    }
  };

  const dropSquadra = useCallback((squadra, campo, chiave, index) => {
    setPartite(prev => ({
      ...prev,
      poolSquadre: prev.poolSquadre.filter(s => s !== squadra),
      [campo]: {
        ...prev[campo],
        [chiave]: prev[campo][chiave]?.map((item, i) => i === index ? squadra : item) || [squadra]
      }
    }));
  }, []);

  if (loading) return <div className="loading">⏳ Caricamento...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="tabellone-ripescaggi">
        <div className="supabase-status">
          <span>📱 {status}</span>
          <button onClick={saveTabellone} className="save-btn">💾 Salva Ora</button>
        </div>

        <div className="squadre-pool">
          <h3>🏓 Squadre Disponibili</h3>
          <div className="pool-grid">
            {partite.poolSquadre.map((squadra, i) => (
              <SquadraDraggable key={`pool-${i}`} id={`pool-${i}`} nome={squadra} />
            ))}
          </div>
        </div>

        <div className="header-main">
          <div className="header-titles">
            <h1>Qualificazioni</h1><h2>Quarti</h2><h2>Semifinali</h2><h2>FINALE</h2>
          </div>
        </div>

        <div className="section-row">
          <div className="girone-section">
            <div className="girone-header">
              <h3>N. Campi e Orari</h3><h3>GIRONE A</h3><h3>Risultato</h3>
            </div>
            <table className="classifica-table">
              <thead><tr><th>Squadra</th><th>P.</th><th>P.</th><th>P.</th><th>Tot.</th><th>Pos.</th></tr></thead>
              <tbody>{Array(4).fill().map((_, i) => (
                <tr key={`A-${i}`}>
                  <td>{partite.gironeA.squadre[i]}</td>
                  <td>{partite.gironeA.p1[i]}</td><td>{partite.gironeA.p2[i]}</td><td>{partite.gironeA.p3[i]}</td>
                  <td>{partite.gironeA.tot[i]}</td><td>{partite.gironeA.pos[i]}</td>
                </tr>
              ))}</tbody>
            </table>
            <div className="qualificati">
              <div>1° Class. Girone A</div><div>2° Class. Girone A</div>
            </div>
          </div>

          <div className="campo-section campo-2">
            <div className="campo-title">CAMPO 2 Scoperto</div>
            <div className="partita-block">
              <div className="partita-header">N. 2 ore 9,30</div>
              <div className="match-pair">
                <SquadraDroppable index={0} onDrop={dropSquadra} nome={partite.campo2.n2_930[0]} campo="campo2" chiave="n2_930" />
                <SquadraDroppable index={1} onDrop={dropSquadra} nome={partite.campo2.n2_930[1]} campo="campo2" chiave="n2_930" />
              </div>
            </div>
            <div className="semifinali-title">SEMIFINALI TOP</div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
