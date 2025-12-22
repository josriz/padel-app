console.log("### PADDEL BRACKET - MINIMO 2 PARTITE ###");
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { ArrowLeft, User, CheckCircle, Save, Shield, Calendar, Users, Download, Award, Info } from "lucide-react";

export default function PadelBracket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentFase, setCurrentFase] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRipescaggioInfo, setShowRipescaggioInfo] = useState(false);

  const fasi = ['ottavi', 'quarti', 'semi', 'finale', 'ripescaggi'];
  const titoliFasi = ['OTTAVI', 'QUARTI', 'SEMIFINALI', 'FINALE', '🛡️ RIPESTAGGI 8P'];

  // ✅ CRITERI NUOVI - MINIMO 2 PARTITE
  const criteriRipescaggio = [
    "🎾 **FASE 1: RIPESCAGGIO OTTAVI (4 partite)**",
    "8 sconfitti ottavi → 4 vincitori (Campi 15-18)",
    "",
    "🎾 **FASE 2: RIPESCAGGIO QUARTI (2 partite)**", 
    "4 sconfitti quarti → 2 vincitori (Campi 19-20)",
    "",
    "🎾 **FINALE RIPESCAGGI (1 partita)**",
    "2 vinc. ottavi vs 2 vinc. quarti → 1 finalista (Campo 21)",
    "",
    "🎾 **3° POSTO (1 partita)**",
    "Sconfitto rip.21 vs Sconfitto semi → 3° posto (Campo 22)"
  ];

  const [data, setData] = useState({
    torneo: {
      nome: "Torneo Padel Elite 2025 - MIN 2P",
      data: "22/12/2025",
      direttore: "Mario Rossi"
    },
    ottavi: [
      { id: 0, sq1: ["Luca Bianchi", "Marco Verdi"], sq2: ["Giovanni Rossi", "Antonio Nero"], risultato: "6-4", campo: "Campo n°1" },
      { id: 1, sq1: ["Paolo Azzurri", "Roberto Verdi"], sq2: ["Stefano Gialli", "Davide Blu"], risultato: "6-3", campo: "Campo n°2" },
      { id: 2, sq1: ["Giulia Rosa", "Sara Viola"], sq2: ["Elena Arancio", "Chiara Verde"], risultato: "7-5", campo: "Campo n°3" },
      { id: 3, sq1: ["Marta Gialla", "Laura Rossa"], sq2: ["Anna Blu", "Sofia Grigia"], risultato: "6-2", campo: "Campo n°4" },
      { id: 4, sq1: ["Francesco Nero", "Matteo Bianco"], sq2: ["Alessandro Verde", "Riccardo Arancio"], risultato: "6-4", campo: "Campo n°5" },
      { id: 5, sq1: ["Lorenzo Viola", "Simone Rosa"], sq2: ["Federico Giallo", "Nicola Azzurro"], risultato: "7-6", campo: "Campo n°6" },
      { id: 6, sq1: ["Pietro Rossa", "Gabriele Nero"], sq2: ["Emanuele Blu", "Christian Grigio"], risultato: "6-1", campo: "Campo n°7" },
      { id: 7, sq1: ["Daniele Verde", "Andrea Arancio"], sq2: ["Massimo Viola", "Claudio Rosa"], risultato: "6-3", campo: "Campo n°8" }
    ],
    quarti: [
      { id: 0, sq1: ["Luca Bianchi", "Marco Verdi"], sq2: ["Paolo Azzurri", "Roberto Verdi"], risultato: "6-4", campo: "Campo n°9" },
      { id: 1, sq1: ["Giulia Rosa", "Sara Viola"], sq2: ["Marta Gialla", "Laura Rossa"], risultato: "7-5", campo: "Campo n°10" },
      { id: 2, sq1: ["Francesco Nero", "Matteo Bianco"], sq2: ["Lorenzo Viola", "Simone Rosa"], risultato: "6-3", campo: "Campo n°11" },
      { id: 3, sq1: ["Pietro Rossa", "Gabriele Nero"], sq2: ["Daniele Verde", "Andrea Arancio"], risultato: "6-2", campo: "Campo n°12" }
    ],
    semi: [
      { id: 0, sq1: ["Luca Bianchi", "Marco Verdi"], sq2: ["Giulia Rosa", "Sara Viola"], risultato: "6-4", campo: "Campo n°13" },
      { id: 1, sq1: ["Francesco Nero", "Matteo Bianco"], sq2: ["Pietro Rossa", "Gabriele Nero"], risultato: "7-6", campo: "Campo n°14" }
    ],
    finale: [{ 
      id: 0, 
      sq1: ["Luca Bianchi", "Marco Verdi"], 
      sq2: ["Francesco Nero", "Matteo Bianco"], 
      risultato: "6-3 6-4", 
      campo: "🏆 FINALE 🏆" 
    }],
    // ✅ 8 RIPESTAGGI - MINIMO 2 PARTITE!
    ripescaggi: [
      // FASE 1: RIPESCAGGIO OTTAVI (8 sconfitti → 4 vincitori)
      { id: 0, sq1: ["Giovanni Rossi", "Antonio Nero"], sq2: ["Stefano Gialli", "Davide Blu"], risultato: "6-4", campo: "Campo n°15", titolo: "Rip.Ottavi A" },
      { id: 1, sq1: ["Elena Arancio", "Chiara Verde"], sq2: ["Anna Blu", "Sofia Grigia"], risultato: "7-5", campo: "Campo n°16", titolo: "Rip.Ottavi B" },
      { id: 2, sq1: ["Alessandro Verde", "Riccardo Arancio"], sq2: ["Federico Giallo", "Nicola Azzurro"], risultato: "6-3", campo: "Campo n°17", titolo: "Rip.Ottavi C" },
      { id: 3, sq1: ["Emanuele Blu", "Christian Grigio"], sq2: ["Massimo Viola", "Claudio Rosa"], risultato: "6-2", campo: "Campo n°18", titolo: "Rip.Ottavi D" },
      
      // FASE 2: RIPESCAGGIO QUARTI (4 sconfitti → 2 vincitori)
      { id: 4, sq1: ["Paolo Azzurri", "Roberto Verdi"], sq2: ["Marta Gialla", "Laura Rossa"], risultato: "6-4", campo: "Campo n°19", titolo: "Rip.Quarti A" },
      { id: 5, sq1: ["Lorenzo Viola", "Simone Rosa"], sq2: ["Daniele Verde", "Andrea Arancio"], risultato: "7-6", campo: "Campo n°20", titolo: "Rip.Quarti B" },
      
      // FINALE RIPESCAGGI
      { id: 6, sq1: ["Giovanni Rossi", "Antonio Nero"], sq2: ["Paolo Azzurri", "Roberto Verdi"], risultato: "6-3", campo: "Campo n°21", titolo: "Rip.Finali" },
      
      // 3° POSTO
      { id: 7, sq1: ["Giulia Rosa", "Sara Viola"], sq2: ["Giovanni Rossi", "Antonio Nero"], risultato: "6-2", campo: "Campo n°22", titolo: "🥉 3° POSTO" }
    ],
    iscritti: []
  });

  const getCompletamento = () => 100;
  const isTabellonePronto = () => true;

  const toggleRipescaggioInfo = () => {
    setShowRipescaggioInfo(!showRipescaggioInfo);
  };

  const generaPDF = () => {
    const content = `
🏆 CAMPIONI: Luca Bianchi / Marco Verdi 🏆
🥉 3° Posto: Giulia Rosa / Sara Viola

${data.torneo.nome} - MINIMO 2 PARTITE GARANTITE
Data: ${data.torneo.data} | Totale: 23 Partite | 22 Campi

📊 DISTRIBUZIONE PARTITE:
0 squadre (1P) | 8 squadre (2P) | 4 squadre (3P) | 4 squadre (4P)

OTTAVI (1-8):
${data.ottavi.map(p => `${p.campo.padEnd(10)} ${p.sq1.join(' / ')} ${p.risultato.padStart(6)} ${p.sq2.join(' / ')}`).join('\n')}

QUARTI (9-12):
${data.quarti.map(p => `${p.campo.padEnd(10)} ${p.sq1.join(' / ')} ${p.risultato.padStart(6)} ${p.sq2.join(' / ')}`).join('\n')}

🔹 RIPESTAGGI 8 PARTITE (15-22):
${data.ripescaggi.map(p => `${p.campo.padEnd(10)} ${p.titolo.padEnd(15)} ${p.sq1.join(' / ')} ${p.risultato.padStart(6)} ${p.sq2.join(' / ')}`).join('\n')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tabellone_MIN2P_${data.torneo.nome.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('🎾✅ MINIMO 2 PARTITE - PDF SCARICATO!');
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  const renderPartita = (fase, index) => {
    const partita = data[fase][index];
    const isFinale = fase === 'finale';
    const isRipescaggio = fase === 'ripescaggi';
    
    return (
      <div className="bg-white border-4 border-emerald-200 rounded-xl shadow-xl p-6">
        <div className={`mb-4 p-4 rounded-xl text-white font-bold text-lg text-center shadow-lg ${
          isFinale ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
          isRipescaggio ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 
          'bg-gradient-to-r from-emerald-500 to-emerald-600'
        }`}>
          {partita.campo}
          {isRipescaggio && <div className="text-xs mt-1 font-semibold">{partita.titolo}</div>}
        </div>

        <div className="grid grid-cols-3 gap-4 items-center h-80">
          <div className="space-y-3 pr-3 border-r-2 border-emerald-300">
            <div className="text-xs font-bold uppercase text-emerald-800 text-center border-b pb-1 bg-emerald-100 px-2 py-1 rounded">SQUADRA 1</div>
            {partita.sq1.map((g, i) => (
              <div className="h-16 p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-center font-semibold text-xs uppercase shadow-sm">
                {g}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-emerald-400 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              {partita.risultato}
            </div>
            <div className="text-xs font-bold uppercase text-emerald-700 mt-2 px-2 py-1 bg-emerald-100 rounded-full shadow-sm">RISULTATO</div>
          </div>

          <div className="space-y-3 pl-3 border-l-2 border-emerald-300">
            <div className="text-xs font-bold uppercase text-emerald-800 text-center border-b pb-1 bg-emerald-100 px-2 py-1 rounded">SQUADRA 2</div>
            {partita.sq2.map((g, i) => (
              <div className="h-16 p-2 bg-orange-50 border border-orange-300 rounded-lg text-center font-semibold text-xs uppercase shadow-sm">
                {g}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentContent = () => {
    const fase = fasi[currentFase];
    const partite = data[fase];
    
    return (
      <div className="space-y-8">
        {partite.map((_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {i % 2 === 0 && i + 1 < partite.length && (
              <>
                {renderPartita(fase, i)}
                {renderPartita(fase, i + 1)}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  const salvaBracket = async () => {
    if (!user) {
      alert('❌ Devi essere loggato!');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('bracket')
        .upsert({ 
          torneo_id: 2, 
          data, 
          user_id: user.id,
          updated_at: new Date().toISOString() 
        });
      if (!error) {
        alert('✅ Tabellone MIN 2P salvato!');
      }
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-emerald-300 rounded-xl hover:bg-emerald-50 font-bold shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Indietro
        </button>

        {/* HEADER */}
        <div className="text-center p-12 bg-gradient-to-r from-emerald-500 via-emerald-600 to-yellow-500 text-white rounded-3xl shadow-2xl border-8 border-white/50">
          <h1 className="text-4xl font-black mb-4 drop-shadow-2xl">🏆 MINIMO 2 PARTITE GARANTITE 🏆</h1>
          <div className="flex flex-wrap gap-6 justify-center items-center text-lg mb-6">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm"><Calendar className="w-6 h-6" /><span>{data.torneo.data}</span></div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm"><Users className="w-6 h-6" /><span>32 Giocatori - 23 Partite</span></div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm"><Shield className="w-6 h-6" /><span>✅ 0 squadre con 1P</span></div>
          </div>
          
          <div className="w-full bg-white/30 backdrop-blur-sm rounded-3xl h-6 mb-8 shadow-xl">
            <div className="h-6 bg-gradient-to-r from-yellow-400 to-orange-500 w-full rounded-3xl flex items-center justify-center text-lg font-black shadow-2xl">
              100% ✅ 2+ PARTITE TUTTI
            </div>
          </div>
        </div>

        {/* NAVIGAZIONE */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-8 bg-white/80 backdrop-blur-sm border-2 border-emerald-200 rounded-3xl shadow-2xl">
          <button onClick={() => navigate(-1)} className="px-8 py-4 bg-emerald-600 text-white font-black text-lg rounded-2xl hover:bg-emerald-700 shadow-xl flex items-center gap-2">
            ← Torneo
          </button>
          
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-700 mb-2">{titoliFasi[currentFase]}</div>
            <div className="text-lg font-bold text-emerald-600">FASE {currentFase + 1} / 5</div>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <button onClick={toggleRipescaggioInfo} className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-black text-lg rounded-2xl hover:shadow-2xl shadow-xl flex items-center gap-2">
              <Info className="w-6 h-6" /> CRITERI
            </button>
            <button onClick={salvaBracket} className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-lg rounded-2xl hover:shadow-2xl shadow-xl flex items-center gap-2">
              <Save className="w-6 h-6" /> SALVA
            </button>
            <button onClick={generaPDF} className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-lg rounded-2xl hover:shadow-2xl shadow-xl flex items-center gap-2">
              <Download className="w-6 h-6" /> PDF
            </button>
            <button onClick={() => setCurrentFase(prev => Math.max(0, prev - 1))} className="px-8 py-4 bg-gray-600 text-white font-black text-lg rounded-2xl hover:bg-gray-700 shadow-xl flex items-center gap-2">
              ← Prec
            </button>
            <button onClick={() => setCurrentFase(prev => Math.min(4, prev + 1))} className="px-8 py-4 bg-emerald-600 text-white font-black text-lg rounded-2xl hover:bg-emerald-700 shadow-xl flex items-center gap-2">
              Succ →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 p-8 rounded-3xl border-4 border-emerald-200 shadow-2xl backdrop-blur-sm sticky top-8 h-fit">
              <h3 className="text-2xl font-black text-emerald-700 mb-6 text-center">📊 STATISTICHE</h3>
              <div className="space-y-4 text-center">
                <div className="text-3xl font-black text-emerald-600">0</div>
                <div className="text-lg font-bold text-gray-700">Squadre con 1P</div>
                <div className="text-3xl font-black text-blue-600">8</div>
                <div className="text-lg font-bold text-gray-700">Squadre con 2P</div>
                <div className="text-3xl font-black text-purple-600">4</div>
                <div className="text-lg font-bold text-gray-700">Squadre con 3P</div>
                <div className="text-3xl font-black text-yellow-600">4</div>
                <div className="text-lg font-bold text-gray-700">Squadre con 4P</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="p-12 bg-white/50 backdrop-blur-sm rounded-3xl border-4 border-emerald-200 shadow-2xl">
              {renderCurrentContent()}
            </div>
          </div>
        </div>

        {showRipescaggioInfo && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white max-w-4xl w-full mx-4 rounded-3xl shadow-2xl p-12 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-black">🛡️ CRITERI - MINIMO 2 PARTITE</h2>
                <button onClick={toggleRipescaggioInfo} className="text-3xl font-black hover:scale-110 transition-all">×</button>
              </div>
              <div className="grid md:grid-cols-2 gap-8 text-lg">
                {criteriRipescaggio.map((criterio, i) => (
                  <div key={i} className="p-8 bg-white/20 rounded-2xl backdrop-blur-sm border-l-8 border-yellow-400 space-y-4">
                    <div className="text-3xl font-black text-yellow-400">{i+1}</div>
                    <div className="font-bold text-2xl mb-4">{criterio.split('**')[1]}</div>
                    <div className="text-purple-100 leading-relaxed">{criterio.split('**')[3]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
