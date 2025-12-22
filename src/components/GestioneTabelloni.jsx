import React, { useState } from 'react';
import TabelloneGreen_Ripescaggio from '../components/TabelloneGreen_Ripescaggio';
import TabelloneGreen4 from '../components/TabelloneGreen4';
import TabelloneGreen5 from '../components/TabelloneGreen5';

const GestioneTabelloni = () => {
  const [tabAttivo, setTabAttivo] = useState('green4');

  const tabs = [
    { key: 'green4', label: '🟢 GREEN 4', componente: <TabelloneGreen4 /> },
    { key: 'green5', label: '🟢 GREEN 5', componente: <TabelloneGreen5 /> },
    { key: 'ripescaggio', label: '🔄 RIPESCAGGIO', componente: <TabelloneGreen_Ripescaggio /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-12 text-green-800">
        Gestione Tabelloni GREEN
      </h1>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex bg-white rounded-2xl shadow-xl border-4 border-green-200 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${
                tabAttivo === tab.key
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-green-100 hover:scale-[1.02]'
              }`}
              onClick={() => setTabAttivo(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenuto */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {tabs.find(tab => tab.key === tabAttivo)?.componente}
        </div>
      </div>
    </div>
  );
};

export default GestioneTabelloni;
