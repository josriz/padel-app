import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from "react-chartjs-2";
import jsPDF from 'jspdf';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MarketplaceAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commissionePercent, setCommissionePercent] = useState(20);
  const [columnFilters, setColumnFilters] = useState({venduto: 'tutti', attivo: 'tutti', fornitori: 'tutti'});
  const [showCharts, setShowCharts] = useState(false);

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
      <div style={styles.headerCompact}>
        <h1 style={styles.h1Compact}>📊 Marketplace</h1>
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
              <span style={styles.commissioneValue}>{commissionePercent}%</span>
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
          <button onClick={exportPDF} style={styles.btnExportPDF} title="PDF">📄 PDF</button>
          <button onClick={exportCSV} style={styles.btnExportCSV} title="CSV/Excel">📊 CSV</button>
          <button onClick={fetchItems} style={styles.btnExportRefresh} title="Refresh">🔄 Refresh</button>
          <button onClick={() => setShowCharts(!showCharts)} style={styles.btnChart}>
            📈 {showCharts ? 'Nascondi' : 'Grafici'}
          </button>
        </div>
      </div>

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

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Gestione Articoli 
            <span style={styles.filterCount}>({filteredItems.length} di {items.length})</span>
          </h2>
        </div>

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
              {filteredItems.map(item => {
                const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
                return (
                  <tr key={item.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.itemInfo}>
                        <span style={styles.itemName}>{item.nome}</span>
                        <span style={styles.itemDate}>{item.created_at?.split('T')[0]}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <input 
                        type="number"
                        value={prezzi.prezzoFornitore}
                        onChange={e => {
                          setItems(prev => prev.map(i => 
                            i.id === item.id 
                              ? {...i, prezzo_fornitore: Number(e.target.value) || 0} 
                              : i
                          ));
                        }}
                        onBlur={e => updatePrezzoFornitore(item.id, Number(e.target.value) || 0)}
                        style={styles.prezzoInput}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <strong style={styles.prezzoFinale}>€{prezzi.prezzoFinale}</strong>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.guadagnoCell}>
                        <strong style={styles.guadagno}>€{prezzi.guadagnoAdmin}</strong>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <button onClick={() => toggleVenduto(item)} style={item.venduto ? styles.btnActive : styles.btnInactive}>
                        {item.venduto ? 'SÌ' : 'NO'}
                      </button>
                    </td>
                    <td style={styles.tableCell}>
                      <button onClick={() => toggleAttivo(item)} style={item.is_active ? styles.btnActive : styles.btnInactive}>
                        {item.is_active ? 'SÌ' : 'NO'}
                      </button>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.vendorType}>
                        {item.fornitore ? '✅ Fornitore' : '👤 Utente'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <button onClick={() => deleteItem(item.id)} style={styles.deleteBtn}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '16px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  headerCompact: { background: 'white', padding: '12px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '12px', gap: '16px', flexWrap: 'wrap' },
  h1Compact: { margin: 0, fontSize: '20px', fontWeight: 700, color: '#1f2937' },
  kpiInline: { display: 'flex', alignItems: 'flex-end', gap: '24px' },
  guadagnoBox: { background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', minWidth: '160px' },
  guadagnoLabel: { fontSize: '11px', opacity: 0.9, marginBottom: '2px' },
  guadagnoInputContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' },
  commissioneSlider: { 
    width: '80px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.3)', 
    outline: 'none', marginRight: '8px', WebkitAppearance: 'none', 
    '&::-webkit-slider-thumb': { WebkitAppearance: 'none', width: '16px', height: '16px', borderRadius: '50%', background: 'white', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }
  },
  commissioneValue: { fontSize: '14px', fontWeight: 700, minWidth: '24px', color: 'rgba(255,255,255,0.95)' },
  guadagnoAmount: { fontSize: '20px', fontWeight: 700 },
  kpiSmall: { textAlign: 'center', minWidth: '60px' },
  kpiNumber: { fontSize: '20px', fontWeight: 700, color: '#1f2937' },
  kpiLabelSmall: { fontSize: '10px', color: '#6b7280', fontWeight: 500 },
  headerButtonsCompact: { display: 'flex', gap: '12px', alignItems: 'center' },
  btnExportPDF: { background: 'linear-gradient(135deg, #ec4899, #db2777)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, height: '44px', minWidth: '80px', boxShadow: '0 2px 8px rgba(236,72,153,0.3)' },
  btnExportCSV: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, height: '44px', minWidth: '90px', boxShadow: '0 2px 8px rgba(245,158,11,0.3)' },
  btnExportRefresh: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, height: '44px', minWidth: '100px', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' },
  btnChart: { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, height: '44px', minWidth: '100px', boxShadow: '0 2px 8px rgba(139,92,246,0.3)' },
  chartsRowCompact: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  chartCardCompact: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', height: '200px' },
  columnFiltersRow: { background: '#f8fafc', padding: '12px 24px', borderRadius: '8px', display: 'flex', gap: '20px', marginBottom: '12px', border: '1px solid #e5e7eb' },
  filterToggle: { display: 'flex', alignItems: 'center', gap: '8px' },
  filterLabelSmall: { fontSize: '12px', fontWeight: 600, color: '#374151', minWidth: '50px' },
  filterBtn: { padding: '6px 12px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', color: '#6b7280' },
  filterBtnActive: { padding: '6px 12px', border: '1px solid #10b981', background: '#10b981', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', color: 'white', fontWeight: 500 },
  filterCount: { background: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', marginLeft: '12px' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '20px' },
  tableHeader: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9' },
  tableTitle: { margin: 0, fontSize: '18px', fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center' },
  tableWrapper: { maxHeight: '400px', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeadRow: { background: '#f8fafc' },
  tableHead: { padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151', position: 'sticky', top: 0 },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  tableCell: { padding: '12px 16px', verticalAlign: 'middle' },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  itemName: { fontWeight: 600, color: '#1f2937', fontSize: '14px' },
  itemDate: { fontSize: '11px', color: '#9ca3af' },
  prezzoInput: { padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', width: '80px', height: '28px' },
  prezzoFinale: { fontWeight: 700, color: '#dc2626', fontSize: '15px' },
  guadagnoCell: { background: '#dcfce7', padding: '8px', borderRadius: '8px', textAlign: 'center' },
  guadagno: { fontWeight: 700, color: '#166534', fontSize: '14px' },
  btnActive: { background: '#10b981', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', height: '26px' },
  btnInactive: { background: 'white', color: '#6b7280', border: '2px solid #e5e7eb', padding: '2px 8px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', height: '26px' },
  deleteBtn: { background: '#ef4444', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  vendorType: { fontSize: '12px', fontWeight: 500 },
  loading: { padding: '80px 20px', textAlign: 'center', fontSize: '16px', color: '#6b7280' }
};
