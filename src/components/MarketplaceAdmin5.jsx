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
  const [showFornitoreForm, setShowFornitoreForm] = useState(false);

  // Stato form Fornitore
  const [fornitoreNome, setFornitoreNome] = useState("");
  const [fornitoreEmail, setFornitoreEmail] = useState("");
  const [fornitoreMessage, setFornitoreMessage] = useState("");
  const [loadingFornitore, setLoadingFornitore] = useState(false);

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

  useEffect(() => { fetchItems(); }, []);

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

  // Funzione invio accesso fornitore
  const handleCreateFornitore = async () => {
    if (!fornitoreEmail || !fornitoreNome) {
      return alert("Inserisci nome ed email del fornitore");
    }
    setLoadingFornitore(true);
    try {
      const response = await fetch("http://127.0.0.1:54321/create-fornitore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fornitoreEmail, nome: fornitoreNome, cognome: "" })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore server");

      setFornitoreMessage(`Accesso fornitore creato: ${fornitoreEmail}`);
      setFornitoreEmail("");
      setFornitoreNome("");
      setShowFornitoreForm(false);
    } catch(err) {
      console.error(err);
      setFornitoreMessage(`Errore invio accesso: ${err.message}`);
    } finally {
      setLoadingFornitore(false);
    }
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
      {/* HEADER PAGINA */}
      <div style={styles.headerPage}>
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
            <button onClick={() => setShowFornitoreForm(!showFornitoreForm)} style={styles.btnChart}>
              ✉️ Invia Accesso Fornitore
            </button>
          </div>
        </div>
      </div>

      {/* FORM INVIO ACCESSO FORNITORE */}
      {showFornitoreForm && (
        <div style={styles.manualPopup}>
          <h3>Invia Accesso Fornitore</h3>
          <input 
            type="text" 
            placeholder="Nome Fornitore" 
            value={fornitoreNome} 
            onChange={e => setFornitoreNome(e.target.value)} 
            style={{width:'100%', marginBottom:'10px', padding:'6px', borderRadius:'6px', border:'1px solid #d1d5db'}} 
          />
          <input 
            type="email" 
            placeholder="Email Fornitore" 
            value={fornitoreEmail} 
            onChange={e => setFornitoreEmail(e.target.value)} 
            style={{width:'100%', marginBottom:'10px', padding:'6px', borderRadius:'6px', border:'1px solid #d1d5db'}} 
          />
          <button 
            onClick={handleCreateFornitore} 
            disabled={loadingFornitore}
            style={{
              ...styles.btnCloseManual, 
              background: loadingFornitore 
                ? 'linear-gradient(135deg, #a5f3fc 0%, #22d3ee 100%)' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              cursor: loadingFornitore ? 'not-allowed' : 'pointer'
            }}
          >
            {loadingFornitore ? "Creazione..." : "Invia Email"}
          </button>
          <button onClick={()=>setShowFornitoreForm(false)} style={{...styles.btnCloseManual, marginTop:'5px'}}>Chiudi</button>
          {fornitoreMessage && (
            <div style={{marginTop:'10px', color: fornitoreMessage.startsWith("Errore") ? '#dc2626' : '#16a34a'}}>
              {fornitoreMessage}
            </div>
          )}
        </div>
      )}

      {/* MANUALE */}
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

      {/* GRAFICI */}
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

      {/* FILTRI */}
      <div style={styles.columnFiltersRow}>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Venduto:</span>
          <button onClick={() => setColumnFilters({...columnFilters, venduto: 'tutti'})} style={columnFilters.venduto === 'tutti' ? styles.filterBtnActive : styles.filterBtn}>Tutti</button>
          <button onClick={() => setColumnFilters({...columnFilters, venduto: 'si'})} style={columnFilters.venduto === 'si' ? styles.filterBtnActive : styles.filterBtn}>Sì</button>
          <button onClick={() => setColumnFilters({...columnFilters, venduto: 'no'})} style={columnFilters.venduto === 'no' ? styles.filterBtnActive : styles.filterBtn}>No</button>
        </div>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Attivo:</span>
          <button onClick={() => setColumnFilters({...columnFilters, attivo: 'tutti'})} style={columnFilters.attivo === 'tutti' ? styles.filterBtnActive : styles.filterBtn}>Tutti</button>
          <button onClick={() => setColumnFilters({...columnFilters, attivo: 'si'})} style={columnFilters.attivo === 'si' ? styles.filterBtnActive : styles.filterBtn}>Sì</button>
          <button onClick={() => setColumnFilters({...columnFilters, attivo: 'no'})} style={columnFilters.attivo === 'no' ? styles.filterBtnActive : styles.filterBtn}>No</button>
        </div>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Fornitore:</span>
          <button onClick={() => setColumnFilters({...columnFilters, fornitori: 'tutti'})} style={columnFilters.fornitori === 'tutti' ? styles.filterBtnActive : styles.filterBtn}>Tutti</button>
          <button onClick={() => setColumnFilters({...columnFilters, fornitori: 'si'})} style={columnFilters.fornitori === 'si' ? styles.filterBtnActive : styles.filterBtn}>Sì</button>
          <button onClick={() => setColumnFilters({...columnFilters, fornitori: 'no'})} style={columnFilters.fornitori === 'no' ? styles.filterBtnActive : styles.filterBtn}>No</button>
        </div>
      </div>

      {/* TABELLONE ARTICOLI */}
      <div style={styles.tableContainerCompact}>
        <table style={styles.tableCompact}>
          <thead>
            <tr>
              <th>Articolo</th>
              <th>Prezzo Fornitore</th>
              <th>Finale (+{commissionePercent}%)</th>
              <th>Guadagno Admin</th>
              <th>Venduto</th>
              <th>Attivo</th>
              <th>Tipo</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
              return (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>
                    <input 
                      type="number" 
                      value={item.prezzo_fornitore || item.prezzo || 0} 
                      onChange={e => updatePrezzoFornitore(item.id, e.target.value)}
                      style={{width:'70px'}}
                    />
                  </td>
                  <td>€{prezzi.prezzoFinale}</td>
                  <td>€{prezzi.guadagnoAdmin}</td>
                  <td>
                    <input type="checkbox" checked={item.venduto} onChange={() => toggleVenduto(item)} />
                  </td>
                  <td>
                    <input type="checkbox" checked={item.is_active} onChange={() => toggleAttivo(item)} />
                  </td>
                  <td>{item.fornitore ? 'Fornitore' : 'Utente'}</td>
                  <td>
                    <button onClick={()=>deleteItem(item.id)} style={{color:'#dc2626'}}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// STILI INLINE
const styles = {
  container:{padding:'20px', fontFamily:'Arial, sans-serif'},
  loading:{padding:'20px', fontSize:'18px'},
  headerPage:{marginBottom:'20px'},
  headerCompact:{display:'flex', flexDirection:'column', gap:'10px'},
  h1Compact:{margin:0, fontSize:'24px'},
  kpiInline:{display:'flex', gap:'20px', alignItems:'center', flexWrap:'wrap'},
  guadagnoBox:{display:'flex', flexDirection:'column', padding:'10px', background:'#f3f4f6', borderRadius:'8px'},
  guadagnoLabel:{fontSize:'12px', fontWeight:'600', marginBottom:'5px'},
  guadagnoInputContainer:{display:'flex', alignItems:'center', gap:'10px'},
  commissioneSlider:{flex:1},
  commissioneValue:{fontWeight:'600'},
  guadagnoAmount:{fontSize:'16px', fontWeight:'700', marginTop:'5px'},
  kpiSmall:{display:'flex', flexDirection:'column', alignItems:'center', padding:'5px 10px', background:'#f3f4f6', borderRadius:'6px'},
  kpiNumber:{fontWeight:'700', fontSize:'14px'},
  kpiLabelSmall:{fontSize:'12px', fontWeight:'500'},
  headerButtonsCompact:{display:'flex', gap:'10px', flexWrap:'wrap'},
  btnBack:{background:'#e5e7eb', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'},
  btnExportPDF:{background:'#3b82f6', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'},
  btnExportCSV:{background:'#10b981', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'},
  btnExportPrint:{background:'#f59e0b', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'},
  btnExportRefresh:{background:'#6b7280', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'},
  btnChart:{background:'#6366f1', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'},
  btnManual:{background:'#14b8a6', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'},
  manualPopup:{position:'fixed', top:'20%', left:'50%', transform:'translateX(-50%)', background:'white', padding:'20px', boxShadow:'0 0 15px rgba(0,0,0,0.2)', zIndex:1000, borderRadius:'8px', maxWidth:'400px', width:'100%'},
  btnCloseManual:{width:'100%', padding:'8px 12px', border:'none', borderRadius:'6px', background:'linear-gradient(135deg, #10b981 0%, #059669 100%)', color:'white', cursor:'pointer', fontWeight:'600'},
  chartsRowCompact:{display:'flex', gap:'20px', marginTop:'20px'},
  chartCardCompact:{flex:1, height:'250px', background:'#f3f4f6', padding:'10px', borderRadius:'8px'},
  columnFiltersRow:{display:'flex', gap:'20px', margin:'20px 0', flexWrap:'wrap'},
  filterToggle:{display:'flex', gap:'6px', alignItems:'center'},
  filterLabelSmall:{fontWeight:'600'},
  filterBtn:{background:'#e5e7eb', border:'none', padding:'4px 8px', borderRadius:'6px', cursor:'pointer'},
  filterBtnActive:{background:'#3b82f6', color:'white', border:'none', padding:'4px 8px', borderRadius:'6px', cursor:'pointer'},
  tableContainerCompact:{overflowX:'auto'},
  tableCompact:{width:'100%', borderCollapse:'collapse'},
};
