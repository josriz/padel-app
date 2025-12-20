// src/components/PadelBracket.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ChevronLeft, Users, GripVertical } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function PadelBracket() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const [round, setRound] = useState("ottavi");
  const [allPlayers, setAllPlayers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [bracket, setBracket] = useState({
    ottavi: [
      [[null, null], [null, null]],
      [[null, null], [null, null]],
      [[null, null], [null, null]],
      [[null, null], [null, null]],
    ],
    quarti: [
      [[null, null], [null, null]],
      [[null, null], [null, null]],
    ],
    semi: [[[null, null], [null, null]]],
    finale: [[[null, null]]], // solo 1 squadra vincitrice finale
  });
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [tournamentName, setTournamentName] = useState("Tabellone Padel");
  const [isAdmin, setIsAdmin] = useState(false);
  const TOURNAMENT_ID = tournamentId || "1ed0d77f-894d-4f67-ae5d-01a7ba4df8f7";

  // Controllo admin
  useEffect(() => { checkUserRole(); }, []);
  useEffect(() => { loadData(); loadBracket(); }, [TOURNAMENT_ID]);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        const { data: tournamentAdmins } = await supabase
          .from("tournament_admins")
          .select("user_id")
          .eq("tournament_id", TOURNAMENT_ID);
        const isGlobalAdmin = userProfile?.role === "admin";
        const isTournamentAdmin = tournamentAdmins?.some((admin) => admin.user_id === user.id);
        setIsAdmin(isGlobalAdmin || isTournamentAdmin);
      }
    } catch (error) { console.log("User role check:", error); }
  };

  // Caricamento giocatori
  const loadData = async () => {
    setLoading(true);
    try {
      const { data: tournamentData } = await supabase
        .from("tournaments")
        .select("name")
        .eq("id", TOURNAMENT_ID)
        .single();
      setTournamentName(tournamentData?.name || "Tabellone Padel");

      const { data: registrations, error } = await supabase
        .from("tournament_registrations")
        .select(`id,user_id,level,status,profiles!inner(full_name, display_name, player_name)`)
        .eq("tournament_id", TOURNAMENT_ID);

      if (error) setAllPlayers([]);
      else if (registrations?.length > 0) {
        const realPlayers = registrations
          .map((reg) =>
            reg.profiles?.full_name ||
            reg.profiles?.player_name ||
            reg.profiles?.display_name ||
            `User ${reg.user_id?.slice(-6)}`
          )
          .filter(Boolean);
        setAllPlayers(realPlayers);
      } else {
        setAllPlayers([
          "Mario Rossi","Luca Verdi","Giulia Bianchi","Sara Neri",
          "Paolo Bianchi","Anna Verdi","Marco Rossi","Laura Neri",
          "Giorgio Neri","Francesca Rossi","Antonio Verdi","Elena Bianchi",
          "Roberto Neri","Chiara Rossi","Davide Verdi","Sofia Bianchi",
        ]);
      }
    } catch (error) {
      console.error("Load error:", error);
      setAllPlayers(["Mario Rossi","Luca Verdi","Giulia Bianchi","Sara Neri"]);
    } finally { setLoading(false); }
  };

  // Caricamento bracket da Supabase
  const loadBracket = async () => {
    try {
      const { data } = await supabase
        .from("tournament_brackets")
        .select("*")
        .eq("tournament_id", TOURNAMENT_ID)
        .single();
      if (data) {
        setBracket(data.bracket || bracket);
        setResults(data.results || results);
      }
    } catch (error) { console.error("Errore load bracket:", error); }
  };

  // Realtime bracket
  useEffect(() => {
    const subscription = supabase
      .channel(`realtime_bracket_${TOURNAMENT_ID}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tournament_brackets", filter: `tournament_id=eq.${TOURNAMENT_ID}` },
        (payload) => {
          const updated = payload.new;
          setBracket(updated.bracket || bracket);
          setResults(updated.results || results);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [TOURNAMENT_ID]);

  // Gestione giocatori disponibili
  useEffect(() => {
    const usedPlayers = [];
    Object.values(bracket).forEach(roundMatches => {
      roundMatches?.forEach(match =>
        match?.forEach(team =>
          team?.forEach(player => { if (player) usedPlayers.push(player); })
        )
      );
    });
    setPlayers(allPlayers.filter(p => !usedPlayers.includes(p)));
  }, [allPlayers, bracket]);

  // Salvataggio locale
  const saveBracketAuto = () =>
    localStorage.setItem(`bracket_${TOURNAMENT_ID}`, JSON.stringify({ bracket, results, round }));

  // Salvataggio Supabase
  const saveBracketToSupabase = async () => {
    try {
      const { data: existing } = await supabase
        .from("tournament_brackets")
        .select("*")
        .eq("tournament_id", TOURNAMENT_ID)
        .single();

      if (existing) {
        await supabase
          .from("tournament_brackets")
          .update({ bracket, results, updated_at: new Date() })
          .eq("tournament_id", TOURNAMENT_ID);
      } else {
        await supabase
          .from("tournament_brackets")
          .insert({ tournament_id: TOURNAMENT_ID, bracket, results });
      }
    } catch (error) { console.error("Errore salvataggio bracket:", error); }
  };

  // Drag&drop
  const onDragStart = (e, player) => { if (!isAdmin) return; e.dataTransfer.setData("player", player); };
  const onDrop = (e, roundKey, matchIndex, teamIndex, playerIndex) => {
    if (!isAdmin) return; e.preventDefault();
    const player = e.dataTransfer.getData("player");
    setBracket(prev => {
      const newBracket = JSON.parse(JSON.stringify(prev));
      if (!newBracket[roundKey]) newBracket[roundKey] = [];
      if (!newBracket[roundKey][matchIndex]) newBracket[roundKey][matchIndex] = [];
      if (!newBracket[roundKey][matchIndex][teamIndex])
        newBracket[roundKey][matchIndex][teamIndex] = [null, null];
      newBracket[roundKey][matchIndex][teamIndex][playerIndex] = player;
      return newBracket;
    });
    setTimeout(saveBracketAuto, 100);
    setTimeout(saveBracketToSupabase, 100);
  };
  const onDragOver = (e) => { if (!isAdmin) return; e.preventDefault(); };

  // Funzioni vincitore
  const getMatchWinner = (team1, team2, result) => {
    if (!team1 || !team2 || !result) return null;
    if (result.set1 > result.set2) return team1;
    if (result.set2 > result.set1) return team2;
    return team1;
  };

  const advanceWinner = (roundKey, matchIndex, matchResult) => {
    const roundOrder = ["ottavi", "quarti", "semi", "finale"];
    const currentRoundIdx = roundOrder.indexOf(roundKey);
    if (currentRoundIdx === -1 || currentRoundIdx === roundOrder.length - 1) return;

    const nextRoundKey = roundOrder[currentRoundIdx + 1];
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const teamPosition = matchIndex % 2;

    const winner = getMatchWinner(
      bracket[roundKey][matchIndex][0],
      bracket[roundKey][matchIndex][1],
      matchResult
    );
    if (!winner) return;

    setBracket(prev => {
      const newBracket = JSON.parse(JSON.stringify(prev));
      if (!newBracket[nextRoundKey]) newBracket[nextRoundKey] = [];
      if (!newBracket[nextRoundKey][nextMatchIndex]) {
        newBracket[nextRoundKey][nextMatchIndex] = [[null, null], [null, null]];
      }

      // Finale: mostra solo vincitore
      if(nextRoundKey === "finale") {
        newBracket[nextRoundKey][0][0] = [...winner];
      } else {
        newBracket[nextRoundKey][nextMatchIndex][teamPosition] = [...winner];
      }

      return newBracket;
    });
  };

  const updateResult = (roundKey, matchIndex, set1, set2) => {
    if (!isAdmin) return;
    const newResult = { set1: parseInt(set1) || 0, set2: parseInt(set2) || 0 };
    setResults(prev => ({ ...prev, [`${roundKey}_${matchIndex}`]: newResult }));

    advanceWinner(roundKey, matchIndex, newResult);
    saveBracketAuto();
    saveBracketToSupabase();
  };

  // Elimina torneo
  const handleDeleteTournament = async () => {
    if (!isAdmin) return;
    if (!confirm("Sei sicuro di voler eliminare il torneo?")) return;

    try {
      await supabase.from("tournament_registrations").delete().eq("tournament_id", TOURNAMENT_ID);
      await supabase.from("tournaments").delete().eq("id", TOURNAMENT_ID);
      alert("Torneo eliminato!");
      navigate(-1);
    } catch (error) {
      console.error("Errore eliminazione torneo:", error);
      alert("Errore durante l'eliminazione");
    }
  };

  const rounds = ["ottavi", "quarti", "semi", "finale"];
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
    </div>
  );

  // 🔹 LAYOUT INTATTO
  return (
    <div className="min-h-screen bg-white py-4 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 border rounded-lg hover:bg-gray-50 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Indietro
          </button>
          <h1 className="text-xl font-bold text-center flex-1">
            🏆 {tournamentName} (ID: {TOURNAMENT_ID.slice(-8)})
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-bold ${isAdmin ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
              {isAdmin ? "👑 ADMIN" : "👁️ VIEW"}
            </span>
          </h1>
          <div className="flex gap-2 items-center">
            <div className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">💾 SALVATO</div>
            {isAdmin && (
              <button onClick={handleDeleteTournament} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-bold">
                Elimina torneo
              </button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 overflow-x-auto pb-2 border-b border-gray-200">
          {rounds.map((r) => (
            <button key={r} onClick={() => setRound(r)}
              className={`px-4 py-2 text-sm font-bold rounded-t-md whitespace-nowrap flex-shrink-0 ${round === r ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        {/* GRID RESPONSIVE */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[70vh]">
          {/* ISCRITTI */}
          <div className="space-y-3 order-2 xl:order-1">
            <h3 className="font-semibold text-sm text-center flex items-center justify-center gap-2">
              👥 {isAdmin ? `Disponibili (${players.length}/${allPlayers.length})` : `Iscritti (${allPlayers.length})`}
            </h3>
            <div className="bg-gray-50 p-3 rounded-xl border h-64 xl:h-auto overflow-y-auto space-y-1.5">
              {isAdmin
                ? players.length === 0
                  ? <div className="text-center text-gray-500 text-xs py-4">Tutti posizionati! 🎾</div>
                  : players.map((player, i) => (
                      <div key={i} className="bg-white p-2.5 rounded-lg text-xs shadow-sm cursor-grab hover:bg-emerald-50 flex items-center gap-2 border hover:border-emerald-400 transition-all"
                        draggable onDragStart={(e) => onDragStart(e, player)}>
                        <GripVertical className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                        <span className="font-medium truncate flex-1">{player}</span>
                      </div>
                    ))
                : allPlayers.map((player, i) => (
                    <div key={i} className="bg-gray-100 p-2.5 rounded-lg text-xs flex items-center gap-2 border cursor-default">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium truncate flex-1">{player}</span>
                    </div>
                  ))}
            </div>
          </div>

          {/* TABELLONE */}
          <div className="space-y-3 order-1 xl:order-2">
            <h3 className="font-semibold text-sm text-center flex items-center justify-center gap-2">
              {round.toUpperCase()} {isAdmin && `- ${bracket[round]?.length || 0} Campi`}
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl border min-h-[500px] overflow-y-auto space-y-3">
              {bracket[round].map((matchesGroup, matchIndex) => {
                const resultKey = `${round}_${matchIndex}`;
                const result = results[resultKey] || { set1: 0, set2: 0 };
                return (
                  <div key={matchIndex} className={`p-4 rounded-xl border shadow-sm ${isAdmin ? "bg-white hover:shadow-md" : "bg-gray-50"}`}>
                    <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-gray-200">
                      <span className="text-xs font-semibold">🏟️ Campo {matchIndex + 1}</span>
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs font-bold">P{matchIndex + 1}</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {matchesGroup.map((team, teamIndex) => (
                        <div key={teamIndex} className={`border rounded-lg p-2.5 min-h-[68px] ${isAdmin ? "bg-white/70 border-gray-200 hover:border-emerald-400" : "bg-gray-100 border-gray-300"}`}>
                          {team.map((player, playerIndex) => (
                            <div key={playerIndex} className={`p-1.5 rounded-md border text-center text-xs flex items-center justify-center h-9 cursor-pointer ${player ? "bg-emerald-50 border-emerald-400 font-semibold shadow-sm" : isAdmin ? "bg-white border-gray-300 hover:border-emerald-400" : "bg-gray-100 border-gray-300"}`}
                              draggable={isAdmin && !player ? false : true} onDragOver={onDragOver}
                              onDrop={(e) => onDrop(e, round, matchIndex, teamIndex, playerIndex)}>
                              {player || "-"}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    {isAdmin && round !== "finale" && (
                      <div className="flex gap-2 text-xs">
                        <input type="number" value={result.set1} onChange={(e) => updateResult(round, matchIndex, e.target.value, result.set2)}
                          className="w-12 p-1 border rounded text-center" />
                        <span className="self-center">-</span>
                        <input type="number" value={result.set2} onChange={(e) => updateResult(round, matchIndex, result.set1, e.target.value)}
                          className="w-12 p-1 border rounded text-center" />
                      </div>
                    )}
                    {round === "finale" && matchesGroup[0][0] && (
                      <div className="mt-2 text-center font-bold text-green-700 text-sm">🏆 Vincitore: {matchesGroup[0][0]}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
