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
  const [showFormFornitore, setShowFormFornitore] = useState(false);
  const [newFornitore, setNewFornitore] = useState({nome:"", email:"", password:""});

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

  // CREAZIONE NUOVO FORNITORE
  const createFornitore = async () => {
    if(!newFornitore.nome || !newFornitore.email || !newFornitore.password){
      alert("Compila tutti i campi");
      return;
    }
    const {error} = await supabase.from("users").insert([{
      nome: newFornitore.nome,
      email: newFornitore.email,
      password: newFornitore.password,
      ruolo: "fornitore"
    }]);
    if(error){
      alert("Errore nella creazione: " + error.message);
    } else {
      alert("Fornitore creato con successo!");
      setNewFornitore({nome:"", email:"", password:""});
      setShowFormFornitore(false);
    }
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

  const pieData = {labels: ["Venduti", "Disponibili"], datasets: [{ data: [stats.venduti, stats.totale - stats.venduti], backgroundColor: ["#10b981", "#e5e7eb"] }]};
  const barData = {labels: ["Venduti", "Attivi", "Totali"], datasets: [{ data: [stats.venduti, stats.attivi, stats.totale], backgroundColor: ["#10b981", "#f59e0b", "#3b82f6"] }]};
  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

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
              <button onClick={()=>setCommissionePercent(p=>Math.max(5,p-1))} style={styles.arrowBtn}>◀</button>
              <input 
                type="number" 
                min="5" max="50" step="1"
                value={commissionePercent}
                onChange={(e)=>setCommissionePercent(Number(e.target.value))}
                style={styles.commissioneSliderInput}
              />
              <button onClick={()=>setCommissionePercent(p=>Math.min(50,p+1))} style={styles.arrowBtn}>▶</button>
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
          <button onClick={() => setShowCharts(!showCharts)} style={styles.btnChart}>📈 {showCharts ? 'Nascondi' : 'Grafici'}</button>
          <button onClick={() => setShowFormFornitore(!showFormFornitore)} style={styles.btnFormFornitore}>➕ Nuovo Fornitore</button>
        </div>
      </div>

      {/* FORM CREAZIONE FORNITORE */}
      {showFormFornitore && (
        <div style={styles.formFornitore}>
          <input type="text" placeholder="Nome" value={newFornitore.nome} onChange={e=>setNewFornitore({...newFornitore,nome:e.target.value})} style={styles.inputForm}/>
          <input type="email" placeholder="Email" value={newFornitore.email} onChange={e=>setNewFornitore({...newFornitore,email:e.target.value})} style={styles.inputForm}/>
          <input type="password" placeholder="Password" value={newFornitore.password} onChange={e=>setNewFornitore({...newFornitore,password:e.target.value})} style={styles.inputForm}/>
          <button onClick={createFornitore} style={styles.btnCreateFornitore}>Crea Fornitore</button>
        </div>
      )}

      {/* GRAFICI */}
      {showCharts && (
        <div style={styles.chartsRowCompact}>
          <div style={styles.chartCardCompact}><Pie data={pieData} options={pieOptions} /></div>
          <div style={styles.chartCardCompact}><Bar data={barData} options={barOptions} /></div>
        </div>
      )}

      {/* FILTRI */}
      <div style={styles.columnFiltersRow}>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Venduto:</span>
          <button onClick={() => setColumnFilters({...columnFilters, venduto:'tutti'})} style={columnFilters.venduto==='tutti'?styles.filterBtnActive:styles.filterBtn}>Tutti</button>
          <button onClick={() => setColumnFilters({...columnFilters, venduto:'si'})} style={columnFilters.venduto==='si'?styles.filterBtnActive:styles.filterBtn}>SÌ</button>
          <button onClick={() => setColumnFilters({...columnFilters, venduto:'no'})} style={columnFilters.venduto==='no'?styles.filterBtnActive:styles.filterBtn}>NO</button>
        </div>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Attivo:</span>
          <button onClick={() => setColumnFilters({...columnFilters, attivo:'tutti'})} style={columnFilters.attivo==='tutti'?styles.filterBtnActive:styles.filterBtn}>Tutti</button>
          <button onClick={() => setColumnFilters({...columnFilters, attivo:'si'})} style={columnFilters.attivo==='si'?styles.filterBtnActive:styles.filterBtn}>SÌ</button>
          <button onClick={() => setColumnFilters({...columnFilters, attivo:'no'})} style={columnFilters.attivo==='no'?styles.filterBtnActive:styles.filterBtn}>NO</button>
        </div>
        <div style={styles.filterToggle}>
          <span style={styles.filterLabelSmall}>Tipo:</span>
          <button onClick={() => setColumnFilters({...columnFilters, fornitori:'tutti'})} style={columnFilters.fornitori==='tutti'?styles.filterBtnActive:styles.filterBtn}>Tutti</button>
          <button onClick={() => setColumnFilters({...columnFilters, fornitori:'si'})} style={columnFilters.fornitori==='si'?styles.filterBtnActive:styles.filterBtn}>Fornitori</button>
          <button onClick={() => setColumnFilters({...columnFilters, fornitori:'no'})} style={columnFilters.fornitori==='no'?styles.filterBtnActive:styles.filterBtn}>Utenti</button>
        </div>
      </div>

      {/* TABELLA */}
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
                    <td style={styles.tableCell}><div style={styles.itemInfo}><span style={styles.itemName}>{item.nome}</span><span style={styles.itemDate}>{item.created_at?.split('T')[0]}</span></div></td>
                    <td style={styles.tableCell}><input type="number" value={prezzi.prezzoFornitore} onChange={e=>{setItems(prev=>prev.map(i=>i.id===item.id?{...i, prezzo_fornitore:Number(e.target.value)||0}:i))}} onBlur={e=>updatePrezzoFornitore(item.id, Number(e.target.value)||0)} style={styles.prezzoInput}/></td>
                    <td style={styles.tableCell}><strong style={styles.prezzoFinale}>€{prezzi.prezzoFinale}</strong></td>
                    <td style={styles.tableCell}><div style={styles.guadagnoCell}><strong style={styles.guadagno}>€{prezzi.guadagnoAdmin}</strong></div></td>
                    <td style={styles.tableCell}><button onClick={()=>toggleVenduto(item)} style={item.venduto?styles.btnActive:styles.btnInactive}>{item.venduto?'SÌ':'NO'}</button></td>
                    <td style={styles.tableCell}><button onClick={()=>toggleAttivo(item)} style={item.is_active?styles.btnActive:styles.btnInactive}>{item.is_active?'SÌ':'NO'}</button></td>
                    <td style={styles.tableCell}>{item.fornitore?'Fornitore':'Utente'}</td>
                    <td style={styles.tableCell}><button onClick={()=>deleteItem(item.id)} style={styles.btnDelete}>🗑</button></td>
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

// STILI
const styles = {
  container:{padding:'20px', fontFamily:'Arial, sans-serif'},
  loading:{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'},
  headerCompact:{display:'flex', flexDirection:'column', marginBottom:'20px'},
  h1Compact:{marginBottom:'10px'},
  kpiInline:{display:'flex', gap:'20px', marginBottom:'10px'},
  guadagnoBox:{backgroundColor:'#f0fdf4', padding:'10px', borderRadius:'8px', display:'flex', flexDirection:'column', alignItems:'center'},
  guadagnoLabel:{fontSize:'12px', color:'#065f46'},
  guadagnoInputContainer:{display:'flex', alignItems:'center', gap:'5px', marginTop:'5px'},
  arrowBtn:{padding:'2px 6px', cursor:'pointer', border:'1px solid #ccc', borderRadius:'3px', background:'#fff'},
  commissioneSliderInput:{width:'50px', textAlign:'center', margin:'0 5px'},
  commissioneValue:{minWidth:'35px', textAlign:'center'},
  guadagnoAmount:{marginTop:'5px', fontWeight:'bold', color:'#065f46'},
  kpiSmall:{backgroundColor:'#fef3c7', padding:'10px', borderRadius:'8px', textAlign:'center'},
  kpiNumber:{fontSize:'16px', fontWeight:'bold'},
  kpiLabelSmall:{fontSize:'12px'},
  headerButtonsCompact:{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'15px'},
  btnBack:{backgroundColor:'#e5e7eb', border:'none', padding:'6px 10px', borderRadius:'5px', cursor:'pointer'},
  btnExportPDF:{backgroundColor:'#3b82f6', color:'#fff', border:'none', padding:'6px 10px', borderRadius:'5px', cursor:'pointer'},
  btnExportCSV:{backgroundColor:'#10b981', color:'#fff', border:'none', padding:'6px 10px', borderRadius:'5px', cursor:'pointer'},
  btnExportPrint:{backgroundColor:'#f59e0b', color:'#fff', border:'none', padding:'6px 10px', borderRadius:'5px', cursor:'pointer'},
  btnExportRefresh:{backgroundColor:'#6b7280', color:'#fff', border:'none', padding:'6px 10px', borderRadius:'5px', cursor:'pointer'},
  btnChart:{backgroundColor:'#6366f1', color:'#fff', border:'none', padding:'6px 10px', borderRadius:'5px', cursor:'pointer'},
  btnFormFornitore:{backgroundColor:'#8b5cf6', color:'#fff', border:'none', padding:'6px 10px', borderRadius:'5px', cursor:'pointer'},
  formFornitore:{display:'flex', gap:'5px', marginBottom:'10px'},
  inputForm:{padding:'4px 6px', borderRadius:'4px', border:'1px solid #ccc'},
  btnCreateFornitore:{backgroundColor:'#8b5cf6', color:'#fff', border:'none', padding:'6px 10px', borderRadius:'5px', cursor:'pointer'},
  chartsRowCompact:{display:'flex', gap:'20px', marginBottom:'10px'},
  chartCardCompact:{flex:'1', height:'200px', background:'#f3f4f6', padding:'10px', borderRadius:'8px'},
  columnFiltersRow:{display:'flex', gap:'20px', marginBottom:'10px'},
  filterToggle:{display:'flex', gap:'5px', alignItems:'center'},
  filterLabelSmall:{fontSize:'12px'},
  filterBtn:{padding:'3px 6px', borderRadius:'4px', border:'1px solid #ccc', background:'#fff', cursor:'pointer'},
  filterBtnActive:{padding:'3px 6px', borderRadius:'4px', border:'1px solid #6366f1', background:'#6366f1', color:'#fff', cursor:'pointer'},
  tableContainer:{overflowX:'auto'},
  tableWrapper:{minWidth:'900px'},
  table:{width:'100%', borderCollapse:'collapse'},
  tableHeadRow:{background:'#f3f4f6'},
  tableHead:{padding:'8px', border:'1px solid #d1d5db', textAlign:'center', fontWeight:'bold'},
  tableRow:{borderBottom:'1px solid #d1d5db'},
  tableCell:{padding:'6px', border:'1px solid #d1d5db', textAlign:'center'},
  itemInfo:{display:'flex', flexDirection:'column'},
  itemName:{fontWeight:'bold'},
  itemDate:{fontSize:'10px', color:'#6b7280'},
  prezzoInput:{width:'70px', textAlign:'center', padding:'2px', borderRadius:'4px', border:'1px solid #ccc'},
  prezzoFinale:{color:'#10b981'},
  guadagnoCell:{display:'flex', justifyContent:'center'},
  guadagno:{color:'#065f46', fontWeight:'bold'},
  btnActive:{backgroundColor:'#10b981', color:'#fff', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer'},
  btnInactive:{backgroundColor:'#ef4444', color:'#fff', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer'},
  btnDelete:{backgroundColor:'#ef4444', color:'#fff', border:'none', padding:'4px 6px', borderRadius:'4px', cursor:'pointer'},
};

// FUNZIONI ESPORTAZIONE
function exportPDF(){
  const doc = new jsPDF();
  doc.text("Marketplace Export", 10, 10);
  doc.save("marketplace.pdf");
}
function exportCSV(){
  alert("Funzione CSV non ancora implementata completamente");
}
function printMarketplace(){
  window.print();
}
