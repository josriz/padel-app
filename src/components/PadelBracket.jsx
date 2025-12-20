import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ChevronLeft, Users, GripVertical, Trophy, Crown } from "lucide-react";
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
    finale: [[[null, null]]],
  });
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [tournamentName, setTournamentName] = useState("Tabellone Padel");
  const [isAdmin, setIsAdmin] = useState(false);
  const TOURNAMENT_ID = tournamentId || "1ed0d77f-894d-4f67-ae5d-01a7ba4df8f7";

  // Rounds config
  const rounds = [
    { key: "ottavi", label: "Ottavi di Finale", size: 8 },
    { key: "quarti", label: "Quarti di Finale", size: 4 },
    { key: "semi", label: "Semifinale", size: 2 },
    { key: "finale", label: "Finale", size: 1 },
  ];

  useEffect(() => {
    loadTournamentData();
  }, [tournamentId]);

  const loadTournamentData = async () => {
    try {
      setLoading(true);
      
      // Get tournament info
      const { data: tournament } = await supabase
        .from("tournaments")
        .select("name")
        .eq("id", TOURNAMENT_ID)
        .single();
      
      if (tournament) {
        setTournamentName(tournament.name);
      }

      // Get all players
      const { data: playersData } = await supabase
        .from("players")
        .select("*")
        .eq("tournament_id", TOURNAMENT_ID)
        .order("seed", { ascending: true });

      if (playersData) {
        setAllPlayers(playersData);
        // Shuffle or assign to bracket
        const shuffled = shufflePlayers(playersData);
        setPlayers(shuffled);
        updateBracket(shuffled);
      }

      // Check admin role
      await checkUserRole();

    } catch (error) {
      console.error("Errore caricamento dati:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: tournamentAdmins } = await supabase
          .from("tournament_admins")
          .select("user_id")
          .eq("tournament_id", TOURNAMENT_ID);
        
        if (tournamentAdmins?.some(admin => admin.user_id === user.id)) {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error("Errore verifica ruolo:", error);
    }
  };

  const shufflePlayers = (players) => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    return shuffled;
  };

  const updateBracket = (playerList) => {
    const newBracket = { ...bracket };
    
    // Ottavi (16 slots)
    const ottaviSlots = [];
    for (let i = 0; i < 4; i++) {
      ottaviSlots.push([
        [playerList[i*2] || null, playerList[i*2+1] || null],
        [playerList[i*2+8] || null, playerList[i*2+9] || null]
      ]);
    }
    newBracket.ottavi = ottaviSlots;

    // Quarti (8 slots -> 4 match)
    const quartiSlots = [];
    for (let i = 0; i < 2; i++) {
      quartiSlots.push([
        [null, null],
        [null, null]
      ]);
    }
    newBracket.quarti = quartiSlots;

    setBracket(newBracket);
  };

  const setMatchWinner = async (roundKey, matchIndex, winnerIndex, score = "6-4 6-3") => {
    if (!isAdmin) return;

    const newBracket = { ...bracket };
    const roundData = newBracket[roundKey];
    
    // Set winner
    roundData[matchIndex][0][1] = roundData[matchIndex][0][0]; // winner
    roundData[matchIndex][0][0] = null; // loser
    roundData[matchIndex][1] = score;

    // Propagate to next round if applicable
    propagateWinner(roundKey, matchIndex, winnerIndex);

    setBracket(newBracket);
    setResults({ ...results, [`${roundKey}-${matchIndex}`]: score });

    // Save to database
    await saveMatchResult(roundKey, matchIndex, winnerIndex, score);
  };

  const propagateWinner = (currentRound, matchIndex, winnerIndex) => {
    const nextRoundKey = getNextRound(currentRound);
    if (!nextRoundKey) return;

    const nextRoundData = bracket[nextRoundKey];
    if (!nextRoundData || nextRoundData.length === 0) return;

    const slotIndex = Math.floor(matchIndex / 2);
    const subSlot = matchIndex % 2;
    
    if (nextRoundData[slotIndex]) {
      nextRoundData[slotIndex][0][subSlot] = bracket[currentRound][matchIndex][0][1];
    }
  };

  const getNextRound = (currentRound) => {
    const roundOrder = ["ottavi", "quarti", "semi", "finale"];
    const currentIndex = roundOrder.indexOf(currentRound);
    return currentIndex < roundOrder.length - 1 ? roundOrder[currentIndex + 1] : null;
  };

  const saveMatchResult = async (round, matchIndex, winnerIndex, score) => {
    try {
      await supabase
        .from("match_results")
        .upsert({
          tournament_id: TOURNAMENT_ID,
          round,
          match_index: matchIndex,
          winner_index: winnerIndex,
          score,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error("Errore salvataggio risultato:", error);
    }
  };

  const renderMatch = (player1, player2, score, roundKey, matchIndex, isFinal = false) => (
    <div className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {player1?.name || "TBD"} {player1?.seed && `#${player1.seed}`}
          </span>
        </div>
        <div className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
          {score || "-"}
        </div>
      </div>
      
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3" />
      
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {player2?.name || "TBD"} {player2?.seed && `#${player2.seed}`}
          </span>
        </div>
        {isAdmin && player1 && player2 && (
          <div className="flex space-x-1">
            <button
              onClick={() => setMatchWinner(roundKey, matchIndex, 0, "6-4 6-3")}
              className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Vittoria Player 1"
            >
              <span className="text-xs">P1</span>
            </button>
            <button
              onClick={() => setMatchWinner(roundKey, matchIndex, 1, "6-4 6-3")}
              className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Vittoria Player 2"
            >
              <span className="text-xs">P2</span>
            </button>
          </div>
        )}
      </div>
      
      {isFinal && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl w-full">
          <Trophy className="w-6 h-6 mx-auto text-white mb-2" />
          <div className="text-center">
            <p className="text-white font-bold text-lg">🏆 CAMPIONE 🏆</p>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Caricamento tabellone...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="text-center flex-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {tournamentName}
              </h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                <Users className="w-4 h-4 mr-1" />
                Tabellone Completo • {allPlayers.length} giocatori
              </p>
            </div>
            
            {isAdmin && (
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-medium">
                👑 Modalità Admin
              </div>
            )}
          </div>

          {/* Round Selector */}
          <div className="flex overflow-x-auto pb-4 -mb-4">
            {rounds.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRound(key)}
                className={`flex-shrink-0 px-6 py-3 mx-1 rounded-2xl font-semibold transition-all duration-300 ${
                  round === key
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/25"
                    : "bg-white/70 text-gray-700 hover:bg-white hover:shadow-lg border border-gray-200 backdrop-blur-sm"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bracket */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Main Bracket */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Tabellone Principale
            </h2>
            <div className="space-y-8">
              {bracket[round]?.map((matchGroup, groupIndex) => (
                <div key={groupIndex} className="space-y-6">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                    <span className="text-lg font-semibold text-gray-700 px-4">
                      Match {groupIndex + 1}
                    </span>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matchGroup.map((match, matchIndex) => (
                      <div key={matchIndex} className="relative">
                        {renderMatch(
                          match[0][0], 
                          match[0][1], 
                          match[1],
                          round,
                          groupIndex * 2 + matchIndex,
                          round === "finale"
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Players List */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-indigo-600" />
                Partecipanti ({players.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:shadow-md transition-all border border-indigo-100">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {player.name}
                      </p>
                      {player.seed && (
                        <p class="text-sm text-gray-500">Testa di serie #{player.seed}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
