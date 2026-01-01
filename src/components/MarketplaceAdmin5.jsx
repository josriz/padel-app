import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from "react-chartjs-2";
import jsPDF from 'jspdf';
import "./marketplace-admin.css";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MarketplaceAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commissionePercent, setCommissionePercent] = useState(20);
  const [columnFilters, setColumnFilters] = useState({venduto: 'tutti', attivo: 'tutti', fornitori: 'tutti'});
  const [showCharts, setShowCharts] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const calculatePrezzi = (prezzoFornitore) => {
    const pf = Number(prezzoFornitore) || 0;
    const comm = Number(commissionePercent) || 20;
    const prezzoFinale = Math.round(pf * (1 + comm / 100));
    const guadagnoAdmin = prezzoFinale - pf;
    return {prezzoFinale, guadagnoAdmin, prezzoFornitore: pf};
  };

  const fetchItems = async () => {
    setLoading(true);
    const {data, error} = await supabase.from("marketplace_items").select("*").order("created_at", {ascending: false});
    if (error) console.error("Errore:", error);
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {fetchItems();}, []);

  const filteredItems = items.filter(item => {
    if (columnFilters.venduto !== 'tutti') {
      if (columnFilters.venduto === 'si' && !item.venduto) return false;
      if (columnFilters.venduto === 'no' && item.venduto) return false;
    }
    if (columnFilters.attivo !== 'tutti') {
      if (columnFilters.attivo === 'si' && !item.is_active) return false;
      if (columnFilters.attivo === 'no' && item.is_active) return false;
    }
    if (columnFilters.fornitori !== 'tutti') {
      if (columnFilters.fornitori === 'si' && !item.fornitore) return false;
      if (columnFilters.fornitori === 'no' && item.fornitore) return false;
    }
    return true;
  });

  const toggleVenduto = async (item) => {
    await supabase.from("marketplace_items").update({venduto: !item.venduto}).eq("id", item.id);
    fetchItems();
  };

  const toggleAttivo = async (item) => {
    await supabase.from("marketplace_items").update({is_active: !item.is_active}).eq("id", item.id);
    fetchItems();
  };

  const updatePrezzoFornitore = async (itemId, prezzo) => {
    if (prezzo < 0) return;
    const {error} = await supabase.from("marketplace_items").update({prezzo_fornitore: Number(prezzo)}).eq("id", itemId);
    if (!error) fetchItems();
  };

  const deleteItem = async (id) => {
    if (!confirm("ELIMINARE?")) return;
    const {error} = await supabase.from("marketplace_items").delete().eq("id", id);
    if (!error) fetchItems();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text(`Marketplace Report - ${new Date().toLocaleDateString('it-IT')}`, 20, y);
    y += 15;
    doc.setFontSize(12);
    doc.text(`Commissioni: ${commissionePercent}%`, 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text('Articolo', 10, y); 
    doc.text('Prezzo Fornitore', 70, y); 
    doc.text(`Finale (+${commissionePercent}%)`, 110, y); 
    doc.text('Guadagno', 150, y); 
    doc.text('Venduto', 180, y);
    y += 10;
    filteredItems.forEach((item) => {
      const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
      doc.text((item.nome || '').slice(0, 25), 10, y);
      doc.text(`€${prezzi.prezzoFornitore}`, 70, y);
      doc.text(`€${prezzi.prezzoFinale}`, 110, y);
      doc.text(`€${prezzi.guadagnoAdmin}`, 150, y);
      doc.text(item.venduto ? 'SÌ' : 'NO', 180, y);
      y += 8;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save(`marketplace-report-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const exportCSV = () => {
    const csv = [
      ['Articolo', 'Prezzo Fornitore', `Finale (+${commissionePercent}%)`, 'Guadagno Admin', 'Venduto', 'Fornitore', 'Attivo'],
      ...filteredItems.map(item => {
        const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
        return [item.nome || '', prezzi.prezzoFornitore, prezzi.prezzoFinale, prezzi.guadagnoAdmin, 
                item.venduto ? 'SÌ' : 'NO', item.fornitore ? 'SÌ' : 'NO', item.is_active ? 'SÌ' : 'NO'];
      })
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketplace-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printMarketplace = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const html = `
      <html>
        <head>
          <title>Marketplace Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: 500; }
            th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 14px; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            tr:hover { background-color: #e3f2fd; }
          </style>
        </head>
        <body>
          <h2>Marketplace Report - ${new Date().toLocaleDateString('it-IT')}</h2>
          <table>
            <thead>
              <tr>
                <th>Articolo</th>
                <th>Prezzo Fornitore</th>
                <th>Finale (+${commissionePercent}%)</th>
                <th>Guadagno Admin</th>
                <th>Venduto</th>
                <th>Attivo</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              ${filteredItems.map(item => {
                const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
                return `<tr>
                          <td>${item.nome || ''}</td>
                          <td>€${prezzi.prezzoFornitore}</td>
                          <td>€${prezzi.prezzoFinale}</td>
                          <td>€${prezzi.guadagnoAdmin}</td>
                          <td>${item.venduto ? 'SÌ' : 'NO'}</td>
                          <td>${item.is_active ? 'SÌ' : 'NO'}</td>
                          <td>${item.fornitore ? 'Fornitore' : 'Utente'}</td>
                        </tr>`;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const stats = {
    totale: items.length,
    venduti: items.filter(i => i.venduto).length,
    attivi: items.filter(i => i.is_active).length,
    incasso: items.filter(i => i.venduto).reduce((sum, i) => {
      const prezzi = calculatePrezzi(i.prezzo_fornitore || i.prezzo);
      return sum + prezzi.guadagnoAdmin;
    }, 0)
  };

  const pieData = {
    labels: ["Venduti", "Disponibili"],
    datasets: [{ data: [stats.venduti, stats.totale - stats.venduti], backgroundColor: ["#10b981", "#e5e7eb"] }]
  };

  const barData = {
    labels: ["Venduti", "Attivi", "Totali"],
    datasets: [{ data: [stats.venduti, stats.attivi, stats.totale], backgroundColor: ["#10b981", "#f59e0b", "#3b82f6"] }]
  };

  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  if (loading) return <div style={styles.loading}>Caricamento...</div>;

  return (
    <div style={styles.container}>
      {/* Header e KPI */}
      <div style={styles.headerCompact}>
        <h1 style={styles.h1Compact}>📊 Marketplace Admin</h1>
        <div style={styles.kpiInline}>
          <div style={styles.guadagnoBox}>
            <div style={styles.guadagnoLabel}>TUO GUADAGNO</div>
            <div style={styles.guadagnoInputContainer}>
              <input 
                type="range" 
                min="5" 
                max="50" 
                step="1"
                value={commissionePercent}
                onChange={(e) => setCommissionePercent(Number(e.target.value))}
                style={styles.commissioneSlider}
              />
              <span style={styles.commissioneValue}>{commissionePercent}% {commissionePercent > 20 ? '↑' : '↓'}</span>
            </div>
            <div style={styles.guadagnoAmount}>€{stats.incasso.toLocaleString()}</div>
          </div>
          <div style={styles.kpiSmall}>
            <div style={styles.kpiNumber}>{stats.venduti}</div>
            <div style={styles.kpiLabelSmall}>Venduti</div>
          </div>
          <div style={styles.kpiSmall}>
            <div style={styles.kpiNumber}>{stats.totale}</div>
            <div style={styles.kpiLabelSmall}>Totali</div>
          </div>
          <div style={styles.kpiSmall}>
            <div style={styles.kpiNumber}>{stats.attivi}</div>
            <div style={styles.kpiLabelSmall}>Attivi</div>
          </div>
        </div>

        {/* Bottoni */}
        <div style={styles.headerButtonsCompact}>
          <button onClick={()=>window.history.back()} style={styles.btnBack}>⬅ Indietro</button>
          <button onClick={exportPDF} style={styles.btnExportPDF}>📄 PDF</button>
          <button onClick={exportCSV} style={styles.btnExportCSV}>📊 Excel</button>
          <button onClick={printMarketplace} style={styles.btnExportPrint}>🖨️ Stampa</button>
          <button onClick={fetchItems} style={styles.btnExportRefresh}>🔄 Refresh</button>
          <button onClick={() => setShowCharts(!showCharts)} style={styles.btnChart}>
            📈 {showCharts ? 'Nascondi' : 'Grafici'}
          </button>
          <button onClick={() => setShowManual(!showManual)} style={styles.btnManual}>
            🔔 Manuale
          </button>
        </div>
      </div>

      {/* Manuale popup */}
      {showManual && (
        <div style={styles.manualPopup}>
          <h3>Manuale Dashboard Admin</h3>
          <p>- Modifica prezzi, attiva/disattiva articoli, gestisci venduto.</p>
          <p>- Filtra articoli per stato e tipo.</p>
          <p>- Esporta PDF, Excel o stampa tabella.</p>
          <p>- Visualizza grafici KPI.</p>
          <button onClick={()=>setShowManual(false)} style={styles.btnCloseManual}>Chiudi</button>
        </div>
      )}

      {/* Grafici */}
      {showCharts && (
        <div style={styles.chartsRowCompact}>
          <div style={styles.chartCardCompact}>
            <Pie data={pieData} options={pieOptions} />
          </div>
          <div style={styles.chartCardCompact}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      )}

      {/* Filtri */}
      <div style={styles.columnFiltersRow}>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Venduto:</span>
          <button onClick={() => setColumnFilters({...columnFilters, venduto: 'tutti'})} 
            style={columnFilters.venduto === 'tutti' ? styles.filterBtnActive : styles.filterBtn}>Tutti</button>
          <button onClick={() => setColumnFilters({...columnFilters, venduto: 'si'})} 
            style={columnFilters.venduto === 'si' ? styles.filterBtnActive : styles.filterBtn}>SÌ</button>
          <button onClick={() => setColumnFilters({...columnFilters, venduto: 'no'})} 
            style={columnFilters.venduto === 'no' ? styles.filterBtnActive : styles.filterBtn}>NO</button>
        </div>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Attivo:</span>
          <button onClick={() => setColumnFilters({...columnFilters, attivo: 'tutti'})} 
            style={columnFilters.attivo === 'tutti' ? styles.filterBtnActive : styles.filterBtn}>Tutti</button>
          <button onClick={() => setColumnFilters({...columnFilters, attivo: 'si'})} 
            style={columnFilters.attivo === 'si' ? styles.filterBtnActive : styles.filterBtn}>SÌ</button>
          <button onClick={() => setColumnFilters({...columnFilters, attivo: 'no'})} 
            style={columnFilters.attivo === 'no' ? styles.filterBtnActive : styles.filterBtn}>NO</button>
        </div>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Tipo:</span>
          <button onClick={() => setColumnFilters({...columnFilters, fornitori: 'tutti'})} 
            style={columnFilters.fornitori === 'tutti' ? styles.filterBtnActive : styles.filterBtn}>Tutti</button>
          <button onClick={() => setColumnFilters({...columnFilters, fornitori: 'si'})} 
            style={columnFilters.fornitori === 'si' ? styles.filterBtnActive : styles.filterBtn}>Fornitori</button>
          <button onClick={() => setColumnFilters({...columnFilters, fornitori: 'no'})} 
            style={columnFilters.fornitori === 'no' ? styles.filterBtnActive : styles.filterBtn}>Utenti</button>
        </div>
      </div>

      {/* Tabella articoli */}
      <div style={styles.tableContainer}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableTh}>Articolo</th>
                <th style={styles.tableTh}>Prezzo Fornitore</th>
                <th style={styles.tableTh}>Finale</th>
                <th style={styles.tableTh}>Guadagno</th>
                <th style={styles.tableTh}>Venduto</th>
                <th style={styles.tableTh}>Attivo</th>
                <th style={styles.tableTh}>Tipo</th>
                <th style={styles.tableTh}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => {
                const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
                const isEvenRow = index % 2 === 0;
                return (
                  <tr key={item.id} style={isEvenRow ? styles.tableTrEven : {}}>
                    <td style={styles.tableTd}>{item.nome}</td>
                    <td style={styles.tableTd}><input type="number" value={prezzi.prezzoFornitore} 
                      onChange={e => updatePrezzoFornitore(item.id, Number(e.target.value) || 0)} /></td>
                    <td style={styles.tableTd}>€{prezzi.prezzoFinale}</td>
                    <td style={styles.tableTd}>€{prezzi.guadagnoAdmin}</td>
                    <td style={styles.tableTd}><button onClick={()=>toggleVenduto(item)}>{item.venduto ? 'SÌ' : 'NO'}</button></td>
                    <td style={styles.tableTd}><button onClick={()=>toggleAttivo(item)}>{item.is_active ? 'SÌ' : 'NO'}</button></td>
                    <td style={styles.tableTd}>{item.fornitore ? 'Fornitore' : 'Utente'}</td>
                    <td style={styles.tableTd}><button onClick={()=>deleteItem(item.id)}>🗑</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container:{padding:'20px', fontFamily:'Arial, sans-serif'},
  loading:{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'},
  headerCompact:{display:'flex', flexDirection:'column', marginBottom:'20px'},
  h1Compact:{marginBottom:'10px'},
  kpiInline:{display:'flex', gap:'15px', marginBottom:'15px', flexWrap:'wrap'},
  guadagnoBox:{padding:'15px', border:'2px solid #2c3e50', borderRadius:'12px', background:'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', minWidth:'200px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'},
  guadagnoLabel:{fontWeight:'bold', marginBottom:'5px', color:'#1e40af'},
  guadagnoInputContainer:{display:'flex', alignItems:'center', gap:'10px'},
  commissioneSlider:{flex:1},
  commissioneValue:{fontWeight:'bold', color:'#1e40af'},
  guadagnoAmount:{marginTop:'5px', fontSize:'18px', fontWeight:'bold', color:'#059669'},
  kpiSmall:{padding:'15px', border:'2px solid #2c3e50', borderRadius:'12px', background:'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', minWidth:'100px', textAlign:'center', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'},
  kpiNumber:{fontSize:'22px', fontWeight:'bold', color:'#1e293b'},
  kpiLabelSmall:{fontSize:'12px', color:'#64748b'},
  headerButtonsCompact:{display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'15px'},
  btnBack:{background:'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'500', boxShadow:'0 2px 8px rgba(59,130,246,0.3)'},
  btnExportPDF:{background:'linear-gradient(135deg, #10b981 0%, #059669 100%)', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'500', boxShadow:'0 2px 8px rgba(16,185,129,0.3)'},
  btnExportCSV:{background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'500', boxShadow:'0 2px 8px rgba(245,158,11,0.3)'},
  btnExportPrint:{background:'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'500', boxShadow:'0 2px 8px rgba(107,114,128,0.3)'},
  btnExportRefresh:{background:'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'500', boxShadow:'0 2px 8px rgba(99,102,241,0.3)'},
  btnChart:{background:'linear-gradient(135deg, #d946ef 0%, #be185d 100%)', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'500', boxShadow:'0 2px 8px rgba(217,70,239,0.3)'},
  btnManual:{background:'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'500', boxShadow:'0 2px 8px rgba(249,115,22,0.3)'},
  manualPopup:{position:'fixed', top:'50px', right:'50px', background:'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', padding:'25px', border:'2px solid #2c3e50', borderRadius:'16px', zIndex:1000, width:'320px', boxShadow:'0 10px 30px rgba(0,0,0,0.3)'},
  btnCloseManual:{background:'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', marginTop:'15px', fontWeight:'500'},
  chartsRowCompact:{display:'flex', gap:'20px', flexWrap:'wrap', marginBottom:'20px'},
  chartCardCompact:{flex:'1', minWidth:'280px', height:'280px', padding:'20px', border:'2px solid #2c3e50', borderRadius:'16px', background:'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', boxShadow:'0 8px 25px rgba(0,0,0,0.15)'},
  columnFiltersRow:{display:'flex', gap:'20px', marginBottom:'20px', flexWrap:'wrap'},
  filterToggle:{display:'flex', alignItems:'center', gap:'8px', padding:'12px 16px', border:'2px solid #e2e8f0', borderRadius:'12px', background:'white'},
  filterLabelSmall:{fontSize:'13px', fontWeight:'600', color:'#1e293b'},
  filterBtn:{padding:'6px 12px', border:'2px solid #e2e8f0', borderRadius:'8px', cursor:'pointer', background:'white', fontWeight:'500', transition:'all 0.2s'},
  filterBtnActive:{padding:'6px 12px', border:'2px solid #6366f1', borderRadius:'8px', cursor:'pointer', background:'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color:'white', fontWeight:'600', boxShadow:'0 2px 8px rgba(99,102,241,0.3)'},
  tableContainer:{overflowX:'auto', borderRadius:'16px', boxShadow:'0 10px 40px rgba(0,0,0,0.1)', background:'white'},
  tableWrapper:{minWidth:'1000px'},
  table:{width:'100%', borderCollapse:'collapse', border:'1px solid #e5e7eb', fontSize:'14px'},
  // STILI TABELLA AGGIORNATI - BORDI GRIGIO CHIARO ELEGANTE
  tableTh: {
    border: '1px solid #d1d5db',
    padding: '16px 12px',
    textAlign: 'left',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  tableTd: {
    border: '1px solid #f3f4f6',
    padding: '14px 12px',
    verticalAlign: 'middle'
  },
  tableTrEven: {
    background: 'linear-gradient(90deg, #fafbfc 0%, #f8fafc 100%)'
  }
};
