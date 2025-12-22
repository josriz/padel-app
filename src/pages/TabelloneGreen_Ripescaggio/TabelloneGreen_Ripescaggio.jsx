import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { supabase } from '../supabaseClient'; // Il tuo client Supabase
import './TabelloneRipescaggi.css';

const SquadraDraggable = ({ id, nome, onDrop }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'squadra',
    item: { id, nome },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div 
      ref={drag}
      className={`squadra-draggable ${isDragging ? 'dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {nome || 'Trascina qui una squadra'}
    </div>
  );
};

const SquadraDroppable = ({ index, onDrop, children, disabled }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'squadra',
    drop: (item) => !disabled && onDrop(item.nome, index),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop}
      className={`squadra-droppable ${isOver && !disabled ? 'drop-over' : ''} ${disabled ? 'disabled' : ''}`}
    >
      {children}
    </div>
  );
};

const TabelloneRipescaggi = ({ tournamentId }) => {
  const [partite, setPartite] = useState({
    poolSquadre: [
      'Zagaria - Prisciandaro', 'Bove R. - Romita', 'Smaldino - Stanzione', 'Canonico - Cillo',
      'Marzano - Saracino', 'Avellino - Ferrari', 'Scavo - De Vito', 'Bove. N. - Carbonara',
      'Romano - Corchia', 'Cassano - Caiati', 'Francioso - Falba', 'Ricco - Indiveri',
      'Mastromauro - Pierno', 'Bove M. -Borracci', 'Quaranta -Rizzi', 'Crisci - Santantonio',
      '1° Class. Girone A', '2° Class. Girone A', '1° Class. Girone B', '2° Class. Girone B',
      '1° Class. Girone C', '2° Class. Girone C', '1° Class. Girone D', '2° Class. Girone D',
      '3° Class.Girone A', '3° Class.Girone B', '3° Class.Girone C', '3° Class.Girone D',
      '4° Class. Girone A', '4° Class. Girone B', '4° Class. Girone C', '4° Class. Girone D'
    ],
    campo2: { n2_930: ['', ''], n3_930: ['', ''], n2_1000: ['', ''], n3_1000: ['', ''], n2_1030: ['', ''], n3_1030: ['', ''] },
    campo3: { n2_930: ['', ''], n3_930: ['', ''], n2_1000: ['', ''], n3_1000: ['', ''], n2_1030: ['', ''], n3_1030: ['', ''] },
    campo4: { n4_930: ['', ''], n5_930: ['', ''], n4_1000: ['', ''], n5_1000: ['', ''], n4_1030: ['', ''], n5_1030: ['', ''] },
    campo5: { n4_1030: ['', ''], n5_1030: ['', ''] },
    campo12: { n12_930: ['', ''], n13_930: ['', ''], n12_1000: ['', ''], n13_1000: ['', ''], n12_1030: ['', ''], n13_1030: ['', ''] },
    campo11: { n11_930: ['', ''], n11_1000: ['', ''], n11_1030: ['', ''] },
    campo14: { n14_930: ['', ''], n14_1000: ['', ''], n14_1030: ['', ''] },
    gironeA: { squadre: Array(4).fill(''), p1: Array(4).fill(''), p2: Array(4).fill(''), p3: Array(4).fill(''), tot: Array(4).fill(''), pos: Array(4).fill('') },
    gironeB: { squadre: Array(4).fill(''), p1: Array(4).fill(''), p2: Array(4).fill(''), p3: Array(4).fill(''), tot: Array(4).fill(''), pos: Array(4).fill('') },
    gironeC: { squadre: Array(4).fill(''), p1: Array(4).fill(''), p2: Array(4).fill(''), p3: Array(4).fill(''), tot: Array(4).fill(''), pos: Array(4).fill('') },
    gironeD: { squadre: Array(4).fill(''), p1: Array(4).fill(''), p2: Array(4).fill(''), p3: Array(4).fill(''), tot: Array(4).fill(''), pos: Array(4).fill('') }
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Pronto');

  // SUPABASE: Carica dati all'avvio
  useEffect(() => {
    if (tournamentId) {
      loadTabellone();
    }
  }, [tournamentId]);

  // SUPABASE: Salva automaticamente ogni 2 secondi
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tournamentId) saveTabellone();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [partite, tournamentId]);

  const loadTabellone = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tabelloni_ripescaggi')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();

      if (data) {
        setPartite(data.dati);
        setStatus('Caricato da Supabase');
      }
    } catch (error) {
      console.error('Errore caricamento:', error);
      setStatus('Nuovo tabellone');
    } finally {
      setLoading(false);
    }
  };

  const saveTabellone = async () => {
    if (!tournamentId) return;

    try {
      setLoading(true);
      setStatus('Salvando...');

      const { error } = await supabase
        .from('tabelloni_auto_save')
        .upsert({
          tournament_id: tournamentId,
          dati: partite,
          updated_at: new Date().toISOString()
        }, { onConflict: 'tournament_id' });

      if (!error) {
        setStatus('Salvato ✅');
      }
    } catch (error) {
      console.error('Errore salvataggio:', error);
      setStatus('Errore salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const dropSquadra = useCallback((squadra, campo, chiave, index) => {
    setPartite(prev => ({
      ...prev,
      poolSquadre: prev.poolSquadre.filter(s => s !== squadra),
      [campo]: {
        ...prev[campo],
        [chiave]: prev[campo][chiave].map((item, i) => i === index ? squadra : item)
      }
    }));
  }, []);

  const updateClassifica = useCallback((girone, colonna, index, valore) => {
    setPartite(prev => ({
      ...prev,
      [girone]: {
        ...prev[girone],
        [colonna]: prev[girone][colonna].map((item, i) => i === index ? valore : item)
      }
    }));
  }, []);

  if (loading) {
    return <div className="loading">⏳ Caricamento tabellone...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="tabellone-ripescaggi">
        {/* STATUS SUPABASE */}
        <div className="supabase-status">
          <span>📱 {status}</span>
          <button onClick={saveTabellone} disabled={loading} className="save-btn">
            💾 Salva Ora
          </button>
        </div>

        {/* POOL SQUADRE */}
        <div className="squadre-pool">
          <h3>🏓 Squadre Disponibili (Trascina)</h3>
          <div className="pool-grid">
            {partite.poolSquadre.map((squadra, i) => (
              <SquadraDraggable key={`pool-${i}`} id={`pool-${i}`} nome={squadra} />
            ))}
          </div>
        </div>

        {/* HEADER */}
        <div className="header-main">
          <div className="header-titles">
            <h1>Qualificazioni</h1>
            <h2>Quarti</h2>
            <h2>Semifinali</h2>
            <h2>FINALE</h2>
          </div>
        </div>

        {/* GIRONE A + CAMPO 2 */}
        <div className="section-row">
          <div className="girone-section">
            <div className="girone-header">
              <h3>N. Campi e Orari</h3>
              <h3>GIRONE A</h3>
              <h3>Risultato</h3>
            </div>
            <div className="classifica-container">
              <table className="classifica-table">
                <thead>
                  <tr><th>Squadra</th><th>P.</th><th>P.</th><th>P.</th><th>Tot.</th><th>Pos.</th></tr>
                </thead>
                <tbody>
                  {Array(4).fill(0).map((_, i) => (
                    <tr key={`gironeA-${i}`}>
                      <td><input value={partite.gironeA.squadre[i] || ''} onChange={(e) => updateClassifica('gironeA', 'squadre', i, e.target.value)} /></td>
                      <td><input value={partite.gironeA.p1[i] || ''} onChange={(e) => updateClassifica('gironeA', 'p1', i, e.target.value)} /></td>
                      <td><input value={partite.gironeA.p2[i] || ''} onChange={(e) => updateClassifica('gironeA', 'p2', i, e.target.value)} /></td>
                      <td><input value={partite.gironeA.p3[i] || ''} onChange={(e) => updateClassifica('gironeA', 'p3', i, e.target.value)} /></td>
                      <td><input value={partite.gironeA.tot[i] || ''} onChange={(e) => updateClassifica('gironeA', 'tot', i, e.target.value)} /></td>
                      <td><input value={partite.gironeA.pos[i] || ''} onChange={(e) => updateClassifica('gironeA', 'pos', i, e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="qualificati">
              <div>1° Class. Girone A</div>
              <div>2° Class. Girone A</div>
            </div>
          </div>

          <div className="campo-section campo-2">
            <div className="campo-title">CAMPO 2 Scoperto</div>
            
            <div className="partita-block">
              <div className="partita-header">N. 2 ore 9,30</div>
              <div className="match-pair">
                <SquadraDroppable index={0} onDrop={(s) => dropSquadra(s, 'campo2', 'n2_930', 0)}>
                  {partite.campo2.n2_930[0] ? (
                    <SquadraDraggable id="campo2-n2-930-0" nome={partite.campo2.n2_930[0]} />
                  ) : (
                    'Trascina squadra'
                  )}
                </SquadraDroppable>
                <SquadraDroppable index={1} onDrop={(s) => dropSquadra(s, 'campo2', 'n2_930', 1)}>
                  {partite.campo2.n2_930[1] ? (
                    <SquadraDraggable id="campo2-n2-930-1" nome={partite.campo2.n2_930[1]} />
                  ) : (
                    'Trascina squadra'
                  )}
                </SquadraDroppable>
              </div>
            </div>

            {/* RIPETI PER TUTTE LE 28+ PARTITE con lo stesso pattern */}
            <div className="semifinali-title">SEMIFINALI TOP</div>
            {/* ... resto del campo 2 */}
          </div>
        </div>

        {/* Altre sezioni GIRONE B/C/D + CAMPI 3,4,5,11,12,14 */}
      </div>
    </DndProvider>
  );
};

export default TabelloneRipescaggi;
