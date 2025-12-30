import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MarketplaceAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterVenditore, setFilterVenditore] = useState("tutti");
  const [period, setPeriod] = useState("trimestrale");

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase.from("marketplace_items").select("*").order("created_at", { ascending: false });
    
    const { data, error } = await query;
    if (error) console.error("Errore fetchItems:", error);
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [filterVenditore, period]);

  const toggleVenduto = async (item) => {
    await supabase.from("marketplace_items").update({ venduto: !item.venduto }).eq("id", item.id);
    fetchItems();
  };

  const toggleAttivo = async (item) => {
    await supabase.from("marketplace_items").update({ is_active: !item.is_active }).eq("id", item.id);
    fetchItems();
  };

  const deleteItem = async (id) => {
    if (!confirm("ELIMINARE DEFINITIVAMENTE?")) return;
    await supabase.from("marketplace_items").delete().eq("id", id);
    fetchItems();
  };

  const stats = {
    totale: items.length,
    venduti: items.filter(i => i.venduto).length,
    attivi: items.filter(i => i.is_active).length,
    incasso: items.filter(i => i.venduto).reduce((sum, i) => sum + Number(i.prezzo || 0), 0)
  };

  const pieData = {
    labels: ["Venduti", "Disponibili"],
    datasets: [{ data: [stats.venduti, stats.totale - stats.venduti], backgroundColor: ["#10b981", "#e5e7eb"] }]
  };

  const barData = {
    labels: ["Totale", "Venduti", "Attivi"],
    datasets: [{ label: "Articoli", data: [stats.totale, stats.venduti, stats.attivi], backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"] }]
  };

  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, indexAxis: 'y', scales: { x: { display: false }, y: { display: false } } };

  if (loading) return <div style={styles.loading}>Caricando...</div>;

  return (
    <div style={styles.container}>
      {/* HEADER CON MENU */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.h1}>📊 Admin Marketplace</h1>
          <p style={styles.headerSubtitle}>{items.length} articoli • {new Date().toLocaleDateString('it-IT')}</p>
        </div>
        <div style={styles.headerRight}>
          <button onClick={fetchItems} style={styles.refreshBtn}>🔄 Refresh</button>
        </div>
      </div>

      {/* FILTRI */}
      <div style={styles.filtersRow}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Venditore</label>
          <select value={filterVenditore} onChange={e => setFilterVenditore(e.target.value)} style={styles.select}>
            <option value="tutti">Tutti</option>
            <option value="fornitori">Fornitori</option>
            <option value="utente">Utenti</option>
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Periodo</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={styles.select}>
            <option value="trimestrale">Trimestre</option>
            <option value="semestrale">Semestre</option>
            <option value="annuale">Anno</option>
          </select>
        </div>
      </div>

      {/* KPI */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Incasso Totale</div>
          <div style={styles.kpiValue}>€{stats.incasso.toLocaleString()}</div>
          <div style={styles.kpiChange}>+12.5%</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Articoli Venduti</div>
          <div style={styles.kpiValue}>{stats.venduti}</div>
          <div style={styles.kpiChange}>+27%</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Articoli Totali</div>
          <div style={styles.kpiValue}>{stats.totale}</div>
          <div style={styles.kpiChange}>+3.2%</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Attivi</div>
          <div style={styles.kpiValue}>{stats.attivi}</div>
          <div style={styles.kpiChange}>+8.1%</div>
        </div>
      </div>

      {/* CHARTS */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Venduti vs Disponibili</h3>
          <div style={styles.pieChartContainer}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Distribuzione</h3>
          <div style={styles.barChartContainer}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* TABELLA */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Gestione Articoli ({items.length})</h2>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.tableHead}>Articolo</th>
                <th style={styles.tableHead}>Prezzo</th>
                <th style={styles.tableHead}>Venduto</th>
                <th style={styles.tableHead}>Attivo</th>
                <th style={styles.tableHead}>Fornitore</th>
                <th style={styles.tableHead}>Utente</th>
                <th style={styles.tableHead}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemName}>{item.nome}</span>
                      <span style={styles.itemDate}>{item.created_at?.split('T')[0]}</span>
                    </div>
                  </td>
                  <td style={styles.tableCell}><span style={styles.price}>€{item.prezzo}</span></td>
                  <td style={styles.tableCell}>
                    <button 
                      onClick={() => toggleVenduto(item)}
                      style={item.venduto ? styles.btnActive : styles.btnInactive}
                    >
                      {item.venduto ? 'SÌ' : 'NO'}
                    </button>
                  </td>
                  <td style={styles.tableCell}>
                    <button 
                      onClick={() => toggleAttivo(item)}
                      style={item.is_active ? styles.btnActive : styles.btnInactive}
                    >
                      {item.is_active ? 'SÌ' : 'NO'}
                    </button>
                  </td>
                  <td style={styles.tableCell}>{item.fornitore || '-'}</td>
                  <td style={styles.tableCell}>{item.utente_standard || '-'}</td>
                  <td style={styles.tableCell}>
                    <button onClick={() => deleteItem(item.id)} style={styles.deleteBtn}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// INLINE STYLES COMPLETI - ZERO CSS ESTERNO
const styles = {
  container: {
    padding: '24px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
  },
  header: {
    background: 'white',
    padding: '24px 32px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  h1: { margin: 0, fontSize: '28px', fontWeight: 700, color: '#1f2937' },
  headerSubtitle: { margin: 0, color: '#6b7280', fontSize: '14px' },
  refreshBtn: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
  },
  filtersRow: {
    background: 'white',
    padding: '20px 32px',
    borderRadius: '16px',
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' },
  filterLabel: { color: '#374151', fontWeight: 600, fontSize: '14px' },
  select: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: 'white',
    fontSize: '14px',
    cursor: 'pointer'
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  kpiCard: {
    background: 'white',
    padding: '32px 24px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  kpiLabel: { color: '#6b7280', fontSize: '14px', fontWeight: 500, marginBottom: '12px' },
  kpiValue: { fontSize: '36px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' },
  kpiChange: { fontSize: '14px', fontWeight: 600, color: '#059669' },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '32px'
  },
  chartCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    height: '400px'
  },
  chartTitle: { margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600, color: '#1f2937' },
  pieChartContainer: { height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  barChartContainer: { height: '280px' },
  tableContainer: { 
    background: 'white', 
    borderRadius: '16px', 
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
    overflow: 'hidden' 
  },
  tableHeader: { padding: '24px 32px', borderBottom: '1px solid #f1f5f9' },
  tableTitle: { margin: 0, fontSize: '20px', fontWeight: 600, color: '#1f2937' },
  tableWrapper: { maxHeight: '500px', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeadRow: { background: '#f8fafc' },
  tableHead: { 
    padding: '20px 24px', 
    textAlign: 'left', 
    fontWeight: 600, 
    fontSize: '14px', 
    color: '#374151',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  tableCell: { padding: '20px 24px', verticalAlign: 'middle' },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  itemName: { fontWeight: 600, color: '#1f2937' },
  itemDate: { fontSize: '12px', color: '#9ca3af' },
  price: { fontWeight: 700, color: '#059669', fontSize: '16px' },
  btnActive: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '25px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
  },
  btnInactive: {
    background: 'white',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    padding: '8px 18px',
    borderRadius: '25px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  deleteBtn: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
  },
  loading: {
    padding: '100px 20px',
    textAlign: 'center',
    fontSize: '18px',
    color: '#6b7280'
  }
};
