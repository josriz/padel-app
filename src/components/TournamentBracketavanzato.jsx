import React, { useState, useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function TournamentBracket({ tournamentId }) {
  const [participants, setParticipants] = useState([]);
  const [bracket, setBracket] = useState([]);
  const [currentPhase, setCurrentPhase] = useState("Primo Turno");
  const [isLoaded, setIsLoaded] = useState(false);
  const [tournamentWinner, setTournamentWinner] = useState(null);
  const [status, setStatus] = useState("Caricando...");
  const [history, setHistory] = useState([]);
  const [tournamentType, setTournamentType] = useState("direct"); // direct o advanced

  // --- FUNZIONI ORIGINALI ---
  const ensureTournamentExists = async () => {
    if (!tournamentId) return;
    const { data } = await supabase
      .from("tournaments")
      .select("id")
      .eq("id", tournamentId)
      .single();
    if (!data) {
      await supabase.from("tournaments").insert({
        id: tournamentId,
        created_at: new Date().toISOString(),
      });
    }
  };

  const saveToSupabase = async (message = "Salvato") => {
    setStatus("💾 Salvando...");
    try {
      const { error } = await supabase
        .from("tournament_brackets")
        .upsert(
          {
            tournament_id: tournamentId,
            bracket,
            phase: currentPhase,
            history,
            winner_team: tournamentWinner,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "tournament_id" }
        );
      if (!error) setStatus(`✅ ${message}`);
    } catch {
      setStatus("❌ Errore Supabase");
    }
  };

  const fetchRealParticipants = async () => {
    const { data } = await supabase
      .from("tournament_registrations")
      .select("id, user_id, full_name, display_name")
      .eq("tournament_id", tournamentId);
    if (data?.length) {
      setParticipants(
        data.slice(0, 20).map((r, i) => ({
          id: r.user_id,
          fullName: r.full_name || r.display_name || `Giocatore ${i + 1}`,
        }))
      );
    }
  };

  const goBackPhase = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setBracket([...last.bracket]);
    setCurrentPhase(last.phase);
    setTournamentWinner(last.winner || null);
    setHistory((prev) => prev.slice(0, -1));
    setTimeout(() => saveToSupabase("Indietro fase"), 500);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, matchIdx, teamIdx) => {
    e.preventDefault();
    const player = JSON.parse(e.dataTransfer.getData("text/plain"));
    const updated = bracket.map(m => ({ ...m, teams: m.teams ? m.teams.map(t => [...t]) : [[], []] }));
    if (!updated[matchIdx].teams[teamIdx]) updated[matchIdx].teams[teamIdx] = [];
    if (updated[matchIdx].teams[teamIdx].length < 2) {
      updated[matchIdx].teams[teamIdx].push(player);
      setBracket(updated);
      setTimeout(() => saveToSupabase("Giocatore OK"), 500);
    }
  };

  const removePlayerFromTeam = (matchIdx, teamIdx, playerIdx) => {
    const updated = bracket.map(m => ({ ...m, teams: m.teams ? m.teams.map(t => [...t]) : [[], []] }));
    if (updated[matchIdx]?.teams[teamIdx]) {
      updated[matchIdx].teams[teamIdx].splice(playerIdx, 1);
      setBracket(updated);
      setTimeout(() => saveToSupabase("Rimosso OK"), 500);
    }
  };

  const handleScoreChange = (matchIdx, teamIdx, value) => {
    const updated = bracket.map(m => ({ ...m }));
    if (!updated[matchIdx].scores) updated[matchIdx].scores = ["", ""];
    updated[matchIdx].scores[teamIdx] = value;
    updated[matchIdx].score = updated[matchIdx].scores.join("-");
    setBracket(updated);
    setTimeout(() => saveToSupabase("Punteggio OK"), 500);
  };

  const getWinnersFromMatch = (match) => {
    if (!match?.scores || match.scores.some(s => !s)) return [];
    const [a, b] = match.scores.map(s => parseInt(s) || 0);
    if (a > b) return match.teams?.[0] || [];
    if (b > a) return match.teams?.[1] || [];
    return [];
  };

  const getScoreDiff = (match, teamIdx) => {
    if (!match?.scores || match.scores.some(s => !s)) return 0;
    const [a, b] = match.scores.map(s => parseInt(s) || 0);
    return teamIdx === 0 ? a - b : b - a;
  };

  // --- LOGICA AVANZAMENTO FASI (DIRETTO O RIPESCAGGIO) ---
  const advancePhase = () => {
    setHistory(prev => [...prev, { phase: currentPhase, bracket: bracket.map(m => ({ ...m, teams: m.teams?.map(t => [...t]) || [[],[]] })), winner: tournamentWinner }]);

    if (tournamentType === "direct") {
      advancePhaseDirect();
    } else {
      advancePhaseAdvanced();
    }
  };

  const advancePhaseDirect = () => {
    // logica classica eliminazione diretta
    if (currentPhase === "Primo Turno") {
      setBracket([
        { id:0, field:1, teams:[getWinnersFromMatch(bracket[0]), getWinnersFromMatch(bracket[1])], scores:["",""], score:"", phase:"Quarti" },
        { id:1, field:2, teams:[getWinnersFromMatch(bracket[2]), getWinnersFromMatch(bracket[3])], scores:["",""], score:"", phase:"Quarti" },
      ]);
      setCurrentPhase("Quarti");
    } else if (currentPhase === "Quarti") {
      setBracket([{ id:0, field:1, teams:[getWinnersFromMatch(bracket[0]), getWinnersFromMatch(bracket[1])], scores:["",""], score:"", phase:"Finale" }]);
      setCurrentPhase("Finale");
    } else if (currentPhase === "Finale") {
      const champs = getWinnersFromMatch(bracket[0]);
      if (champs.length === 2) setTournamentWinner(champs);
    }
    saveToSupabase("Avanzata OK");
  };

  const advancePhaseAdvanced = () => {
    if (currentPhase === "Primo Turno") {
      // vincitori e perdenti
      const winners = [];
      const losers = [];
      bracket.forEach(match => {
        const [teamA, teamB] = match.teams;
        const [scoreA, scoreB] = match.scores.map(s => parseInt(s)||0);
        if (!teamA.length || !teamB.length) return;
        if (scoreA > scoreB) {
          winners.push(teamA.map(p=>({...p,status:"avanzato"})));
          losers.push({ team: teamB.map(p=>({...p,status:"eliminato"})), diff: scoreB - scoreA });
        } else {
          winners.push(teamB.map(p=>({...p,status:"avanzato"})));
          losers.push({ team: teamA.map(p=>({...p,status:"eliminato"})), diff: scoreA - scoreB });
        }
      });
      // ripescaggio ordinato
      losers.sort((a,b)=>b.diff-a.diff);
      const ripescaggioMatches = [];
      const half = Math.floor(losers.length/2);
      for(let i=0;i<half;i++){
        ripescaggioMatches.push({
          id:i,
          field:i+1,
          teams:[
            losers[i].team.map(p=>({...p,status:"ripescato"})),
            losers[losers.length-1-i].team.map(p=>({...p,status:"ripescato"}))
          ],
          scores:["",""],
          score:"",
          phase:"Ripescaggio"
        });
      }
      setBracket(ripescaggioMatches);
      setCurrentPhase("Ripescaggio");
      saveToSupabase("Ripescaggio generato");
    }
    else if(currentPhase==="Ripescaggio"){
      const winners = bracket.flatMap(getWinnersFromMatch).map(p=>({...p,status:"ripescato"}));
      const remaining = participants.filter(p=>!winners.some(w=>w.id===p.id));
      const allTeams = [...winners,...remaining];
      const ottavi = [];
      for(let i=0;i<8;i++){
        ottavi.push({
          id:i,
          field:i+1,
          teams:[allTeams.slice(i*2,i*2+1), allTeams.slice(i*2+1,i*2+2)],
          scores:["",""],
          score:"",
          phase:"Ottavi"
        });
      }
      setBracket(ottavi);
      setCurrentPhase("Ottavi");
      saveToSupabase("Ottavi generati");
    }
    else if(currentPhase==="Ottavi"){
      setBracket([
        { id:0, field:1, teams:[getWinnersFromMatch(bracket[0]), getWinnersFromMatch(bracket[1])], scores:["",""], score:"", phase:"Quarti" },
        { id:1, field:2, teams:[getWinnersFromMatch(bracket[2]), getWinnersFromMatch(bracket[3])], scores:["",""], score:"", phase:"Quarti" },
      ]);
      setCurrentPhase("Quarti");
      saveToSupabase("Quarti generati");
    }
    else if(currentPhase==="Quarti"){
      setBracket([{ id:0, field:1, teams:[getWinnersFromMatch(bracket[0]), getWinnersFromMatch(bracket[1])], scores:["",""], score:"", phase:"Finale" }]);
      setCurrentPhase("Finale");
      saveToSupabase("Finale generato");
    }
    else if(currentPhase==="Finale"){
      const champs = getWinnersFromMatch(bracket[0]);
      if(champs.length===2) setTournamentWinner(champs);
      saveToSupabase("Torneo completato");
    }
  };

  const resetTournament = () => {
    if (confirm("⚠️ ELIMINA TUTTO DAL WEB?")) {
      supabase.from("tournament_brackets").delete().eq("tournament_id", tournamentId);
      setBracket(Array.from({ length: 10 }, (_, i) => ({
        id:i,
        field:i+1,
        teams:[[],[]],
        scores:["",""],
        score:"",
        phase:"Primo Turno"
      })));
      setCurrentPhase("Primo Turno");
      setTournamentWinner(null);
      setHistory([]);
      setStatus("Reset OK");
    }
  };

  const fetchSavedBracket = async () => {
    try {
      setStatus("📂 Caricando...");
      const { data } = await supabase
        .from("tournament_brackets")
        .select("bracket, phase, winner_team, history")
        .eq("tournament_id", tournamentId)
        .maybeSingle();
      if (data) {
        setBracket((data.bracket || []).map(m => ({ ...m, scores: m.score ? m.score.split("-") : ["",""] })));
        setCurrentPhase(data.phase || "Primo Turno");
        setTournamentWinner(data.winner_team || null);
        setHistory(data.history || []);
        setStatus("✅ Caricato dal WEB!");
      } else {
        setStatus("Nuovo torneo");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Errore caricamento");
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    const init = async () => {
      await ensureTournamentExists();
      await Promise.all([fetchRealParticipants(), fetchSavedBracket()]);
      const { data } = await supabase.from("tournaments").select("tournament_type").eq("id", tournamentId).single();
      if (data) setTournamentType(data.tournament_type || "direct");

      if (!Array.isArray(bracket) || bracket.length === 0) {
        setBracket(Array.from({ length: 10 }, (_, i) => ({
          id:i,
          field:i+1,
          teams:[[],[]],
          scores:["",""],
          score:"",
          phase:"Primo Turno"
        })));
      }
      setIsLoaded(true);
    };
    init();
  }, [tournamentId]);

  if (!isLoaded) return <div className="flex items-center justify-center min-h-screen p-8 text-lg font-medium text-gray-600">Caricando tabellone...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 sm:p-6">
      {/* QUI PUOI INSERIRE IL RENDER COMPLETO DEL TABELLONE COME NEL TUO FILE ORIGINALE */}
      {/* Ricorda di mostrare le etichette stato dei giocatori */}
      {/* Esempio: */}
      {/* {player.status==="avanzato" && <span className="ml-1 text-green-600 font-bold">✅</span>} */}
      {/* {player.status==="ripescato" && <span className="ml-1 text-yellow-600 font-bold">🔄</span>} */}
      {/* {player.status==="eliminato" && <span className="ml-1 text-red-600 font-bold">❌</span>} */}
    </div>
  );
}
