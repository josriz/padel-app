// ===== COPIA COMPLETO IN: C:\padel-app\src\components\TabelloneRipescaggi.jsx =====
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ChevronLeft, Users, GripVertical } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function TabelloneRipescaggi() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();

  const [data, setData] = useState({
    teams: ['Zagaria-Prisciandaro', 'Bove R.-Romita', 'Smaldino-Stanzione', 'Canonico-Cillo', 
            'Marzano-Saracino', 'Avellino-Ferrari', 'Scavo-De Vito', 'Bove N.-Carbonara'],
    gironeA: [], gironeB: [], gironeC: [], gironeD: [],
    campo2: ['TBD', 'TBD'], campo3: ['TBD', 'TBD'], 
    campo4: ['TBD', 'TBD'], campo5: ['TBD', 'TBD'],
    punteggi: {
      gironeA: [[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
      gironeB: [[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
      gironeC: [[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
      gironeD: [[0,0,0],[0,0,0],[0,0,0],[0,0,0]]
    }
  });

  const [draggedItem, setDraggedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('ripescaggi').select('*').single();
      if (data) setData(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.log('No dati salvati');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    await supabase.from('ripescaggi').upsert(data);
    alert('✅ Salvato!');
  };

  // [TUTTE LE FUNZIONI - renderTeam, renderGironeMatch, renderCampo - COME SOPRA]
  // ... resto del codice completo dalla risposta precedente


  const handleDragStart = (e, type, index) => {
    setDraggedItem({ type, index, text: data[type][index] });
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetType, targetIndex) => {
    e.preventDefault();
    if (!draggedItem) return;
    setData(prev => {
      const source = prev[draggedItem.type] || [];
      const target = prev[targetType] || [];
      const newSource = source.filter((_, i) => i !== draggedItem.index);
      const newTarget = [...target];
      newTarget.splice(targetIndex, 0, draggedItem.text);
      return { ...prev, [draggedItem.type]: newSource, [targetType]: newTarget };
    });
    setDraggedItem(null);
  };

  const updatePunteggio = (girone, index, partita, valore) => {
    setData(prev => {
      const newPunteggi = { ...prev.punteggi };
      newPunteggi[girone][index][partita] = parseInt(valore) || 0;
      return { ...prev, punteggi: newPunteggi };
    });
  };

  const renderTeam = (team, index, type) => (
    <div 
      draggable 
      onDragStart={(e) => handleDragStart(e, type, index)}
      className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-grab"
    >
      <GripVertical className="w-4 h-4 mr-2" />
      <span className="text-sm font-medium truncate flex-1">{team}</span>
    </div>
  );

  const renderGironeMatch = (gironeKey, title) => {
    const squadre = data[gironeKey] || [];
    const punteggiGirone = data.punteggi[gironeKey] || [];
    return (
      <div className="flex flex-col p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 hover:shadow-xl">
        <div className="text-sm font-semibold text-gray-700 mb-4 text-center">{title}</div>
        <div className="space-y-3 mb-4">
          {squadre.map((squadra, i) => renderTeam(squadra, i, gironeKey))}
          <div onDrop={(e) => handleDrop(e, gironeKey, squadre.length)}
               className="h-12 border-2 border-dashed border-emerald-400 rounded-lg flex items-center justify-center bg-emerald-50">
            <span className="text-xs text-emerald-600">DROP QUI</span>
          </div>
        </div>
        <table className="w-full text-xs bg-emerald-50 rounded overflow-hidden">
          <thead className="bg-emerald-600 text-white">
            <tr><th className="p-2">P1</th><th>P2</th><th>P3</th><th>TOT</th></tr>
          </thead>
          <tbody>
            {Array(4).fill(0).map((_, i) => (
              <tr key={i} className="border-t border-emerald-100">
                {[0,1,2].map(p => (
                  <td key={p} className="p-1 text-center">
                    <input className="w-12 h-8 p-1 text-xs border border-emerald-300 rounded"
                           type="number" value={punteggiGirone[i]?.[p] || ''}
                           onChange={e => updatePunteggio(gironeKey, i, p, e.target.value)}/>
                  </td>
                ))}
                <td className="p-1 text-center font-bold text-emerald-700">
                  {punteggiGirone[i]?.reduce((a,b)=>a+b,0) || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCampo = (campoKey, numero, ora = '9:30') => {
    const partite = data[campoKey] || ['TBD', 'TBD'];
    return (
      <div className="flex flex-col p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl group">
        <div className="flex items-center justify-between w-full mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{numero}</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Campo {numero}</h4>
              <p className="text-sm text-gray-500">{ora}</p>
            </div>
          </div>
        </div>
        <div className="w-full space-y-4 mb-6">
          {partite.map((partita, i) => (
            <div key={i} draggable onDragStart={(e) => handleDragStart(e, campoKey, i)}
                 className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl cursor-grab">
              <GripVertical className="w-5 h-5 mr-3" />
              <span className="text-sm font-semibold truncate flex-1">{partita}</span>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold">VS</span>
              </div>
            </div>
          ))}
          <div onDrop={(e) => handleDrop(e, campoKey, partite.length)}
               className="h-16 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center bg-gradient-to-r from-orange-50 to-orange-100">
            <span className="text-sm text-orange-600 font-semibold">+ Aggiungi Partita</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Caricamento tabellone ripescaggi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => navigate(-1)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center flex-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🏓 Tabellone Ripescaggi
              </h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                <Users className="w-4 h-4 mr-1" />
                {data.teams.length} squadre • {Object.values(data).filter(v => Array.isArray(v) && v.length > 0).length - 1}/20 posizionate
              </p>
            </div>
            <button onClick={saveData}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 shadow-md hover:shadow-lg">
              💾 Salva
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Gironi Ripescaggi</h2>
            <div className="grid grid-cols-2 gap-6 mb-12">
              {renderGironeMatch('gironeA', 'GIRONE A')}
              {renderGironeMatch('gironeB', 'GIRONE B')}
              {renderGironeMatch('gironeC', 'GIRONE C')}
              {renderGironeMatch('gironeD', 'GIRONE D')}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">Programma Campi</h3>
            <div className="grid grid-cols-2 gap-6">
              {renderCampo('campo2', '2', '9:30')}
              {renderCampo('campo3', '3', '10:00')}
              {renderCampo('campo4', '4', '9:30')}
              {renderCampo('campo5', '5', '10:00')}
            </div>
          </div>
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-emerald-600" />
                Squadre Disponibili ({data.teams.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.teams.map((team, index) => renderTeam(team, index, 'teams'))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
