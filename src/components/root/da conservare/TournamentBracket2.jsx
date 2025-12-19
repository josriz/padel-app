// src/components/TournamentBracketAvanzato.jsx - ✅ TUO LAYOUT ESATTO!
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { RefreshCw, Users, Clock } from "lucide-react";

export default function TournamentBracketAvanzato({ tournamentId }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMatches, setActiveMatches] = useState([]);
  const [restingTeam, setRestingTeam] = useState("");

  // TUOI DATI DEMO nel tuo stile
  useEffect(() => {
    setActiveMatches([
      { campo: "Campo 1", team1: "Rizzi/Bianchi", team2: "Neri/Giallo", score: "6-2" },
      { campo: "Campo 2", team1: "Azzurra/Rosa", team2: "Viola/Arancio", score: "6-4" },
      { campo: "Campo 3", team1: "Nero/Grigio", team2: "Verde/Rossa", score: "6-3" },
      { campo: "Campo 4", team1: "Rossi/Verdi", team2: "Blu/Marrone", score: "4-6" }
    ]);
    setRestingTeam("Giallo/Celeste");
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <RefreshCw className="animate-spin mr-2 w-8 h-8 text-blue-600" />
        <span className="text-lg font-semibold text-gray-700">Caricamento tabellone...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER TUO STILE */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Tabellone Attivo (4 Campi)</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          18 Giocatori
        </div>
      </div>

      {/* GRID TUO STILE md:grid-cols-2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CAMPI ATTIVI - TUO CARD STYLE */}
        {activeMatches.map((match, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-sm text-gray-900">{match.campo}</span>
              <span className="px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                {match.score}
              </span>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {match.team1} <span className="text-blue-600 font-bold">vs</span> {match.team2}
            </div>
          </div>
        ))}
      </div>

      {/* RIPOSO - TUO CARD STYLE */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-orange-500" />
          <h4 className="font-semibold text-gray-900">Squadra in Riposo</h4>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="font-bold text-lg text-gray-900 mb-1">{restingTeam}</p>
          <p className="text-xs text-gray-500">Entrerà nel prossimo turno</p>
        </div>
      </div>

      {/* TUOI BOTTONI - STILE IDENTICO */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button className="px-4 py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all flex-1">
          🔄 Rotazione Campi
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex-1">
          ▶️ Avanza Playoff
        </button>
      </div>
    </div>
  );
}
