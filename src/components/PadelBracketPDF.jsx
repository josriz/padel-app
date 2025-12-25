import React from "react";

export default function PadelBracketPDF({ data, fasi, titoliFasi, currentFase }) {

  const renderMatch = (match) => (
    <div className="flex items-center justify-between mb-1 p-1 border-b border-gray-300">
      <div className="flex items-center gap-2 w-1/2">
        <div className="font-semibold">{match.sq1.p1} / {match.sq1.p2}</div>
        <div className="ml-auto font-mono text-sm">{match.sq1.punti}</div>
      </div>
      <div className="flex items-center gap-2 w-1/2">
        <div className="font-semibold">{match.sq2.p1} / {match.sq2.p2}</div>
        <div className="ml-auto font-mono text-sm">{match.sq2.punti}</div>
      </div>
    </div>
  );

  return (
    <div className="w-full p-4 bg-white text-black">
      <h2 className="text-center font-bold text-xl mb-4">🏓 TORNEO PADEL - {titoliFasi[currentFase]}</h2>
      
      <div className="grid grid-cols-5 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-center">OTTAVI</h3>
          {data.ottavi.map(renderMatch)}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-center">QUARTI</h3>
          {data.quarti.map(renderMatch)}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-center">SEMIFINALI</h3>
          {data.semi.map(renderMatch)}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-center">FINALE</h3>
          {data.finale.map(renderMatch)}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-center">RIPESCAGGI</h3>
          {data.ripescaggi.map(renderMatch)}
        </div>
      </div>
    </div>
  );
}
