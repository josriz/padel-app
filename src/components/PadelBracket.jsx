// src/components/PadelBracket.jsx - Drag & Drop touch-friendly con @dnd-kit/core
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { ArrowLeft, Calendar } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "../supabaseClient";
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

  const [giocatoreSelezionato, setGiocatoreSelezionato] = useState(null);
  const [history, setHistory] = useState([]);
  const [showPrintBrackets, setShowPrintBrackets] = useState(false);
  const [printSize, setPrintSize] = useState(16);

  // 🔥 FUNZIONI SALVATAGGIO
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

  // ✅ useEffect CORRETTO con caricamento dati salvati
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
        } catch (error) {
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

          if (saved?.bracket) setData(saved.bracket);
        } catch (error) { }
      };

      await Promise.all([fetchIscrittiReali(), caricaTabelloneSalvato()]);
    };

    initData();
  }, [currentFase]);

  // ✅ DRAG & DROP TOUCH-FRIENDLY
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDropDnd = (giocatore, fase, matchIndex, squadra, slot) => {
    if (!giocatore) return;
    setData((prev) => {
      const newData = { ...prev };
      const oldData = JSON.parse(JSON.stringify(prev));
      setHistory((h) => [...h, { data: oldData, timestamp: new Date().toISOString() }]);
      newData[fase][matchIndex][squadra][slot] = giocatore;
      return newData;
    });
    setGiocatoreSelezionato(null);
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

  // 🔹 COMPONENTE DRAGGABLE PLAYER
  const DraggablePlayer = ({ id }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      marginBottom: "5px",
      cursor: "grab",
    };
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} onPointerDown={() => setGiocatoreSelezionato(id)}>
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-2 border-2 border-transparent hover:border-emerald-300 text-gray-800 font-semibold text-sm">{id}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F5B] via-[#003A8F] to-[#001F5B] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
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

        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50">
          {fasi.map((fase, index) => (
            <button key={fase} onClick={() => setCurrentFase(index)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${currentFase === index ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105" : "bg-white/70 hover:bg-white shadow-md text-gray-700 hover:scale-105"}`}>
              {titoliFasi[index]}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {isAdminOrSuper && showIscritti && (
            <div className="w-64 bg-white/90 rounded-2xl p-4 shadow-xl border border-white/50 hidden lg:block" data-print="partecipanti">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">📋 Partecipanti ({iscritti.length})</h2>
                <button onClick={() => setShowIscritti(false)} className="text-sm text-gray-500 hover:text-gray-700">X</button>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter}>
                <SortableContext items={iscritti} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {iscritti.map((giocatore) => (
                      <DraggablePlayer key={giocatore} id={giocatore} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Tabellone rimane invariato, basta sostituire onDrop con handleDropDnd */}
          {/* ... qui puoi sostituire tutti i div onDrop con: onPointerUp={() => handleDropDnd(giocatoreSelezionato, fase, matchIndex, squadra, slot)} */}
        </div>
      </div>
    </div>
  );
}
