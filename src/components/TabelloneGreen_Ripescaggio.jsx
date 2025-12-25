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

  const fasi = ["gironi", "quarti", "semi", "finale", "ripescaggi"];
  const titoliFasi = ["GIRONI", "QUARTI", "SEMIFINALI", "FINALE", "🛡️ RIPESCAGGI"];

  const [iscritti, setIscritti] = useState([]);
  const [data, setData] = useState({
    gironi: [
      {
        nome: "Girone A",
        matches: [
          { id: 1, campo: "Campo 2", sq1: { p1: "Zagaria", p2: "Prisciandaro", punti: "" }, sq2: { p1: "Bove R.", p2: "Romita", punti: "" } },
          { id: 2, campo: "Campo 3", sq1: { p1: "Smaldino", p2: "Stanzione", punti: "" }, sq2: { p1: "Canonico", p2: "Cillo", punti: "" } },
          { id: 3, campo: "Campo 2", sq1: { p1: "Zagaria", p2: "Prisciandaro", punti: "" }, sq2: { p1: "Canonico", p2: "Cillo", punti: "" } },
          { id: 4, campo: "Campo 3", sq1: { p1: "Smaldino", p2: "Stanzione", punti: "" }, sq2: { p1: "Bove R.", p2: "Romita", punti: "" } },
          { id: 5, campo: "Campo 2", sq1: { p1: "Zagaria", p2: "Prisciandaro", punti: "" }, sq2: { p1: "Smaldino", p2: "Stanzione", punti: "" } },
          { id: 6, campo: "Campo 3", sq1: { p1: "Canonico", p2: "Cillo", punti: "" }, sq2: { p1: "Bove R.", p2: "Romita", punti: "" } },
        ]
      },
      {
        nome: "Girone B",
        matches: [
          { id: 1, campo: "Campo 4", sq1: { p1: "Marzano", p2: "Saracino", punti: "" }, sq2: { p1: "Avellino", p2: "Ferrari", punti: "" } },
          { id: 2, campo: "Campo 5", sq1: { p1: "Scavo", p2: "De Vito", punti: "" }, sq2: { p1: "Bove N.", p2: "Carbonara", punti: "" } },
          { id: 3, campo: "Campo 4", sq1: { p1: "Scavo", p2: "De Vito", punti: "" }, sq2: { p1: "Avellino", p2: "Ferrari", punti: "" } },
          { id: 4, campo: "Campo 5", sq1: { p1: "Marzano", p2: "Saracino", punti: "" }, sq2: { p1: "Bove N.", p2: "Carbonara", punti: "" } },
          { id: 5, campo: "Campo 4", sq1: { p1: "Bove N.", p2: "Carbonara", punti: "" }, sq2: { p1: "Avellino", p2: "Ferrari", punti: "" } },
          { id: 6, campo: "Campo 5", sq1: { p1: "Marzano", p2: "Saracino", punti: "" }, sq2: { p1: "Scavo", p2: "De Vito", punti: "" } },
        ]
      },
      {
        nome: "Girone C",
        matches: [
          { id: 1, campo: "Campo 12", sq1: { p1: "Romano", p2: "Corchia", punti: "" }, sq2: { p1: "Cassano", p2: "Caiati", punti: "" } },
          { id: 2, campo: "Campo 13", sq1: { p1: "Francioso", p2: "Falba", punti: "" }, sq2: { p1: "Ricco", p2: "Indiveri", punti: "" } },
          { id: 3, campo: "Campo 12", sq1: { p1: "Romano", p2: "Corchia", punti: "" }, sq2: { p1: "Francioso", p2: "Falba", punti: "" } },
          { id: 4, campo: "Campo 13", sq1: { p1: "Ricco", p2: "Indiveri", punti: "" }, sq2: { p1: "Cassano", p2: "Caiati", punti: "" } },
          { id: 5, campo: "Campo 12", sq1: { p1: "Romano", p2: "Corchia", punti: "" }, sq2: { p1: "Ricco", p2: "Indiveri", punti: "" } },
          { id: 6, campo: "Campo 13", sq1: { p1: "Francioso", p2: "Falba", punti: "" }, sq2: { p1: "Cassano", p2: "Caiati", punti: "" } },
        ]
      },
      {
        nome: "Girone D",
        matches: [
          { id: 1, campo: "Campo 11", sq1: { p1: "Mastromauro", p2: "Pierno", punti: "" }, sq2: { p1: "Bove M.", p2: "Borracci", punti: "" } },
          { id: 2, campo: "Campo 14", sq1: { p1: "Quaranta", p2: "Rizzi", punti: "" }, sq2: { p1: "Crisci", p2: "Santantonio", punti: "" } },
          { id: 3, campo: "Campo 11", sq1: { p1: "Mastromauro", p2: "Pierno", punti: "" }, sq2: { p1: "Quaranta", p2: "Rizzi", punti: "" } },
          { id: 4, campo: "Campo 14", sq1: { p1: "Crisci", p2: "Santantonio", punti: "" }, sq2: { p1: "Bove M.", p2: "Borracci", punti: "" } },
          { id: 5, campo: "Campo 11", sq1: { p1: "Mastromauro", p2: "Pierno", punti: "" }, sq2: { p1: "Crisci", p2: "Santantonio", punti: "" } },
          { id: 6, campo: "Campo 14", sq1: { p1: "Quaranta", p2: "Rizzi", punti: "" }, sq2: { p1: "Bove M.", p2: "Borracci", punti: "" } },
        ]
      }
    ],
    quarti: Array(8).fill().map((_, i) => ({ id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `Campo ${i + 1}` })),
    semi: Array(4).fill().map((_, i) => ({ id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `Campo ${i + 9}` })),
    finale: [{ id: 0, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: "🏆 Finale" }],
    ripescaggi: Array(4).fill().map((_, i) => ({ id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `R${i + 1}` })),
  });

  const [draggedGiocatore, setDraggedGiocatore] = useState(null);
  const [history, setHistory] = useState([]);
  const [vincitori, setVincitori] = useState({ p1: "", p2: "" });

  const esportaPDF = async () => {
    if (!bracketRef.current) return;
    document.querySelector('[data-print="partecipanti"]')?.style.setProperty("display", "none");
    document.querySelector('[data-print="storico"]')?.style.setProperty("display", "none");
    const canvas = await html2canvas(bracketRef.current, { scale: 0.15, useCORS: true, allowTaint: true, backgroundColor: "#fff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    pdf.addImage(imgData, "PNG", 10, 30, 270, 170);
    pdf.save(`tabellone-${fasi[currentFase]}.pdf`);
    document.querySelector('[data-print="partecipanti"]')?.style.setProperty("display", "block");
    document.querySelector('[data-print="storico"]')?.style.setProperty("display", "block");
  };

  const salvaTorneo = async () => {
    const tournamentId = new URLSearchParams(window.location.search).get("id") || window.location.pathname.split("/").pop();
    if (!tournamentId) return alert("❌ ID torneo non trovato!");
    try {
      const { error } = await supabase.from("tournament_brackets").upsert({
        id: tournamentId,
        data: data,
        fase: fasi[currentFase],
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      alert("✅ SALVATO!");
    } catch (e) {
      alert("❌ Errore: " + e.message);
    }
  };

  useEffect(() => {
    const finale = data.finale[0];
    if (finale.sq1.p1 && finale.sq1.p2 && finale.sq2.p1 && finale.sq2.p2) {
      const punti1 = parseInt(finale.sq1.punti) || 0;
      const punti2 = parseInt(finale.sq2.punti) || 0;
      setVincitori(punti1 > punti2 ? finale.sq1 : finale.sq2);
    }
  }, [data.finale]);

  const handleDragStart = (e, giocatore) => {
    setDraggedGiocatore(giocatore);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = e => e.preventDefault();

  const handleDrop = (e, fase, matchIndex, squadra, slot) => {
    e.preventDefault();
    if (!draggedGiocatore) return;
    setData(prev => {
      const newData = { ...prev };
      const match = newData[fase][matchIndex];
      match[squadra][slot] = draggedGiocatore;
      setHistory(h => [...h, { data: JSON.parse(JSON.stringify(prev)), timestamp: new Date().toISOString() }]);
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
      const newData = { ...prev };
      newData[fase] = newData[fase].map(m => ({ ...m, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" } }));
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F5B] via-[#003A8F] to-[#001F5B] p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm sm:text-base">
            <ArrowLeft size={18} />
            <span>Torna indietro</span>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              🏓 TORNEO PADEL
            </h1>
            <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-600">
              <Calendar size={14} />
              <span>22 Dic 2025</span>
            </div>
          </div>
          <div className="w-12 sm:w-12" />
        </div>

        {/* Pulsanti Fasi */}
        <div className="flex flex-wrap sm:justify-center overflow-x-auto pb-2 gap-2 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-xl border border-white/50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {fasi.map((fase, index) => (
            <button
              key={fase}
              onClick={() => setCurrentFase(index)}
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

        {/* Contenitore iscritti e tabellone */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Lista iscritti */}
          {showIscritti && (
            <div className="w-full lg:w-64 bg-white/90 rounded-2xl p-3 sm:p-4 shadow-xl border border-white/50 max-h-[40vh] lg:max-h-none overflow-y-auto" data-print="partecipanti">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="font-bold text-base sm:text-lg">📋 Partecipanti ({iscritti.length})</h2>
                <button onClick={() => setShowIscritti(false)} className="text-sm text-gray-500 hover:text-gray-700">X</button>
              </div>
              <div className="space-y-2">
                {iscritti.map((giocatore, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-2 cursor-move hover:shadow-md border-2 border-transparent hover:border-emerald-300 text-xs sm:text-sm"
                    draggable
                    onDragStart={e => handleDragStart(e, giocatore)}
                  >
                    <div className="text-gray-800 font-semibold truncate">{giocatore}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabellone */}
          <div ref={bracketRef} className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl p-3 sm:p-4 md:p-6 shadow-2xl border border-white/60 print:bg-white print:shadow-none relative overflow-hidden min-h-[60vh]">
            {/* QUI VAI A POPOLARE IL TABELLONE GIRONI E MATCHES COME NELLO STATO DATA */}
          </div>
        </div>
      </div>
    </div>
  );
}
