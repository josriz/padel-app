import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./marketplace-admin.css";

export default function MarketplaceAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("marketplace_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleVenduto = async (item) => {
    await supabase
      .from("marketplace_items")
      .update({ venduto: !item.venduto })
      .eq("id", item.id);
    fetchItems();
  };

  const toggleAttivo = async (item) => {
    await supabase
      .from("marketplace_items")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
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
    incasso: items
      .filter(i => i.venduto)
      .reduce((sum, i) => sum + Number(i.prezzo || 0), 0)
  };

  if (loading) return <h2 className="admin-loading">Caricamento admin...</h2>;

  return (
    <div className="admin-container">
      <h1>📊 ADMIN MARKETPLACE</h1>

      <div className="admin-stats">
        <div>Totale: <b>{stats.totale}</b></div>
        <div>Venduti: <b>{stats.venduti}</b></div>
        <div>Attivi: <b>{stats.attivi}</b></div>
        <div>Incasso: <b>€{stats.incasso.toFixed(2)}</b></div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Prezzo</th>
            <th>Venduto</th>
            <th>Attivo</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className={item.venduto ? "sold-row" : ""}>
              <td>{item.nome}</td>
              <td>€{item.prezzo}</td>
              <td>
                <button onClick={() => toggleVenduto(item)}>
                  {item.venduto ? "SI" : "NO"}
                </button>
              </td>
              <td>
                <button onClick={() => toggleAttivo(item)}>
                  {item.is_active ? "SI" : "NO"}
                </button>
              </td>
              <td>
                <button className="delete" onClick={() => deleteItem(item.id)}>
                  ELIMINA
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
