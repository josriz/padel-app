import React from "react";
import "./TournamentBracket.css";

const EditableTeam = () => (
  <div className="vb-team" contentEditable suppressContentEditableWarning>
    Nome squadra
  </div>
);

const EditableScore = () => (
  <div className="vb-score" contentEditable suppressContentEditableWarning>
    6-4
  </div>
);

const TeamRow = () => (
  <div className="vb-team-row">
    <EditableTeam />
    <EditableScore />
  </div>
);

const EditableCampo = ({ label }) => (
  <div className="vb-campo" contentEditable suppressContentEditableWarning>
    {label}
  </div>
);

const Match = ({ label }) => (
  <div className="vb-match">
    <EditableCampo label={label} />
    <TeamRow />
    <TeamRow />
  </div>
);

/* =================== 4 SQUADRE =================== */
const Bracket4Teams = () => (
  <div className="vb-bracket">
    <div className="vb-title">TABELLONE 4 SQUADRE</div>
    <div className="vb-round">
      <Match label="Campo 1" />
      <Match label="Campo 2" />
    </div>
    <div className="vb-round vb-center">
      <Match label="🏆 Finale" />
    </div>
  </div>
);

/* =================== 8 SQUADRE =================== */
const Bracket8Teams = () => (
  <div className="vb-bracket">
    <div className="vb-title">TABELLONE 8 SQUADRE</div>
    <div className="vb-round">
      <Match label="Campo 1" />
      <Match label="Campo 2" />
      <Match label="Campo 3" />
      <Match label="Campo 4" />
    </div>
    <div className="vb-round">
      <Match label="Semifinale 1" />
      <Match label="Semifinale 2" />
    </div>
    <div className="vb-round vb-center">
      <Match label="🏆 Finale" />
    </div>
  </div>
);

/* =================== 16 SQUADRE =================== */
const Bracket16Teams = () => (
  <div className="vb-bracket vb-16">
    <div className="vb-title">TABELLONE 16 SQUADRE</div>
    <div className="vb-round vb-8-wide">
      <Match label="Campo 1" />
      <Match label="Campo 2" />
      <Match label="Campo 3" />
      <Match label="Campo 4" />
      <Match label="Campo 5" />
      <Match label="Campo 6" />
      <Match label="Campo 7" />
      <Match label="Campo 8" />
    </div>
    <div className="vb-round">
      <Match label="Quarto 1" />
      <Match label="Quarto 2" />
      <Match label="Quarto 3" />
      <Match label="Quarto 4" />
    </div>
    <div className="vb-round">
      <Match label="Semifinale 1" />
      <Match label="Semifinale 2" />
    </div>
    <div className="vb-round vb-center">
      <Match label="🏆 Finale" />
    </div>
  </div>
);

export const StaticBracketsEditable = ({ size }) => {
  if (size === 4) return <Bracket4Teams />;
  if (size === 8) return <Bracket8Teams />;
  return <Bracket16Teams />;
};
