import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function TabelloneRipescaggi() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({
    teams: ['Zagaria-Prisciandaro', 'Bove R.-Romita', 'Smaldino-Stanzione', 'Canonico-Cillo'],
    campi: {
      campo1: { squadra1: null, squadra2: null, risultato: '' },
      campo2: { squadra1: null, squadra2: null, risultato: '' },
      campo3: { squadra1: null, squadra2: null, risultato: '' },
      campo4: { squadra1: null, squadra2: null, risultato: '' }
    }
  });
  const [tournamentName, setTournamentName] = useState('Ripescaggi');
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    if (tournamentId) {
      supabase
        .from('tournaments')
        .select('name')
        .eq('id', tournamentId)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setTournamentName(data.name);
            document.title = `Ripescaggi - ${data.name}`;
          }
        });
      
      // Carica dati ripescaggi
      supabase.from('ripescaggi').select('*').single().then(({ data }) => {
        if (data) setData(data);
      });
    }
  }, [tournamentId]);

  const saveData = async () => {
    await supabase.from('ripescaggi').upsert(data);
    alert('✅ Salvato!');
  };

  const handleDragStart = (e, type, index) => {
    setDraggedItem({ type, index, text: data[type][index] });
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, campoKey, slot) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    setData(prev => {
      const newData = { ...prev };
      if (draggedItem.type === 'teams') {
        newData.teams = newData.teams.filter((_, i) => i !== draggedItem.index);
      }
      newData.campi[campoKey][`squadra${slot}`] = draggedItem.text;
      return newData;
    });
    setDraggedItem(null);
  };

  const updateRisultato = (campoKey, valore) => {
    setData(prev => ({
      ...prev,
      campi: {
        ...prev.campi,
        [campoKey]: { ...prev.campi[campoKey], risultato: valore }
      }
    }));
  };

  const renderCampo = (campoKey, numero) => {
    const campo = data.campi[campoKey];
    return (
      <div className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-xl rounded-2xl shadow-xl mb-4">
            🏟️ CAMPO {numero}
          </div>
        </div>
        
        {/* SQ1 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-400 transition-all cursor-pointer"
             onDrop={(e) => handleDrop(e, campoKey, 1)} onDragOver={handleDragOver}>
          <div className="text-center font-bold text-lg text-emerald-800 min-h-[48px] flex items-center justify-center">
            {campo.squadra1 || 'Trascina Squadra 1'}
          </div>
        </div>

        {/* VS */}
        <div className="text-center mb-6">
          <div className="inline-block px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-2xl rounded-3xl shadow-2xl">
            ⚔️ VS ⚔️
          </div>
        </div>

        {/* SQ2 */}
        <div className="mb-8 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-400 transition-all cursor-pointer"
             onDrop={(e) => handleDrop(e, campoKey, 2)} onDragOver={handleDragOver}>
          <div className="text-center font-bold text-lg text-emerald-800 min-h-[48px] flex items-center justify-center">
            {campo.squadra2 || 'Trascina Squadra 2'}
          </div>
        </div>

        {/* Risultato */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
          <input 
            type="text" 
            placeholder="6-4 6-3"
            value={campo.risultato}
            onChange={(e) => updateRisultato(campoKey, e.target.value)}
            className="w-full p-4 text-center font-black text-2xl bg-transparent border-none focus:outline-none tracking-wider uppercase text-gray-800"
          />
        </div>
      </div>
    );
  };

  const renderTeam = (team, index) => (
    <div 
      draggable 
      onDragStart={(e) => handleDragStart(e, 'teams', index)}
      className="group p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-grab border-4 border-white/30 mb-4"
    >
      <div className="flex items-center justify-between">
        <span className="font-black text-xl tracking-wide">{team}</span>
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
          🎾
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 py-10">
      {/* Header IDENTICO TabellonePage */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-lg"
          >
            ← Indietro
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
              🏓 Tabellone Ripescaggi
            </h1>
            <p className="text-xl text-gray-600 font-semibold">#{tournamentId?.slice(0,8)}... - {tournamentName}</p>
          </div>
          <button
            onClick={saveData}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-lg"
          >
            💾 Salva
          </button>
        </div>
      </div>

      {/* Tabellone RIPESCAGGI */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* CAMPI */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderCampo('campo1', 1)}
              {renderCampo('campo2', 2)}
              {renderCampo('campo3', 3)}
              {renderCampo('campo4', 4)}
            </div>
          </div>

          {/* ISCRITTI */}
          <div className="lg:sticky lg:top-20 self-start">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
              <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-8 text-center">
                📋 Squadre Disponibili
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {data.teams.map((team, index) => renderTeam(team, index))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
