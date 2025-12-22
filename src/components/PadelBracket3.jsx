import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { ArrowLeft, Calendar } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PadelBracket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentFase, setCurrentFase] = useState(0);
  const [showIscritti, setShowIscritti] = useState(true);
  const bracketRef = useRef(null);

  const fasi = ['ottavi', 'quarti', 'semi', 'finale', 'ripescaggi'];
  const titoliFasi = ['OTTAVI', 'QUARTI', 'SEMIFINALI', 'FINALE', '🛡️ RIPESTAGGI'];

  const iscritti = [
    "Luca Bianchi", "Marco Verdi", "Giovanni Rossi", "Antonio Nero",
    "Paolo Azzurri", "Roberto Verdi", "Stefano Gialli", "Davide Blu",
    "Giulia Rosa", "Sara Viola", "Elena Arancio", "Chiara Verde"
  ];

  const [data, setData] = useState({
    ottavi: Array(8).fill().map((_, i) => ({
      id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `${i+1}`
    })),
    quarti: Array(4).fill().map((_, i) => ({
      id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `${i+9}`
    })),
    semi: Array(2).fill().map((_, i) => ({
      id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `${i+13}`
    })),
    finale: [{ id: 0, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: "🏆" }],
    ripescaggi: Array(4).fill().map((_, i) => ({
      id: i, sq1: { p1: "", p2: "", punti: "" }, sq2: { p1: "", p2: "", punti: "" }, campo: `R${i+1}`
    }))
  });

  const [draggedGiocatore, setDraggedGiocatore] = useState(null);
  const [history, setHistory] = useState([]);

  // ✅ PDF corretto e leggibile
  const esportaPDF = async () => {
    try {
      const bracket = bracketRef.current;
      if (!bracket) return alert('❌ Bracket non trovato');

      document.querySelector('[data-print="partecipanti"]')?.style.setProperty('display', 'none');
      document.querySelector('[data-print="storico"]')?.style.setProperty('display', 'none');

      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(bracket, {
        scale: 2, // ↑ più nitido
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');

      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🏓 TABELLONE PADEL', 148.5, 20, { align: 'center' });

      pdf.setFontSize(16);
      pdf.text(titoliFasi[currentFase], 148.5, 35, { align: 'center' });

      const pdfWidth = 260;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 18, 50, pdfWidth, pdfHeight);

      pdf.save(`tabellone-${fasi[currentFase]}.pdf`);
      alert('✅ PDF generato correttamente!');

    } catch (error) {
      alert('❌ Errore: ' + error.message);
    } finally {
      document.querySelector('[data-print="partecipanti"]')?.style.setProperty('display', 'block');
      document.querySelector('[data-print="storico"]')?.style.setProperty('display', 'block');
    }
  };

  const handleDragStart = (e, giocatore) => {
    setDraggedGiocatore(giocatore);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, fase, index, squadra, giocatoreSlot) => {
    e.preventDefault();
    if (!draggedGiocatore) return;
    setData(prev => {
      const newData = { ...prev };
      const oldData = JSON.parse(JSON.stringify(prev));
      setHistory(h => [...h, { data: oldData, timestamp: new Date().toISOString() }]);
      const match = newData[fase][index];
      match[squadra][giocatoreSlot] = draggedGiocatore;
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
      newData[fase] = newData[fase].map((_, i) => ({ ...defaultMatch, id: i, campo: newData[fase][i]?.campo || '' }));
      return newData;
    });
  };

  const getNumeroMatches = (fase) => data[fase]?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium">
            <ArrowLeft size={20} /><span>Torna indietro</span>
          </button>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
              🏓 TORNEO PADEL
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <Calendar size={16} /><span>22 Dic 2025</span>
            </div>
          </div>
          <div className="w-12" />
        </div>

        {/* Fasi */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white rounded-2xl p-4 shadow-md border border-gray-200">
          {fasi.map((fase, index) => (
            <button
              key={fase}
              onClick={() => setCurrentFase(index)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                currentFase === index
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {titoliFasi[index]}
            </button>
          ))}
        </div>

        {/* Bracket */}
        <div ref={bracketRef} className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 min-h-[400px]" data-print="bracket">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{titoliFasi[currentFase]}</h2>
          <div className="space-y-6">
            {data[fasi[currentFase]].map((match, matchIndex) => (
              <div key={match.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-lg">Campo {match.campo}</div>
                  <div className="text-sm text-gray-500">Partita {matchIndex + 1}</div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {['sq1','sq2'].map((sq) => (
                    <div key={sq} className="space-y-2">
                      <div className="font-semibold">{sq === 'sq1' ? 'Squadra 1' : 'Squadra 2'}</div>
                      <div className="flex space-x-2">
                        {['p1','p2'].map(p => (
                          <div
                            key={p}
                            className="flex-1 h-10 bg-white border border-gray-300 rounded flex items-center justify-center text-sm cursor-pointer"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, fasi[currentFase], matchIndex, sq, p)}
                          >
                            {match[sq][p] || 'Trascina'}
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={match[sq].punti}
                        onChange={(e) => handlePuntiChange(fasi[currentFase], matchIndex, sq, e.target.value)}
                        className="w-full border border-gray-300 rounded p-1 text-sm"
                        placeholder="6-4"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pulsanti */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button onClick={esportaPDF} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg">
            📤 Esporta PDF
          </button>
        </div>
      </div>
    </div>
  );
}
