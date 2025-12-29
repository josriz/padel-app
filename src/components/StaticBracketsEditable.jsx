import React, { useState, useCallback, useEffect } from "react";
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthProvider';
import "./TournamentBracket.css";

const EditableField = ({ value, onChange, className, placeholder }) => (
  <div 
    className={className}
    contentEditable 
    suppressContentEditableWarning
    onBlur={(e) => onChange(e.target.textContent || "")}
    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
  >
    {value || placeholder || "—"}
  </div>
);

const EditableTeam = ({ value, onChange }) => (
  <EditableField 
    value={value} 
    onChange={onChange}
    className="vb-team"
    placeholder="Nome squadra"
  />
);

const EditableScore = ({ value, onChange }) => (
  <EditableField 
    value={value} 
    onChange={onChange}
    className="vb-score"
    placeholder="6-4"
  />
);

const TeamRow = ({ team, score, onUpdate }) => (
  <div className="vb-team-row">
    <EditableTeam value={team} onChange={(val) => onUpdate('team', val)} />
    <EditableScore value={score} onChange={(val) => onUpdate('score', val)} />
  </div>
);

const EditableCampo = ({ label, onChange }) => (
  <EditableField 
    value={label} 
    onChange={onChange}
    className="vb-campo"
    placeholder="Campo"
  />
);

const Match = ({ 
  campoLabel = "Campo", 
  team1 = "", 
  score1 = "",
  team2 = "", 
  score2 = "",
  onUpdate,
  matchKey 
}) => {
  // ✅ DRAG & DROP SUPPORT
  const handleDrop = (e, field) => {
    e.preventDefault();
    const giocatoreData = JSON.parse(e.dataTransfer.getData('text/plain'));
    onUpdate(matchKey, field, giocatoreData.name);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="vb-match">
      <EditableCampo 
        label={campoLabel} 
        onChange={(val) => onUpdate(matchKey, 'campo', val)}
      />
      <TeamRow 
        team={team1} 
        score={score1}
        onUpdate={(field, val) => onUpdate(matchKey, field + '1', val)}
      />
      <TeamRow 
        team={team2} 
        score={score2}
        onUpdate={(field, val) => onUpdate(matchKey, field + '2', val)}
      />
    </div>
  );
};

/* =================== 4 SQUADRE =================== */
const Bracket4Teams = ({ data, onUpdate }) => (
  <div className="vb-bracket">
    <div className="vb-title"><strong>TABELLONE 4 SQUADRE</strong></div>
    <div className="vb-round">
      <Match 
        matchKey="sf1"
        campoLabel={data.sf1?.campo || "Campo 1"}
        team1={data.sf1?.team1 || ""} 
        score1={data.sf1?.score1 || ""}
        team2={data.sf1?.team2 || ""} 
        score2={data.sf1?.score2 || ""}
        onUpdate={onUpdate}
      />
      <Match 
        matchKey="sf2"
        campoLabel={data.sf2?.campo || "Campo 2"}
        team1={data.sf2?.team1 || ""} 
        score1={data.sf2?.score1 || ""}
        team2={data.sf2?.team2 || ""} 
        score2={data.sf2?.score2 || ""}
        onUpdate={onUpdate}
      />
    </div>
    <div className="vb-round vb-center">
      <Match 
        matchKey="finale"
        campoLabel="🏆 Finale"
        team1={data.finale?.team1 || ""} 
        score1={data.finale?.score1 || ""}
        team2={data.finale?.team2 || ""} 
        score2={data.finale?.score2 || ""}
        onUpdate={onUpdate}
      />
    </div>
  </div>
);

/* =================== 8 SQUADRE =================== */
const Bracket8Teams = ({ data, onUpdate }) => (
  <div className="vb-bracket">
    <div className="vb-title"><strong>TABELLONE 8 SQUADRE</strong></div>
    <div className="vb-round vb-8-wide">
      <Match matchKey="q1" campoLabel="Campo 1" {...data.q1} onUpdate={onUpdate} />
      <Match matchKey="q2" campoLabel="Campo 2" {...data.q2} onUpdate={onUpdate} />
      <Match matchKey="q3" campoLabel="Campo 3" {...data.q3} onUpdate={onUpdate} />
      <Match matchKey="q4" campoLabel="Campo 4" {...data.q4} onUpdate={onUpdate} />
    </div>
    <div className="vb-round">
      <Match matchKey="sf1" campoLabel="Semifinale 1" {...data.sf1} onUpdate={onUpdate} />
      <Match matchKey="sf2" campoLabel="Semifinale 2" {...data.sf2} onUpdate={onUpdate} />
    </div>
    <div className="vb-round vb-center">
      <Match matchKey="finale" campoLabel="🏆 Finale" {...data.finale} onUpdate={onUpdate} />
    </div>
  </div>
);

/* =================== 16 SQUADRE =================== */
const Bracket16Teams = ({ data, onUpdate }) => (
  <div className="vb-bracket vb-16">
    <div className="vb-title"><strong>TABELLONE 16 SQUADRE</strong></div>
    <div className="vb-round vb-8-wide">
      <Match matchKey="o1" campoLabel="Campo 1" {...data.o1} onUpdate={onUpdate} />
      <Match matchKey="o2" campoLabel="Campo 2" {...data.o2} onUpdate={onUpdate} />
      <Match matchKey="o3" campoLabel="Campo 3" {...data.o3} onUpdate={onUpdate} />
      <Match matchKey="o4" campoLabel="Campo 4" {...data.o4} onUpdate={onUpdate} />
      <Match matchKey="o5" campoLabel="Campo 5" {...data.o5} onUpdate={onUpdate} />
      <Match matchKey="o6" campoLabel="Campo 6" {...data.o6} onUpdate={onUpdate} />
      <Match matchKey="o7" campoLabel="Campo 7" {...data.o7} onUpdate={onUpdate} />
      <Match matchKey="o8" campoLabel="Campo 8" {...data.o8} onUpdate={onUpdate} />
    </div>
    <div className="vb-round">
      <Match matchKey="q1" campoLabel="Quarto 1" {...data.q1} onUpdate={onUpdate} />
      <Match matchKey="q2" campoLabel="Quarto 2" {...data.q2} onUpdate={onUpdate} />
      <Match matchKey="q3" campoLabel="Quarto 3" {...data.q3} onUpdate={onUpdate} />
      <Match matchKey="q4" campoLabel="Quarto 4" {...data.q4} onUpdate={onUpdate} />
    </div>
    <div className="vb-round">
      <Match matchKey="sf1" campoLabel="Semifinale 1" {...data.sf1} onUpdate={onUpdate} />
      <Match matchKey="sf2" campoLabel="Semifinale 2" {...data.sf2} onUpdate={onUpdate} />
    </div>
    <div className="vb-round vb-center">
      <Match matchKey="finale" campoLabel="🏆 Finale" {...data.finale} onUpdate={onUpdate} />
    </div>
  </div>
);

export const StaticBracketsEditable = ({ 
  size, 
  tournamentData = {}, 
  onDataChange,
  tournamentId 
}) => {
  const { user } = useAuth();
  const [data, setData] = useState(tournamentData);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ADMIN CHECK PER 3 UTENTI
  const isAdminOrSuper = user?.email === 'giose.rizzi@gmail.com' || 
                        user?.email === 'boverob@libero.it' || 
                        user?.email === 'cfalba@libero.it';

  // ✅ CARICA ISCRITTI (SOLO PER ADMIN)
  useEffect(() => {
    if (isAdminOrSuper && tournamentId) {
      const fetchParticipants = async () => {
        setLoading(true);
        const { data } = await supabase
          .from('tournament_registrations')
          .select('id, display_name, player_name')
          .eq('tournament_id', tournamentId)
          .eq('status', 'approved');
        setParticipants(data || []);
        setLoading(false);
      };
      fetchParticipants();
    }
  }, [tournamentId, isAdminOrSuper]);

  const handleUpdate = useCallback((matchKey, field, value) => {
    const newData = {
      ...data,
      [matchKey]: {
        ...data[matchKey],
        [field]: value
      }
    };
    setData(newData);
    onDataChange?.(newData, tournamentId);
  }, [data, onDataChange, tournamentId]);

  // ✅ LISTA ISCRITTI DRAG & DROP (SOLO ADMIN)
  const dragParticipants = isAdminOrSuper && (
    <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-300 shadow-2xl">
      <h3 className="text-xl font-bold text-emerald-800 mb-6 flex items-center gap-3">
        👥 ISCRITTI DISPONIBILI ({participants.length})
        {loading && <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin ml-2" />}
      </h3>
      {participants.length === 0 ? (
        <p className="text-emerald-700 italic text-center py-8 bg-white/50 rounded-xl">Nessun iscritto approvato</p>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {participants.map(giocatore => (
            <div
              key={giocatore.id}
              className="px-5 py-3 bg-white text-sm font-bold rounded-2xl shadow-lg cursor-grab hover:shadow-2xl hover:scale-105 active:cursor-grabbing active:scale-95 border-3 border-emerald-400 hover:border-emerald-500 transition-all duration-200 min-w-[140px] text-center backdrop-blur-sm"
              draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                  id: giocatore.id,
                  name: giocatore.display_name || giocatore.player_name
                }));
              }}
            >
              {giocatore.display_name || giocatore.player_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (size === 4) return (
    <div>
      {dragParticipants}
      <Bracket4Teams data={data} onUpdate={handleUpdate} />
    </div>
  );
  if (size === 8) return (
    <div>
      {dragParticipants}
      <Bracket8Teams data={data} onUpdate={handleUpdate} />
    </div>
  );
  return (
    <div>
      {dragParticipants}
      <Bracket16Teams data={data} onUpdate={handleUpdate} />
    </div>
  );
};
