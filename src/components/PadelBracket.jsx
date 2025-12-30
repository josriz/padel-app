// src/components/PadelBracket.jsx - FILE COMPLETO CON DRAG & DROP 🔥
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { ArrowLeft, Calendar } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "../supabaseClient";
import { StaticBracketsEditable } from "./StaticBracketsEditable";

export default function PadelBracket() {
  const { user } = useAuth();
  const isAdminOrSuper = user?.email === 'giose.rizzi@gmail.com' || 
                        user?.email === 'boverob@libero.it' || 
                        user?.email === 'cfalba@libero.it';
  const navigate = useNavigate();
  const [currentFase, setCurrentFase] = useState(0);
  const [showIscritti, setShowIscritti] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const bracketRef = useRef(null);

  console.log("🔍 USER EMAIL:", user?.email);

  const fasi = ["ottavi", "quarti", "semi", "finale", "ripescaggi"];
  const titoliFasi = ["OTTAVI", "QUARTI", "SEMIFINALI", "FINALE", "🛡️ RIPESCAGGI"];

  const [iscritti, setIscritti] = useState([]);
  const [data, setData] = useState({
    ottavi: Array(8).fill().map((_, i) => ({ id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `Campo ${i + 1}` })),
    quarti: Array(4).fill().map((_, i) => ({ id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `Campo ${i + 9}` })),
    semi: Array(2).fill().map((_, i) => ({ id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `Campo ${i + 13}` })),
    finale: [{ id: 0, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: "🏆 Finale" }],
    ripescaggi: Array(4).fill().map((_, i) => ({ id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `R${i + 1}` }))
  });

  const [draggedGiocatore, setDraggedGiocatore] = useState(null);
  const [history, setHistory] = useState([]);
  const [showPrintBrackets, setShowPrintBrackets] = useState(false);
  const [printSize, setPrintSize] = useState(16);

  const getTournamentId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split("/");
    return urlParams.get("id") || urlParams.get("tournament_id") || pathParts[pathParts.length - 1] || 'demo-torneo';
  };

  const salvaTorneo = async () => {
    setLoadingSave(true);
    const tournamentId = getTournamentId();
    
    await supabase.from('padel_brackets')
      .delete().eq('tournament_id', tournamentId).eq('round', fasi[currentFase]);
    
    const { error } = await supabase.from('padel_brackets').insert({
      tournament_id: tournamentId,
      bracket_type: 'diretto',
      bracket: data,
      results: { current_fase: fasi[currentFase] },
      round: fasi[currentFase]
    });

    setLoadingSave(false);
    
    if (!error) {
      alert(`✅ ${titoliFasi[currentFase]} SALVATO PERMANENTEMENTE!`);
    } else {
      alert('❌ Errore: ' + error.message);
    }
  };

  useEffect(() => {
    const initData = async () => {
      const fetchIscrittiReali = async () => {
        try {
          const tournamentId = getTournamentId();
          let regs = tournamentId.length > 10 ? 
            (await supabase.from("tournament_registrations").select("display_name, player_name").eq("tournament_id", tournamentId)).data || [] :
            (await supabase.from("tournament_registrations").select("display_name, player_name").order("display_name").limit(16)).data || [];

          const nomiReali = regs.flatMap(r => [r.display_name, r.player_name])
            .filter(nome => nome && nome.trim().length > 1).map(nome => nome.trim()).slice(0, 16);
          setIscritti([...new Set(nomiReali)].sort());
          console.log('📋 ISCRITTI CARICATI:', [...new Set(nomiReali)].sort());
        } catch (error) {
          console.error('❌ Error iscritti:', error);
          setIscritti(["andrea", "antonio", "boverob", "cfalba", "Denny Test", "giose.rizzi"]);
        }
      };

      const caricaTabelloneSalvato = async () => {
        try {
          const tournamentId = getTournamentId();
          const { data: saved } = await supabase
            .from('padel_brackets')
            .select('bracket')
            .eq('tournament_id', tournamentId)
            .eq('round', fasi[currentFase])
            .single();

          if (saved?.bracket) {
            setData(saved.bracket);
            console.log('📂 TABELLONE CARICATO:', saved.bracket);
          }
        } catch (error) {
          console.log('ℹ️ Nessun tabellone salvato per questa fase');
        }
      };

      await Promise.all([fetchIscrittiReali(), caricaTabelloneSalvato()]);
    };

    initData();
  }, [currentFase]);

  // DRAG & DROP
  const handleDragStart = (e, giocatore) => {
    setDraggedGiocatore(giocatore);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, fase, index, squadra, giocatoreSlot) => {
    e.preventDefault();
    if (!draggedGiocatore) return;

    setData((prev) => {
      const newData = { ...prev };
      const oldData = JSON.parse(JSON.stringify(prev));
      setHistory((h) => [...h, { data: oldData, timestamp: new Date().toISOString() }]);

      const match = newData[fase][index];
      if (giocatoreSlot === "p1") match[squadra].p1 = draggedGiocatore;
      else if (giocatoreSlot === "p2") match[squadra].p2 = draggedGiocatore;

      return newData;
    });
    setDraggedGiocatore(null);
  };

  const handlePuntiChange = (fase, index, squadra, punti) => {
    setData(prev => {
      const newData = { ...prev };
      newData[fase][index][squadra].punti = punti;
      return newData;
    });
  };

  const resetFase = (fase) => {
    setData(prev => {
      const defaultMatch = { sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" } };
      const newData = { ...prev };
      newData[fase] = newData[fase].map((_, i) => ({ ...defaultMatch, id: i, campo: newData[fase][i]?.campo || "" }));
      return newData;
    });
  };

  const getNumeroMatches = (fase) => data[fase]?.length || 0;

  const esportaPDF = async () => {
    try {
      const bracket = bracketRef.current; if (!bracket) return alert("❌ Bracket non trovato");
      document.querySelector('[data-print="partecipanti"]')?.style.setProperty("display", "none");
      document.querySelector('[data-print="storico"]')?.style.setProperty("display", "none");
      await new Promise(r => setTimeout(r, 200));
      const canvas = await html2canvas(bracket, { scale: 1, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", width: 650 });
      const imgData = canvas.toDataURL("image/png"); const pdf = new jsPDF("l", "mm", "a4");
      pdf.setFontSize(22); pdf.setFont("helvetica", "bold"); pdf.text("🏓 TABELLONE PADEL", 148.5, 20, { align: "center" });
      pdf.setFontSize(16); pdf.text(titoliFasi[currentFase], 148.5, 35, { align: "center" });
      const pdfWidth = 260; const pdfHeight = ((canvas.height * pdfWidth) / canvas.width) * 0.9;
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

  // ======== JSX COMPLETO ========
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F5B] via-[#003A8F] to-[#001F5B] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium">
            <ArrowLeft size={20} /> <span>Torna indietro</span>
          </button>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">🏓 TORNEO PADEL</h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600"><Calendar size={16} /><span>22 Dic 2025</span></div>
          </div>
          <div className="w-12" />
        </div>

        {/* BOTTONI FASI */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50">
          {fasi.map((fase, index) => (
            <button key={fase} onClick={() => setCurrentFase(index)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${currentFase === index ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105" : "bg-white/70 hover:bg-white shadow-md text-gray-700 hover:scale-105"}`}>
              {titoliFasi[index]}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* PARTECIPANTI */}
          {isAdminOrSuper && showIscritti && (
            <div className="w-64 bg-white/90 rounded-2xl p-4 shadow-xl border border-white/50 hidden lg:block" data-print="partecipanti">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">📋 Partecipanti ({iscritti.length})</h2>
                <button onClick={() => setShowIscritti(false)} className="text-sm text-gray-500 hover:text-gray-700">X</button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {iscritti.map((giocatore, i) => (
                  <div key={i} className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-2 cursor-move hover:shadow-md border-2 border-transparent hover:border-emerald-300"
                       draggable onDragStart={(e) => handleDragStart(e, giocatore)}>
                    <div className="text-gray-800 font-semibold text-sm">{giocatore}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BRACKET */}
          <div ref={bracketRef} className="flex-1 w-full lg:w-auto bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/60 print:bg-white print:shadow-none relative overflow-hidden" data-print="bracket">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-white/95 to-gray-50/90"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 print:mb-4 print:flex-col print:items-start print:gap-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent print:text-2xl print:text-black">
                  {titoliFasi[currentFase]}
                </h2>
                <div className="flex items-center space-x-4 print:hidden">
                  <span className="text-lg font-bold text-gray-700">{getNumeroMatches(fasi[currentFase])} partite</span>
                  <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg" onClick={() => resetFase(fasi[currentFase])}>🔄 Reset</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data[fasi[currentFase]].map((match, matchIndex) => (
                  <div key={match.id} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 shadow-lg border border-gray-200 print:bg-white print:shadow-none print:border print:p-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-white text-lg bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 rounded-2xl w-28 h-12 flex items-center justify-center shadow-[0_0_0_2px_rgba(255,255,255,0.5)] border border-blue-400/70 tracking-wide">{match.campo}</div>
                      <button className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-xs font-bold rounded-lg print:hidden">Salva</button>
                    </div>
                    <div className="space-y-2">
                      {/* SQUADRA 1 */}
                      <div className="flex items-center justify-between p-2 border-b border-gray-300">
                        <div>
                          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-1 text-sm text-gray-500 cursor-pointer" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, fasi[currentFase], matchIndex, "sq1", "p1")}>
                            {match.sq1.p1 || "Trascina giocatore"}
                          </div>
                          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-1 text-sm text-gray-500 cursor-pointer mt-1" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, fasi[currentFase], matchIndex, "sq1", "p2")}>
                            {match.sq1.p2 || "Trascina giocatore"}
                          </div>
                        </div>
                        <input type="text" value={match.sq1.punti} onChange={(e) => handlePuntiChange(fasi[currentFase], matchIndex, "sq1", e.target.value)} className="w-16 px-2 py-1 border border-gray-300 rounded-xl text-sm font-mono text-center" placeholder="6-4" />
                      </div>

                      <div className="border-b border-gray-400 my-1" />

                      {/* SQUADRA 2 */}
                      <div className="flex items-center justify-between p-2 border-b border-gray-300">
                        <div>
                          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-1 text-sm text-gray-500 cursor-pointer" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, fasi[currentFase], matchIndex, "sq2", "p1")}>
                            {match.sq2.p1 || "Trascina giocatore"}
                          </div>
                          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-1 text-sm text-gray-500 cursor-pointer mt-1" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, fasi[currentFase], matchIndex, "sq2", "p2")}>
                            {match.sq2.p2 || "Trascina giocatore"}
                          </div>
                        </div>
                        <input type="text" value={match.sq2.punti} onChange={(e) => handlePuntiChange(fasi[currentFase], matchIndex, "sq2", e.target.value)} className="w-16 px-2 py-1 border border-gray-300 rounded-xl text-sm font-mono text-center" placeholder="4-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SALVA / PDF */}
              <div className="flex justify-end mt-6 gap-4 print:hidden">
                <button onClick={salvaTorneo} className={`px-6 py-3 rounded-xl font-bold text-white ${loadingSave ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"} shadow-md hover:shadow-lg`}>
                  {loadingSave ? "Salvando..." : "💾 Salva"}
                </button>
                <button onClick={esportaPDF} className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg">
                  🖨️ PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
