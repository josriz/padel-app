import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { ArrowLeft, Calendar, Plus, Trash2, Phone } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "../supabaseClient";

export default function PadelBracket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentFase, setCurrentFase] = useState(0);
  const [showIscritti, setShowIscritti] = useState(true);
  const [vincitoriFinale, setVincitoriFinale] = useState({ p1: "", p2: "" });
  const [editingIscritti, setEditingIscritti] = useState(false);
  const [nuovoGiocatore, setNuovoGiocatore] = useState("");
  const [tournamentId, setTournamentId] = useState(null);
  const bracketRef = useRef(null);

  const fasi = ["ottavi", "quarti", "semi", "finale", "ripescaggi"];
  const titoliFasi = ["OTTAVI", "QUARTI", "SEMIFINALI", "FINALE", "🛡️ RIPESCAGGI"];

  const [iscritti, setIscritti] = useState([]);
  const [data, setData] = useState({
    ottavi: Array(8).fill().map((_, i) => ({
      id: i,
      sq1: { p1: "", p2: "", punti: "" },
      sq2: { p1: "", p2: "", punti: "" },
      campo: `Campo ${i + 1}`,
    })),
    quarti: Array(4).fill().map((_, i) => ({
      id: i,
      sq1: { p1: "", p2: "", punti: "" },
      sq2: { p1: "", p2: "", punti: "" },
      campo: `Campo ${i + 9}`,
    })),
    semi: Array(2).fill().map((_, i) => ({
      id: i,
      sq1: { p1: "", p2: "", punti: "" },
      sq2: { p1: "", p2: "", punti: "" },
      campo: `Campo ${i + 13}`,
    })),
    finale: [{
      id: 0,
      sq1: { p1: "", p2: "", punti: "" },
      sq2: { p1: "", p2: "", punti: "" },
      campo: "🏆 Finale",
    }],
    ripescaggi: Array(4).fill().map((_, i) => ({
      id: i,
      sq1: { p1: "", p2: "", punti: "" },
      sq2: { p1: "", p2: "", punti: "" },
      campo: `R${i + 1}`,
    })),
  });

  const [draggedGiocatore, setDraggedGiocatore] = useState(null);
  const [history, setHistory] = useState([]);

  // ✅ CARICA ISCRITTI
  useEffect(() => {
    const init = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const pathParts = window.location.pathname.split('/');
        const id = urlParams.get('id') || urlParams.get('tournament_id') || pathParts[pathParts.length-1];
        setTournamentId(id);

        if (id && id.length > 10) {
          const { data: regs } = await supabase
            .from('tournament_registrations').select('display_name, player_name')
            .eq('tournament_id', id);
          const nomi = [...new Set(regs?.flatMap(r => [r.display_name, r.player_name]).filter(Boolean) || [])].sort();
          setIscritti(nomi);
        }
      } catch (error) {
        setIscritti(["andrea", "antonio", "boverob", "cfalba", "Denny Test", "giose.rizzi"]);
      }
    };
    init();
  }, []);

  // ✅ FUNZIONE CRITICA: CALCOLA VINCITORI AUTOMATICI
const calcolaVincitoriAutomatici = useCallback(() => {
  setData(prevData => {
    const newData = JSON.parse(JSON.stringify(prevData));
    
    // ✅ LOGICA GENERICA: ogni fase ha META' match della precedente
    const fasiPrecedenti = ['ottavi', 'quarti', 'semi'];
    const fasiSuccessive = ['quarti', 'semi', 'finale'];
    
    fasiPrecedenti.forEach((fasePrecedente, index) => {
      const faseSuccessiva = fasiSuccessive[index];
      const numMatchPrecedenti = newData[fasePrecedente]?.length || 0;
      const numMatchSuccessivi = newData[faseSuccessiva]?.length || 0;
      
      if (numMatchPrecedenti > 0 && numMatchSuccessivi > 0) {
        for (let matchSuccessivo = 0; matchSuccessivo < numMatchSuccessivi; matchSuccessivo++) {
          const matchPre1 = newData[fasePrecedente][matchSuccessivo * 2];
          const matchPre2 = newData[fasePrecedente][matchSuccessivo * 2 + 1];
          
          // Vincitore matchPre1 → sq1
          if (matchPre1?.sq1.punti && matchPre1?.sq2.punti) {
            const punteggio1 = parsePunteggio(matchPre1.sq1.punti);
            const punteggio2 = parsePunteggio(matchPre1.sq2.punti);
            const vincitore = punteggio1 > punteggio2 ? matchPre1.sq1 : matchPre1.sq2;
            newData[faseSuccessiva][matchSuccessivo].sq1.p1 = vincitore.p1;
            newData[faseSuccessiva][matchSuccessivo].sq1.p2 = vincitore.p2;
          }
          
          // Vincitore matchPre2 → sq2  
          if (matchPre2?.sq1.punti && matchPre2?.sq2.punti) {
            const punteggio1 = parsePunteggio(matchPre2.sq1.punti);
            const punteggio2 = parsePunteggio(matchPre2.sq2.punti);
            const vincitore = punteggio1 > punteggio2 ? matchPre2.sq1 : matchPre2.sq2;
            newData[faseSuccessiva][matchSuccessivo].sq2.p1 = vincitore.p1;
            newData[faseSuccessiva][matchSuccessivo].sq2.p2 = vincitore.p2;
          }
        }
      }
    });
    
    return newData;
  });
}, []);  // ✅ PARSER PUNTEGGI (6-4 = 6, 7-5 = 7, ecc.)
  const parsePunteggio = (score) => {
    if (!score || typeof score !== 'string') return 0;
    const games = score.split('-')[0].trim();
    return parseInt(games) || 0;
  };

  // ✅ DRAG & DROP
  const handleDragStart = useCallback((e, giocatore) => {
    setDraggedGiocatore(giocatore);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData('text/plain', giocatore);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e, fase, index, squadra, giocatoreSlot) => {
    e.preventDefault();
    const giocatore = draggedGiocatore || e.dataTransfer.getData('text/plain');
    if (!giocatore) return;

    setHistory(prev => [...prev, { 
      data: JSON.parse(JSON.stringify(data)), 
      timestamp: new Date().toISOString() 
    }]);

    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const match = newData[fase][index];
      if (giocatoreSlot === "p1") {
        match[squadra].p1 = giocatore;
      } else if (giocatoreSlot === "p2") {
        match[squadra].p2 = giocatore;
      }
      return newData;
    });

    setDraggedGiocatore(null);
  }, [draggedGiocatore, data]);

  // ✅ INPUT PUNTI CON AUTO-CALCOLO VINCITORI
  const handlePuntiChange = useCallback((fase, index, squadra, punti) => {
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      newData[fase][index][squadra].punti = punti;
      
      // ✅ AUTO-CALCOLA DOPO 500ms
      setTimeout(() => {
        if (fase === 'ottavi' || fase === 'quarti' || fase === 'semi') {
          calcolaVincitoriAutomatici();
        }
      }, 500);
      
      return newData;
    });
  }, [calcolaVincitoriAutomatici]);

  const aggiungiGiocatore = () => {
    if (nuovoGiocatore.trim()) {
      setIscritti(prev => [...prev, nuovoGiocatore.trim()]);
      setNuovoGiocatore("");
    }
  };

  const rimuoviGiocatore = (index) => {
    setIscritti(prev => prev.filter((_, i) => i !== index));
  };

  const salvaTorneo = async () => {
    if (!tournamentId) return alert("❌ Nessun ID torneo");
    try {
      await supabase.from('tournament_brackets').upsert({
        tournament_id: tournamentId, data, updated_at: new Date().toISOString(), user_id: user?.id
      });
      alert("✅ Salvato!");
    } catch (error) {
      alert("❌ Errore");
    }
  };

  const inviaWhatsApp = () => {
    const message = `🏓 TABELLONE PADEL ${titoliFasi[currentFase]}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const resetFase = (fase) => {
    setData(prev => {
      const newData = { ...prev };
      newData[fase] = newData[fase].map((_, i) => ({
        id: i,
        sq1: { p1: "", p2: "", punti: "" },
        sq2: { p1: "", p2: "", punti: "" },
        campo: newData[fase][i]?.campo || "",
      }));
      return newData;
    });
  };

  const getNumeroMatches = (fase) => data[fase]?.length || 0;

  const esportaPDF = async () => {
    // ... (stessa funzione PDF del codice precedente)
    try {
      const bracket = bracketRef.current;
      if (!bracket) return alert("❌ Bracket non trovato");

      document.querySelector('[data-print="partecipanti"]')?.style.setProperty("display", "none");
      document.querySelector('[data-print="storico"]')?.style.setProperty("display", "none");

      await new Promise(r => setTimeout(r, 200));

      const canvas = await html2canvas(bracket, {
        scale: 1, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", width: 650,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("🏓 TABELLONE PADEL", 148.5, 20, { align: "center" });
      pdf.setFontSize(16);
      pdf.text(titoliFasi[currentFase], 148.5, 35, { align: "center" });

      const pdfWidth = 260;
      const pdfHeight = ((canvas.height * pdfWidth) / canvas.width) * 0.9;
      pdf.addImage(imgData, "PNG", 18, 50, pdfWidth, pdfHeight);

      pdf.save(`tabellone-${fasi[currentFase]}.pdf`);
      alert("✅ PDF OK!");
    } catch (error) {
      alert("❌ Errore: " + error.message);
    } finally {
      document.querySelector('[data-print="partecipanti"]')?.style.setProperty("display", "block");
      document.querySelector('[data-print="storico"]')?.style.setProperty("display", "block");
    }
  };

  // ✅ RENDER IDENTICO AL TUO
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F5B] via-[#003A8F] to-[#001F5B] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER IDENTICO */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium">
            <ArrowLeft size={20} />
            <span>Torna indietro</span>
          </button>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
              🏓 TORNEO PADEL
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <Calendar size={16} />
              <span>22 Dic 2025</span>
            </div>
          </div>
          <div className="w-12" />
        </div>

        {/* PULSANTI FASI IDENTICI */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50">
          {fasi.map((fase, index) => (
            <button
              key={fase}
              onClick={() => setCurrentFase(index)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                currentFase === index
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105"
                  : "bg-white/70 hover:bg-white shadow-md text-gray-700 hover:scale-105"
              }`}
            >
              {titoliFasi[index]}
            </button>
          ))}
        </div>

        {/* ✅ NUOVO BOTTONE CALCOLA VINCITORI */}
        <div className="text-center mb-6">
          <button 
            onClick={calcolaVincitoriAutomatici}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
          >
            ⚡ CALCOLA VINCITORI AUTOMATICAMENTE
          </button>
        </div>

        {/* CONTENITORE ISCRITTI + TABELLONE IDENTICO */}
        <div className="flex gap-6">
          {/* Lista iscritti IDENTICA + editing */}
          {showIscritti && (
            <div className="w-64 bg-white/90 rounded-2xl p-4 shadow-xl border border-white/50" data-print="partecipanti">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">📋 Partecipanti ({iscritti.length})</h2>
                <div className="flex gap-1">
                  <button onClick={() => setEditingIscritti(!editingIscritti)} 
                          className="text-xs p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600">
                    ✏️
                  </button>
                  <button onClick={() => setShowIscritti(false)} className="text-sm text-gray-500 hover:text-gray-700">X</button>
                </div>
              </div>

              {editingIscritti && (
                <div className="mb-3 p-2 bg-emerald-50 rounded-xl">
                  <input 
                    value={nuovoGiocatore} 
                    onChange={e => setNuovoGiocatore(e.target.value)}
                    className="w-full p-2 text-xs border rounded" 
                    placeholder="Nuovo giocatore"
                  />
                  <button onClick={aggiungiGiocatore} className="w-full mt-1 p-2 bg-emerald-500 text-white text-xs rounded font-bold">Aggiungi</button>
                </div>
              )}

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {iscritti.map((giocatore, i) => (
                  <div
                    key={i}
                    className={`bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-2 cursor-move hover:shadow-md border-2 border-transparent hover:border-emerald-300 ${editingIscritti ? 'pr-6 relative' : ''}`}
                    draggable={!editingIscritti}
                    onDragStart={e => handleDragStart(e, giocatore)}
                  >
                    <div className="text-gray-800 font-semibold text-sm truncate">{giocatore}</div>
                    {editingIscritti && (
                      <button 
                        onClick={() => rimuoviGiocatore(i)}
                        className="absolute right-1 top-1 p-1 text-red-500 hover:bg-red-100 rounded-full"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABELLONE COMPLETAMENTE IDENTICO AL TUO */}
          <div 
            ref={bracketRef} 
            className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/60 print:bg-white print:shadow-none relative overflow-hidden" 
            data-print="bracket"
            style={{
              backgroundImage: `url('/images/icon-tornei.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* resto del tabellone IDENTICO - stesso JSX del tuo originale */}
            <div className="absolute inset-0 bg-white/80"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 print:mb-4 print:flex-col print:items-start print:gap-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent print:text-2xl print:text-black">
                  {titoliFasi[currentFase]}
                </h2>
                <div className="flex items-center space-x-4 print:hidden">
                  <span className="text-lg font-bold text-gray-700">{getNumeroMatches(fasi[currentFase])} partite</span>
                  <button onClick={() => resetFase(fasi[currentFase])} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg">
                    🔄 Reset
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mb-6 print:hidden">
                <button onClick={salvaTorneo} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg text-sm">
                  💾 Salva
                </button>
                <button onClick={inviaWhatsApp} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg text-sm">
                  📱 WhatsApp
                </button>
                <button onClick={esportaPDF} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg text-sm">
                  📄 PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data[fasi[currentFase]].map((match, matchIndex) => (
                  <div key={match.id} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 shadow-lg border border-gray-200 print:bg-white print:shadow-none print:border print:p-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-white text-lg bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 rounded-2xl w-28 h-12 flex items-center justify-center shadow-[0_0_0_2px_rgba(255,255,255,0.5)] border border-blue-400/70 tracking-wide">
                        {match.campo}
                      </div>
                      <button className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-xs font-bold rounded-lg print:hidden">
                        Salva
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border-b border-gray-300">
                        <div>
                          <div 
                            className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-1 text-sm text-gray-500 cursor-pointer hover:border-emerald-400 transition-all"
                            onDragOver={handleDragOver} 
                            onDrop={(e) => handleDrop(e, fasi[currentFase], matchIndex, "sq1", "p1")}
                          >
                            {match.sq1.p1 || "Trascina giocatore"}
                          </div>
                          <div 
                            className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-1 text-sm text-gray-500 cursor-pointer hover:border-emerald-400 transition-all mt-1"
                            onDragOver={handleDragOver} 
                            onDrop={(e) => handleDrop(e, fasi[currentFase], matchIndex, "sq1", "p2")}
                          >
                            {match.sq1.p2 || "Trascina giocatore"}
                          </div>
                        </div>
                        <input 
                          type="text" 
                          value={match.sq1.punti} 
                          onChange={e => handlePuntiChange(fasi[currentFase], matchIndex, "sq1", e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-xl text-sm font-mono text-center" 
                          placeholder="6-4"
                        />
                      </div>

                      <div className="border-b border-gray-400 my-1"/>

                      <div className="flex items-center justify-between p-2 border-b border-gray-300">
                        <div>
                          <div 
                            className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-1 text-sm text-gray-500 cursor-pointer hover:border-emerald-400 transition-all"
                            onDragOver={handleDragOver} 
                            onDrop={(e) => handleDrop(e, fasi[currentFase], matchIndex, "sq2", "p1")}
                          >
                            {match.sq2.p1 || "Trascina giocatore"}
                          </div>
                          <div 
                            className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-1 text-sm text-gray-500 cursor-pointer hover:border-emerald-400 transition-all mt-1"
                            onDragOver={handleDragOver} 
                            onDrop={(e) => handleDrop(e, fasi[currentFase], matchIndex, "sq2", "p2")}
                          >
                            {match.sq2.p2 || "Trascina giocatore"}
                          </div>
                        </div>
                        <input 
                          type="text" 
                          value={match.sq2.punti} 
                          onChange={e => handlePuntiChange(fasi[currentFase], matchIndex, "sq2", e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-xl text-sm font-mono text-center" 
                          placeholder="6-4"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* BOX VINCITORI FINALE IDENTICO */}
              {fasi[currentFase] === "finale" && (
                <div className="mt-6 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-3xl p-4 shadow-xl border border-yellow-300 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <h3 className="text-lg font-extrabold text-yellow-900 tracking-wide">VINCITORI TORNEO</h3>
                      <p className="text-sm text-yellow-950/90">I vincitori della finale.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-64">
                    <input 
                      value={vincitoriFinale.p1} onChange={e => setVincitoriFinale({...vincitoriFinale, p1: e.target.value})}
                      placeholder="Giocatore 1" 
                      className="px-3 py-2 rounded-xl text-sm font-semibold text-yellow-900 bg-yellow-50/90 border border-yellow-300"
                    />
                    <input 
                      value={vincitoriFinale.p2} onChange={e => setVincitoriFinale({...vincitoriFinale, p2: e.target.value})}
                      placeholder="Giocatore 2" 
                      className="px-3 py-2 rounded-xl text-sm font-semibold text-yellow-900 bg-yellow-50/90 border border-yellow-300"
                    />
                  </div>
                </div>
              )}

              {/* AZIONI IDENTICHE */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 print:hidden">
                <button onClick={() => setShowIscritti(!showIscritti)}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-xl text-lg">
                  {showIscritti ? "👆 Nascondi Partecipanti" : "📋 Mostra Partecipanti"}
                </button>
                <div className="flex-1 flex gap-3">
                  <button onClick={salvaTorneo} className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-2xl shadow-lg text-sm">
                    💾 Salva Torneo
                  </button>
                  <button onClick={esportaPDF}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg text-sm">
                    📄 Esporta PDF
                  </button>
                </div>
              </div>

              <div className="mt-8 bg-white/80 p-4 rounded-2xl shadow-lg border border-gray-200 print:hidden" data-print="storico">
                <h3 className="font-bold mb-2">📜 Storico Azioni</h3>
                {history.length === 0 && <p className="text-sm text-gray-500">Nessuna azione ancora.</p>}
                <ul className="space-y-1 text-sm text-gray-700 max-h-24 overflow-y-auto">
                  {history.slice(-5).map((h, i) => (
                    <li key={i}>{new Date(h.timestamp).toLocaleString('it-IT')}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
