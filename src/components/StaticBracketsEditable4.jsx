import React from "react";
import "./TournamentBracket.css";

/** Squadra editabile */
const EditableTeam = () => (
  <div className="vb-team" contentEditable suppressContentEditableWarning={true}>
    Nome squadra
  </div>
);

/** Risultato accanto alla squadra */
const EditableScore = () => (
  <div className="vb-score" contentEditable suppressContentEditableWarning={true}>
    6-4
  </div>
);

/** Riga squadra + punteggio */
const TeamRow = () => (
  <div className="vb-team-row">
    <EditableTeam />
    <EditableScore />
  </div>
);

/** Singolo match */
const Match = ({ campo }) => (
  <div className="vb-match">
    <div className="vb-campo">{campo}</div>
    <TeamRow />
    <TeamRow />
    <div className="vb-line-right" />
  </div>
);

/* ================= 4 SQUADRE ================= */
export const Bracket4Teams = () => (
  <div className="vb-bracket vb-4">
    <div className="vb-round vb-round-1">
      <Match campo="Campo 1" />
      <Match campo="Campo 2" />
    </div>
    <div className="vb-round vb-round-2">
      <div className="vb-match vb-final">
        <div className="vb-campo">🏆 Finale</div>
        <TeamRow />
        <TeamRow />
      </div>
      <div className="vb-trophy">🏆</div>
    </div>
  </div>
);

/* ================= 8 SQUADRE ================= */
export const Bracket8Teams = () => (
  <div className="vb-bracket vb-8">
    <div className="vb-round vb-round-1">
      <Match campo="Campo 1" />
      <Match campo="Campo 2" />
      <Match campo="Campo 3" />
      <Match campo="Campo 4" />
    </div>
    <div className="vb-round vb-round-2">
      <Match campo="Campo 5" />
      <Match campo="Campo 6" />
    </div>
    <div className="vb-round vb-round-3">
      <div className="vb-match vb-final">
        <div className="vb-campo">🏆 Finale</div>
        <TeamRow />
        <TeamRow />
      </div>
      <div className="vb-trophy">🏆</div>
    </div>
  </div>
);

/* ================= 16 SQUADRE ================= */
export const Bracket16Teams = () => (
  <div className="vb-bracket vb-16">
    <div className="vb-round vb-round-1">
      <Match campo="Campo 1" />
      <Match campo="Campo 2" />
      <Match campo="Campo 3" />
      <Match campo="Campo 4" />
      <Match campo="Campo 5" />
      <Match campo="Campo 6" />
      <Match campo="Campo 7" />
      <Match campo="Campo 8" />
    </div>
    <div className="vb-round vb-round-2">
      <Match campo="Quarto 1" />
      <Match campo="Quarto 2" />
      <Match campo="Quarto 3" />
      <Match campo="Quarto 4" />
    </div>
    <div className="vb-round vb-round-3">
      <Match campo="Semi 1" />
      <Match campo="Semi 2" />
    </div>
    <div className="vb-round vb-round-4">
      <div className="vb-match vb-final">
        <div className="vb-campo">🏆 Finale</div>
        <TeamRow />
        <TeamRow />
      </div>
      <div className="vb-trophy">🏆</div>
    </div>
  </div>
);

/* Export principale */
export const StaticBracketsEditable = ({ size }) => {
  if (size === 4) return <Bracket4Teams />;
  if (size === 8) return <Bracket8Teams />;
  return <Bracket16Teams />;
};
