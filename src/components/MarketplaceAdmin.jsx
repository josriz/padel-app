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
  const [columnFilters, setColumnFilters] = useState({ venduto: 'tutti', attivo: 'tutti', fornitori: 'tutti' });
  const [showCharts, setShowCharts] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ nome: '', email: '', password: '', tipo: 'fornitore' });

  const calculatePrezzi = (prezzoFornitore) => {
    const pf = Number(prezzoFornitore) || 0;
    const comm = Number(commissionePercent) || 20;
    const prezzoFinale = Math.round(pf * (1 + comm / 100));
    const guadagnoAdmin = prezzoFinale - pf;
    return { prezzoFinale, guadagnoAdmin, prezzoFornitore: pf };
  };

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("marketplace_items").select("*").order("created_at", { ascending: false });
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
    await supabase.from("marketplace_items").update({ venduto: !item.venduto }).eq("id", item.id);
    fetchItems();
  };

  const toggleAttivo = async (item) => {
    await supabase.from("marketplace_items").update({ is_active: !item.is_active }).eq("id", item.id);
    fetchItems();
  };

  const updatePrezzoFornitore = async (itemId, prezzo) => {
    if (prezzo < 0) return;
    const { error } = await supabase.from("marketplace_items").update({ prezzo_fornitore: Number(prezzo) }).eq("id", itemId);
    if (!error) fetchItems();
  };

  const deleteItem = async (id) => {
    if (!confirm("ELIMINARE?")) return;
    const { error } = await supabase.from("marketplace_items").delete().eq("id", id);
    if (!error) fetchItems();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text(`Marketplace Report - ${new Date().toLocaleDateString('it-IT')}`, 20, y);
    y += 15;
    doc.setFontSize(12);
    doc.text(`Commissioni: ${commissionePercent}% | Guadagno: €${stats.incasso.toLocaleString()}`, 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text('Articolo', 10, y);
    doc.text('Prezzo Fornitore', 70, y);
    doc.text(`Finale (+${commissionePercent}%)`, 110, y);
    doc.text('Guadagno', 150, y);
    doc.text('Venduto', 180, y);
    y += 10;
    filteredItems.slice(0, 20).forEach((item) => {
      const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
      doc.text((item.nome || '').slice(0, 25), 10, y);
      doc.text(`€${prezzi.prezzoFornitore}`, 70, y);
      doc.text(`€${prezzi.prezzoFinale}`, 110, y);
      doc.text(`€${prezzi.guadagnoAdmin}`, 150, y);
      doc.text(item.venduto ? 'SÌ' : 'NO', 180, y);
      y += 8;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save(`marketplace-report-${new Date().toISOString().slice(0, 10)}.pdf`);
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
    a.download = `marketplace-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printMarketplace = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const html = `<html><head><title>Marketplace Report</title>
      <style>body{font-family:Arial,sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{border:1px solid #333;padding:8px;text-align:left;}th{background-color:#f0f0f0;}</style>
      </head><body>
      <h2>Marketplace Report - ${new Date().toLocaleDateString('it-IT')}</h2>
      <table><thead><tr><th>Articolo</th><th>Prezzo Fornitore</th><th>Finale (+${commissionePercent}%)</th><th>Guadagno Admin</th><th>Venduto</th><th>Attivo</th><th>Tipo</th></tr></thead><tbody>
      ${filteredItems.map(item => { const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo); return `<tr>
      <td>${item.nome || ''}</td><td>€${prezzi.prezzoFornitore}</td><td>€${prezzi.prezzoFinale}</td><td>€${prezzi.guadagnoAdmin}</td><td>${item.venduto?'SÌ':'NO'}</td><td>${item.is_active?'SÌ':'NO'}</td><td>${item.fornitore?'Fornitore':'Utente'}</td></tr>`; }).join('')}
      </tbody></table></body></html>`;
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

  const pieData = { labels: ["Venduti", "Disponibili"], datasets: [{ data: [stats.venduti, stats.totale - stats.venduti], backgroundColor: ["#10b981", "#e5e7eb"] }] };
  const barData = { labels: ["Venduti", "Attivi", "Totali"], datasets: [{ data: [stats.venduti, stats.attivi, stats.totale], backgroundColor: ["#10b981", "#f59e0b", "#3b82f6"] }] };

  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  const createNewUser = async () => {
    if (!newUser.nome || !newUser.email || !newUser.password) { alert("Compila tutti i campi"); return; }
    const { error } = await supabase.auth.admin.createUser({
      email: newUser.email,
      password: newUser.password,
      user_metadata: { nome: newUser.nome, tipo: newUser.tipo }
    });
    if (error) alert("Errore: " + error.message);
    else { alert("Utente creato!"); setNewUser({ nome:'', email:'', password:'', tipo:'fornitore' }); }
  };

  if (loading) return <div style={styles.loading}>Caricamento...</div>;

  return (
    <div style={styles.container}>
      {/* HEADER E KPI */}
      <div style={styles.headerCompact}>
        <h1 style={styles.h1Compact}>📊 Marketplace</h1>
        <div style={styles.kpiInline}>
          <div style={styles.guadagnoBox}>
            <div style={styles.guadagnoLabel}>TUO GUADAGNO</div>
            <div style={styles.guadagnoInputContainer}>
              <button onClick={()=>setCommissionePercent(p => Math.max(p-1,0))}>◀</button>
              <input type="range" min="5" max="50" step="1" value={commissionePercent} onChange={e=>setCommissionePercent(Number(e.target.value))} style={styles.commissioneSlider}/>
              <button onClick={()=>setCommissionePercent(p => Math.min(p+1,50))}>▶</button>
              <span style={styles.commissioneValue}>{commissionePercent}%</span>
            </div>
            <div style={styles.guadagnoAmount}>€{stats.incasso.toLocaleString()}</div>
          </div>
          <div style={styles.kpiSmall}><div style={styles.kpiNumber}>{stats.venduti}</div><div style={styles.kpiLabelSmall}>Venduti</div></div>
          <div style={styles.kpiSmall}><div style={styles.kpiNumber}>{stats.totale}</div><div style={styles.kpiLabelSmall}>Totali</div></div>
          <div style={styles.kpiSmall}><div style={styles.kpiNumber}>{stats.attivi}</div><div style={styles.kpiLabelSmall}>Attivi</div></div>
        </div>

        <div style={styles.headerButtonsCompact}>
          <button onClick={()=>window.history.back()} style={styles.btnBack}>⬅ Indietro</button>
          <button onClick={exportPDF} style={styles.btnExportPDF}>📄 PDF</button>
          <button onClick={exportCSV} style={styles.btnExportCSV}>📊 Excel</button>
          <button onClick={printMarketplace} style={styles.btnExportPrint}>🖨️ Stampa</button>
          <button onClick={fetchItems} style={styles.btnExportRefresh}>🔄 Refresh</button>
          <button onClick={()=>setShowCharts(!showCharts)} style={styles.btnChart}>📈 {showCharts?'Nascondi':'Grafici'}</button>
          <button onClick={()=>setShowForm(!showForm)} style={styles.btnChart}>➕ Crea Utente</button>
        </div>
      </div>

      {/* GRAFICI */}
      {showCharts && (
        <div style={styles.chartsRowCompact}>
          <div style={styles.chartCardCompact}><Pie data={pieData} options={pieOptions}/></div>
          <div style={styles.chartCardCompact}><Bar data={barData} options={barOptions}/></div>
        </div>
      )}

      {/* FORM CREAZIONE UTENTE */}
      {showForm && (
        <div style={styles.formContainer}>
          <h3>Nuovo Utente Fornitore</h3>
          <input placeholder="Nome" value={newUser.nome} onChange={e=>setNewUser({...newUser,nome:e.target.value})}/>
          <input placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})}/>
          <input placeholder="Password" type="password" value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})}/>
          <select value={newUser.tipo} onChange={e=>setNewUser({...newUser,tipo:e.target.value})}>
            <option value="fornitore">Fornitore</option>
            <option value="utente">Utente</option>
          </select>
          <button onClick={createNewUser}>Crea Utente</button>
        </div>
      )}

      {/* FILTRI E TABELLA */}
      <div style={styles.columnFiltersRow}>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Venduto:</span>
          <button onClick={()=>setColumnFilters({...columnFilters,venduto:'tutti'})} style={columnFilters.venduto==='tutti'?styles.filterBtnActive:styles.filterBtn}>Tutti</button>
          <button onClick={()=>setColumnFilters({...columnFilters,venduto:'si'})} style={columnFilters.venduto==='si'?styles.filterBtnActive:styles.filterBtn}>SÌ</button>
          <button onClick={()=>setColumnFilters({...columnFilters,venduto:'no'})} style={columnFilters.venduto==='no'?styles.filterBtnActive:styles.filterBtn}>NO</button>
        </div>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Attivo:</span>
          <button onClick={()=>setColumnFilters({...columnFilters,attivo:'tutti'})} style={columnFilters.attivo==='tutti'?styles.filterBtnActive:styles.filterBtn}>Tutti</button>
          <button onClick={()=>setColumnFilters({...columnFilters,attivo:'si'})} style={columnFilters.attivo==='si'?styles.filterBtnActive:styles.filterBtn}>SÌ</button>
          <button onClick={()=>setColumnFilters({...columnFilters,attivo:'no'})} style={columnFilters.attivo==='no'?styles.filterBtnActive:styles.filterBtn}>NO</button>
        </div>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Tipo:</span>
          <button onClick={()=>setColumnFilters({...columnFilters,fornitori:'tutti'})} style={columnFilters.fornitori==='tutti'?styles.filterBtnActive:styles.filterBtn}>Tutti</button>
          <button onClick={()=>setColumnFilters({...columnFilters,fornitori:'si'})} style={columnFilters.fornitori==='si'?styles.filterBtnActive:styles.filterBtn}>Fornitori</button>
          <button onClick={()=>setColumnFilters({...columnFilters,fornitori:'no'})} style={columnFilters.fornitori==='no'?styles.filterBtnActive:styles.filterBtn}>Utenti</button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.tableHead}>Articolo</th>
                <th style={styles.tableHead}>Prezzo Fornitore</th>
                <th style={styles.tableHead}>Finale (+{commissionePercent}%)</th>
                <th style={styles.tableHead}>TUO Guadagno</th>
                <th style={styles.tableHead}>Venduto</th>
                <th style={styles.tableHead}>Attivo</th>
                <th style={styles.tableHead}>Tipo</th>
                <th style={styles.tableHead}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item=>{
                const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
                return (
                  <tr key={item.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.itemInfo}>
                        <span style={styles.itemName}>{item.nome}</span>
                        <span style={styles.itemDate}>{item.created_at?.slice(0,10)}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <input type="number" style={styles.inputNumber} value={prezzi.prezzoFornitore} onChange={e=>updatePrezzoFornitore(item.id,e.target.value)}/>
                    </td>
                    <td style={styles.tableCell}>€{prezzi.prezzoFinale}</td>
                    <td style={styles.tableCell}>€{prezzi.guadagnoAdmin}</td>
                    <td style={styles.tableCell}><input type="checkbox" checked={item.venduto} onChange={()=>toggleVenduto(item)}/></td>
                    <td style={styles.tableCell}><input type="checkbox" checked={item.is_active} onChange={()=>toggleAttivo(item)}/></td>
                    <td style={styles.tableCell}>{item.fornitore?'Fornitore':'Utente'}</td>
                    <td style={styles.tableCell}><button onClick={()=>deleteItem(item.id)} style={styles.deleteBtn}>🗑️</button></td>
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

// Stili inline per brevità
const styles = {
  container:{padding:20,fontFamily:'Arial,sans-serif'},
  loading:{padding:50,fontSize:18,textAlign:'center'},
  headerCompact:{display:'flex',flexDirection:'column',marginBottom:20},
  h1Compact:{margin:0},
  kpiInline:{display:'flex',gap:10,marginTop:10,flexWrap:'wrap'},
  guadagnoBox:{padding:10,border:'1px solid #ccc',borderRadius:8,flexGrow:1,minWidth:180},
  guadagnoLabel:{fontSize:12,color:'#555'},
  guadagnoInputContainer:{display:'flex',alignItems:'center',gap:5,marginTop:5},
  commissioneSlider:{flexGrow:1},
  commissioneValue:{marginLeft:5,fontWeight:'bold'},
  guadagnoAmount:{marginTop:5,fontSize:16,fontWeight:'bold'},
  kpiSmall:{padding:10,border:'1px solid #ccc',borderRadius:8,minWidth:80,textAlign:'center'},
  kpiNumber:{fontSize:18,fontWeight:'bold'},
  kpiLabelSmall:{fontSize:12,color:'#555'},
  headerButtonsCompact:{display:'flex',gap:5,flexWrap:'wrap',marginTop:10},
  btnBack:{background:'#ddd',border:'none',padding:5,borderRadius:5,cursor:'pointer'},
  btnExportPDF:{background:'#10b981',color:'#fff',border:'none',padding:5,borderRadius:5,cursor:'pointer'},
  btnExportCSV:{background:'#3b82f6',color:'#fff',border:'none',padding:5,borderRadius:5,cursor:'pointer'},
  btnExportPrint:{background:'#f59e0b',color:'#fff',border:'none',padding:5,borderRadius:5,cursor:'pointer'},
  btnExportRefresh:{background:'#6b7280',color:'#fff',border:'none',padding:5,borderRadius:5,cursor:'pointer'},
  btnChart:{background:'#9333ea',color:'#fff',border:'none',padding:5,borderRadius:5,cursor:'pointer'},
  chartsRowCompact:{display:'flex',gap:10,marginTop:20,flexWrap:'wrap'},
  chartCardCompact:{flex:1,minHeight:200,padding:10,border:'1px solid #ccc',borderRadius:8},
  formContainer:{marginTop:20,padding:10,border:'1px solid #ccc',borderRadius:8,display:'flex',flexDirection:'column',gap:5},
  columnFiltersRow:{display:'flex',gap:10,flexWrap:'wrap',marginBottom:10},
  filterToggle:{display:'flex',gap:5,alignItems:'center'},
  filterLabelSmall:{fontSize:12,color:'#555'},
  filterBtn:{background:'#f3f4f6',border:'1px solid #ccc',padding:3,borderRadius:3,cursor:'pointer'},
  filterBtnActive:{background:'#3b82f6',color:'#fff',border:'1px solid #3b82f6',padding:3,borderRadius:3,cursor:'pointer'},
  tableContainer:{overflowX:'auto'},
  tableWrapper:{minWidth:900},
  table:{width:'100%',borderCollapse:'collapse'},
  tableHeadRow:{background:'#f3f4f6'},
  tableHead:{border:'1px solid #ccc',padding:5},
  tableRow:{borderBottom:'1px solid #ccc'},
  tableCell:{padding:5,border:'1px solid #ccc',verticalAlign:'middle'},
  itemInfo:{display:'flex',flexDirection:'column'},
  itemName:{fontWeight:'bold'},
  itemDate:{fontSize:10,color:'#555'},
  inputNumber:{width:70},
  deleteBtn:{background:'#ef4444',color:'#fff',border:'none',padding:'2px 5px',borderRadius:5,cursor:'pointer'}
};
