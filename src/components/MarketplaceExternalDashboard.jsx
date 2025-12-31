// src/components/MarketplaceExternalDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from "react-chartjs-2";
import jsPDF from 'jspdf';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MarketplaceExternalDashboard() {
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
    const { data, error } = await supabase
      .from("marketplace_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Errore fetch:", error);
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const toggleVenduto = async (item) => {
    await supabase.from("marketplace_items").update({ venduto: !item.venduto }).eq("id", item.id);
    fetchItems();
  };

  const toggleAttivo = async (item) => {
    await supabase.from("marketplace_items").update({ is_active: !item.is_active }).eq("id", item.id);
    fetchItems();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text(`Marketplace External Report - ${new Date().toLocaleDateString('it-IT')}`, 20, y);
    y += 15;
    doc.setFontSize(12);
    doc.text(`Commissioni: ${commissionePercent}%`, 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text('Articolo', 10, y); 
    doc.text('Finale (+commissione)', 90, y); 
    doc.text('Guadagno', 140, y); 
    doc.text('Venduto', 180, y);
    y += 10;

    items.slice(0, 50).forEach(item => {
      const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
      doc.text((item.nome || '').slice(0, 25), 10, y);
      doc.text(`€${prezzi.prezzoFinale}`, 90, y);
      doc.text(`€${prezzi.guadagnoAdmin}`, 140, y);
      doc.text(item.venduto ? 'SÌ' : 'NO', 180, y);
      y += 8;
      if (y > 280) { doc.addPage(); y = 20; }
    });

    doc.save(`external-dashboard-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const exportCSV = () => {
    const csv = [
      ['Articolo', `Finale (+${commissionePercent}%)`, 'Guadagno Admin', 'Venduto', 'Attivo', 'Fornitore'],
      ...items.map(item => {
        const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
        return [item.nome || '', prezzi.prezzoFinale, prezzi.guadagnoAdmin, item.venduto ? 'SÌ':'NO', item.is_active ? 'SÌ':'NO', item.fornitore ? 'SÌ':'NO'];
      })
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `external-dashboard-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = {
    totale: items.length,
    venduti: items.filter(i => i.venduto).length,
    attivi: items.filter(i => i.is_active).length
  };

  const pieData = { labels: ["Venduti", "Disponibili"], datasets: [{ data: [stats.venduti, stats.totale - stats.venduti], backgroundColor: ["#10b981", "#e5e7eb"] }] };
  const barData = { labels: ["Venduti", "Attivi", "Totali"], datasets: [{ data: [stats.venduti, stats.attivi, stats.totale], backgroundColor: ["#10b981","#f59e0b","#3b82f6"] }] };
  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}>Caricamento...</div>;

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif', minHeight: '100vh', background: '#f0f4f8' }}>
      <h1 style={{ marginBottom: 16 }}>📊 Dashboard Società Esterne</h1>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <label>Commissione: {commissionePercent}%</label>
          <input type="range" min="5" max="50" value={commissionePercent} onChange={e => setCommissionePercent(Number(e.target.value))} style={{ cursor:'pointer' }} />
        </div>
        <button onClick={() => setShowCharts(!showCharts)} style={{ padding: 10, borderRadius: 8, background: '#3b82f6', color: 'white', cursor: 'pointer' }}>
          {showCharts ? 'Nascondi Grafici' : 'Mostra Grafici'}
        </button>
        <button onClick={fetchItems} style={{ padding: 10, borderRadius: 8, background: '#10b981', color: 'white', cursor: 'pointer' }}>🔄 Refresh</button>
        <button onClick={exportPDF} style={{ padding: 10, borderRadius: 8, background: '#ec4899', color: 'white', cursor: 'pointer' }}>📄 PDF</button>
        <button onClick={exportCSV} style={{ padding: 10, borderRadius: 8, background: '#f59e0b', color: 'white', cursor: 'pointer' }}>📊 CSV</button>
      </div>

      {showCharts && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, height: 200 }}><Pie data={pieData} options={pieOptions} /></div>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, height: 200 }}><Bar data={barData} options={barOptions} /></div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 12, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
              <th>Articolo</th>
              <th>Prezzo Finale</th>
              <th>Guadagno Admin</th>
              <th>Venduto</th>
              <th>Attivo</th>
              <th>Tipo</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const prezzi = calculatePrezzi(item.prezzo_fornitore || item.prezzo);
              return (
                <tr key={item.id} style={{ borderBottom:'1px solid #eee' }}>
                  <td>{item.nome}</td>
                  <td>€{prezzi.prezzoFinale}</td>
                  <td>€{prezzi.guadagnoAdmin}</td>
                  <td><button onClick={()=>toggleVenduto(item)} style={{padding:4,borderRadius:6,background:item.venduto?'#10b981':'#eee',color:item.venduto?'white':'#333',cursor:'pointer'}}>{item.venduto?'SÌ':'NO'}</button></td>
                  <td><button onClick={()=>toggleAttivo(item)} style={{padding:4,borderRadius:6,background:item.is_active?'#10b981':'#eee',color:item.is_active?'white':'#333',cursor:'pointer'}}>{item.is_active?'SÌ':'NO'}</button></td>
                  <td>{item.fornitore?'✅ Fornitore':'👤 Utente'}</td>
                  <td>—</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
