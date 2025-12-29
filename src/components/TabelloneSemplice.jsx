import React, { useState } from 'react';
import './TabelloneSemplice.css';

const TabelloneSemplice = () => {
  const [nomi, setNomi] = useState(Array(15).fill(''));

  const updateNome = (index, value) => {
    const nuoviNomi = [...nomi];
    nuoviNomi[index] = value;
    setNomi(nuoviNomi);
  };

  return (
    <div className="pagina-tabellone">
      <div className="tabellone-editabile">
        <img src="/tabellone.png" className="sfondo-tabellone" alt="Tabellone" />
        
        {/* 8 OTTAVI */}
        <input value={nomi[0]} onChange={(e) => updateNome(0, e.target.value)} className="casella-0" placeholder="1" />
        <input value={nomi[1]} onChange={(e) => updateNome(1, e.target.value)} className="casella-1" placeholder="2" />
        <input value={nomi[2]} onChange={(e) => updateNome(2, e.target.value)} className="casella-2" placeholder="3" />
        <input value={nomi[3]} onChange={(e) => updateNome(3, e.target.value)} className="casella-3" placeholder="4" />
        <input value={nomi[4]} onChange={(e) => updateNome(4, e.target.value)} className="casella-4" placeholder="5" />
        <input value={nomi[5]} onChange={(e) => updateNome(5, e.target.value)} className="casella-5" placeholder="6" />
        <input value={nomi[6]} onChange={(e) => updateNome(6, e.target.value)} className="casella-6" placeholder="7" />
        <input value={nomi[7]} onChange={(e) => updateNome(7, e.target.value)} className="casella-7" placeholder="8" />
        
        {/* 4 QUARTI */}
        <input value={nomi[8]} onChange={(e) => updateNome(8, e.target.value)} className="casella-8" placeholder="Q1" />
        <input value={nomi[9]} onChange={(e) => updateNome(9, e.target.value)} className="casella-9" placeholder="Q2" />
        <input value={nomi[10]} onChange={(e) => updateNome(10, e.target.value)} className="casella-10" placeholder="Q3" />
        <input value={nomi[11]} onChange={(e) => updateNome(11, e.target.value)} className="casella-11" placeholder="Q4" />
        
        {/* 2 SEMIFINALI */}
        <input value={nomi[12]} onChange={(e) => updateNome(12, e.target.value)} className="casella-12" placeholder="SF1" />
        <input value={nomi[13]} onChange={(e) => updateNome(13, e.target.value)} className="casella-13" placeholder="SF2" />
        
        {/* FINALE */}
        <input value={nomi[14]} onChange={(e) => updateNome(14, e.target.value)} className="casella-14" placeholder="1°" />
        
        <button className="stampa-btn" onClick={() => window.print()}>🖨️ STAMPA</button>
      </div>
    </div>
  );
};

export default TabelloneSemplice;
