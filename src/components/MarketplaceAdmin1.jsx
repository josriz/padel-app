import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Pie, Bar } from "react-chartjs-2";
import "../styles/marketplace-admin.css";

export default function MarketplaceAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterVenditore, setFilterVenditore] = useState("tutti"); // Fornitori o utenti standard
  const [period, setPeriod] = useState("trimestrale"); // trimestrale, semestrale, annuale

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase.from("marketplace_items").select("*").order("created_at", { ascending: false });

    if (filterVenditore === "fornitori") query = query.eq("tipo_utente", "fornitore");
    if (filterVenditore === "utente") query = query.eq("tipo_utente", "utente_standard");

    const { data, error } = await query;

    if (!error) setItems(data || []);
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
    datasets: [
      {
        data: [stats.venduti, stats.totale - stats.venduti],
        backgroundColor: ["#10b981", "#e5e7eb"]
      }
    ]
  };

  const barData = {
    labels: ["Totale", "Venduti", "Attivi"],
    datasets: [
      {
        label: "Articoli",
        data: [stats.totale, stats.venduti, stats.attivi],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"]
      }
    ]
  };

  const pieOptions = { responsive: true, plugins: { legend: { display: false } } };
  const barOptions = { responsive: true, plugins: { legend: { display: false } } };

  if (loading) return <h2 className="admin-loading">Caricamento admin...</h2>;

  return (
    <div className="admin-container">
      <h1>📊 ADMIN MARKETPLACE</h1>

      {/* BANNER COMPATTO */}
      <div className="admin-banner">
        <div className="banner-stats">
          <div><b>Totale:</b> {stats.totale}</div>
          <div><b>Venduti:</b> {stats.venduti}</div>
          <div><b>Attivi:</b> {stats.attivi}</div>
          <div><b>Incasso (€):</b> {stats.incasso.toFixed(2)}</div>
        </div>
        <div className="banner-charts">
          <div className="chart-wrapper">
            <Pie data={pieData} options={pieOptions} />
          </div>
          <div className="chart-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* FILTRI */}
      <div className="filters">
        <label>
          Filtra per:
          <select value={filterVenditore} onChange={e => setFilterVenditore(e.target.value)}>
            <option value="tutti">Tutti</option>
            <option value="fornitori">Fornitori</option>
            <option value="utente">Utenti standard</option>
          </select>
        </label>
        <label>
          Periodo:
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="trimestrale">Trimestrale</option>
            <option value="semestrale">Semestrale</option>
            <option value="annuale">Annuale</option>
          </select>
        </label>
      </div>

      {/* TABELLA ARTICOLI */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Articolo</th>
            <th>Prezzo</th>
            <th>Venduto</th>
            <th>Attivo</th>
            <th>Fornitore</th>
            <th>Utente Standard</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className={item.venduto ? "sold-row" : ""}>
              <td>{item.nome}</td>
              <td>€{item.prezzo}</td>
              <td><button onClick={() => toggleVenduto(item)}>{item.venduto ? "SI" : "NO"}</button></td>
              <td><button onClick={() => toggleAttivo(item)}>{item.is_active ? "SI" : "NO"}</button></td>
              <td>{item.fornitore || "-"}</td>
              <td>{item.utente_standard || "-"}</td>
              <td><button className="delete" onClick={() => deleteItem(item.id)}>ELIMINA</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
