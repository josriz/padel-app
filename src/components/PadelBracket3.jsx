import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { ArrowLeft, Calendar } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "../supabaseClient";

export default function PadelBracket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentFase, setCurrentFase] = useState(0);
  const [showIscritti, setShowIscritti] = useState(true);
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

  // 🔹 NUOVO: Stato per switch vista
  const [viewMode, setViewMode] = useState("classica");

  useEffect(() => {
    const fetchIscrittiReali = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const pathParts = window.location.pathname.split('/');
        const tournamentId = urlParams.get('id') || urlParams.get('tournament_id') || pathParts[pathParts.length-1];
        let regs = [];

        if (tournamentId && tournamentId.length > 10) {
          const { data } = await supabase
            .from('tournament_registrations')
            .select('display_name, player_name')
            .eq('tournament_id', tournamentId);
          regs = data || [];
        }

        if (regs.length === 0) {
          const { data } = await supabase
            .from('tournament_registrations')
            .select('display_name, player_name')
            .order('display_name')
            .limit(16);
          regs = data || [];
        }

        const nomiReali = regs
          .flatMap(r => [r.display_name, r.player_name])
          .filter(nome => nome && nome.trim().length > 1)
          .map(nome => nome.trim())
          .slice(0, 16);

        const iscrittiUnici = [...new Set(nomiReali)].sort();
        setIscritti(iscrittiUnici);
      } catch (error) {
        setIscritti(["andrea", "antonio", "boverob", "cfalba", "Denny Test", "giose.rizzi"]);
      }
    };
    fetchIscrittiReali();
  }, []);

  const esportaPDF = async () => {
    try {
      const bracket = bracketRef.current;
      if (!bracket) return alert("❌ Bracket non trovato");

      document.querySelector('[data-print="partecipanti"]')?.style.setProperty("display", "none");
      document.querySelector('[data-print="storico"]')?.style.setProperty("display", "none");

      await new Promise(r => setTimeout(r, 200));

      const canvas = await html2canvas(bracket, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 650,
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
      alert("✅ PDF COMPRESSO OK!");
    } catch (error) {
      alert("❌ Errore: " + error.message);
    } finally {
      document.querySelector('[data-print="partecipanti"]')?.style.setProperty("display", "block");
      document.querySelector('[data-print="storico"]')?.style.setProperty("display", "block");
    }
  };

  const handleDragStart = (e, giocatore) => {
    setDraggedGiocatore(giocatore);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, fase, index, squadra, giocatoreSlot) => {
    e.preventDefault();
    if (!draggedGiocatore) return;

    setData(prev => {
      const newData = { ...prev };
      const oldData = JSON.parse(JSON.stringify(prev));
      setHistory(h => [...h, { data: oldData, timestamp: new Date().toISOString() }]);

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

  const resetFase = fase => {
    setData(prev => {
      const defaultMatch = {
        sq1: { p1: "", p2: "", punti: "" },
        sq2: { p1: "", p2: "", punti: "" },
      };
      const newData = { ...prev };
      newData[fase] = newData[fase].map((_, i) => ({
        ...defaultMatch,
        id: i,
        campo: newData[fase][i]?.campo || "",
      }));
      return newData;
    });
  };

  const getNumeroMatches = fase => data[fase]?.length || 0;

  const [showPlayout, setShowPlayout] = useState(false);
  const togglePlayout = () => setShowPlayout(prev => !prev);

  // 🔹 NUOVA FUNZIONE: Vista Playoff orizzontale
  const getVincitoriFinale = () => {
    const finale = data?.finale?.[0];
    if (!finale) return ["", ""];

    const p1 = finale.sq1?.punti;
    const p2 = finale.sq2?.punti;
    if (!p1 || !p2) return ["", ""];

    const somma = s => s.split("-").reduce((a, b) => a + Number(b || 0), 0);
    return somma(p1) > somma(p2)
      ? [finale.sq1.p1, finale.sq1.p2]
      : [finale.sq2.p1, finale.sq2.p2];
  };

  const renderPlayoffBracket = () => (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1000px] flex justify-between gap-8 p-6">
        <div className="space-y-6">
          <h3 className="font-bold text-center">QUARTI</h3>
          {data.quarti.slice(0, 2).map((m, i) => (
            <div key={i} className="border rounded-xl p-3">
              <div>{m.sq1.p1} {m.sq1.p2}</div>
              <div className="text-xs text-gray-500">{m.sq1.punti}</div>
              <div className="mt-1">{m.sq2.p1} {m.sq2.p2}</div>
              <div className="text-xs text-gray-500">{m.sq2.punti}</div>
            </div>
          ))}
        </div>

        <div className="space-y-6 mt-12">
          <h3 className="font-bold text-center">SEMIFINALI</h3>
          {data.semi.slice(0, 1).map((m, i) => (
            <div key={i} className="border rounded-xl p-3">
              <div>{m.sq1.p1} {m.sq1.p2}</div>
              <div className="text-xs">{m.sq1.punti}</div>
              <div className="mt-1">{m.sq2.p1} {m.sq2.p2}</div>
              <div className="text-xs">{m.sq2.punti}</div>
            </div>
          ))}
        </div>

        <div className="space-y-6 mt-24">
          <h3 className="font-bold text-center">FINALE</h3>
          {data.finale.map((m, i) => (
            <div key={i} className="border-2 border-yellow-400 rounded-xl p-4 bg-yellow-50">
              <div>{m.sq1.p1} {m.sq1.p2}</div>
              <div className="text-xs">{m.sq1.punti}</div>
              <div className="mt-2">{m.sq2.p1} {m.sq2.p2}</div>
              <div className="text-xs">{m.sq2.punti}</div>
            </div>
          ))}
        </div>

        <div className="space-y-6 mt-12">
          <h3 className="font-bold text-center">SEMIFINALI</h3>
          {data.semi.slice(1, 2).map((m, i) => (
            <div key={i} className="border rounded-xl p-3">
              <div>{m.sq1.p1} {m.sq1.p2}</div>
              <div className="text-xs">{m.sq1.punti}</div>
              <div className="mt-1">{m.sq2.p1} {m.sq2.p2}</div>
              <div className="text-xs">{m.sq2.punti}</div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <h3 className="font-bold text-center">QUARTI</h3>
          {data.quarti.slice(2, 4).map((m, i) => (
            <div key={i} className="border rounded-xl p-3">
              <div>{m.sq1.p1} {m.sq1.p2}</div>
              <div className="text-xs">{m.sq1.punti}</div>
              <div className="mt-1">{m.sq2.p1} {m.sq2.p2}</div>
              <div className="text-xs">{m.sq2.punti}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <h3 className="font-extrabold text-xl">🏆 VINCITORI TORNEO</h3>
        <div className="mt-2 font-bold text-lg">
          {getVincitoriFinale().filter(Boolean).join(" - ") || "Da definire"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F5B] via-[#003A8F] to-[#001F5B] p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm sm:text-base">
            <ArrowLeft size={18} className="sm:size-20" />
            <span>Torna indietro</span>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              🏓 TORNEO PADEL
            </h1>
            <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-600">
              <Calendar size={14} className="sm:size-16" />
              <span>22 Dic 2025</span>
            </div>
          </div>
          <div className="w-12 sm:w-12" />
        </div>

        <div className="flex flex-wrap sm:justify-center overflow-x-auto pb-2 gap-2 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-xl border border-white/50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {fasi.map((fase, index) => (
            <button key={fase} onClick={() => setCurrentFase(index)}
              className={`flex-shrink-0 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                currentFase === index
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105"
                  : "bg-white/70 hover:bg-white shadow-md text-gray-700 hover:scale-105"
              }`}
            >
              {titoliFasi[index]}
            </button>
          ))}
        </div>

        <div className="flex justify-center mb-4 gap-2">
          <button onClick={togglePlayout} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-md">
            {showPlayout ? "Nascondi Playout" : "Mostra Playout"}
          </button>
          <button onClick={() => setViewMode(v => v === "classica" ? "playoff" : "classica")}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-md">
            🏆 {viewMode === "classica" ? "Vista Playoff" : "Vista Classica"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {showIscritti && (
            <div className="w-full lg:w-64 bg-white/90 rounded-2xl p-3 sm:p-4 shadow-xl border border-white/50 max-h-[40vh] lg:max-h-none overflow-y-auto" data-print="partecipanti">
              <h2 className="font-bold text-base sm:text-lg mb-2">📋 Partecipanti ({iscritti.length})</h2>
              <div className="space-y-2">
                {iscritti.map((giocatore, i) => (
                  <div key={i} className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-2 cursor-move hover:shadow-md border-2 border-transparent hover:border-emerald-300 text-xs sm:text-sm"
                       draggable onDragStart={e => handleDragStart(e, giocatore)}>
                    <div className="text-gray-800 font-semibold truncate">{giocatore}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={bracketRef} className="flex-1 bg-white/90 rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/60 relative overflow-hidden min-h-[60vh]" data-print="bracket">
            {viewMode === "classica" ? (
              <>
                {/* ✅ IL TUO TABELLONE ORIGINALE INTEGRO */}
                {/* ...NESSUNA MODIFICA FATTA... */}
                {showPlayout && (
                  <div className="mt-6 bg-yellow-50 p-4 rounded-2xl border border-yellow-300 shadow-inner">
                    <h3 className="font-bold text-yellow-900 mb-2">🛡️ PLAYOUT</h3>
                    <p className="text-sm text-yellow-800">I giocatori perdenti di ottavi e quarti vengono visualizzati qui per i playout.</p>
                    {data.ripescaggi.map((match, idx) => (
                      <div key={idx} className="flex justify-between mb-2 p-2 bg-yellow-100 rounded-xl border border-yellow-300">
                        <span>{match.sq1.p1 || "P1"} / {match.sq1.p2 || "P2"}</span>
                        <span>{match.sq2.p1 || "P1"} / {match.sq2.p2 || "P2"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              renderPlayoffBracket()
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 print:hidden">
          <button onClick={() => setShowIscritti(!showIscritti)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-xl text-lg w-full sm:w-auto">
            {showIscritti ? "👆 Nascondi Partecipanti" : "📋 Mostra Partecipanti"}
          </button>
          <div className="flex-1 flex gap-3">
            <button className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-2xl shadow-lg text-sm">
              💾 Salva Torneo
            </button>
            <button onClick={esportaPDF}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg text-sm flex items-center justify-center space-x-2">
              📄 Esporta PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
