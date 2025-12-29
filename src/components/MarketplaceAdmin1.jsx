import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthProvider";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Search,
  Loader2,
  Download,
  DollarSign,
  TrendingUp,
  Package
} from "lucide-react";

export default function MarketplaceAdmin() {
  const { user } = useAuth();
  const isAdmin =
    ["giose.rizzi@gmail.com", "boverob@libero.it", "cfalba@libero.it", "raniero.pierno@gmail.com"]
      .includes(user?.email);

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ nome: "", prezzo: "", descrizione: "" });

  useEffect(() => {
    if (isAdmin) loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    const { data } = await supabase
      .from("marketplace_items")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  const stats = {
    totale: items.reduce((s, i) => s + (i.prezzo || 0), 0).toFixed(2),
    disponibili: items.filter(i => !i.venduto).length,
    venduti: items.filter(i => i.venduto).length
  };

  const filtered = items.filter(i =>
    (i.nome + i.descrizione).toLowerCase().includes(search.toLowerCase())
  );

  async function addItem(e) {
    e.preventDefault();
    await supabase.from("marketplace_items").insert({
      ...newItem,
      prezzo: parseFloat(newItem.prezzo),
      user_id: user.id
    });
    setShowForm(false);
    setNewItem({ nome: "", prezzo: "", descrizione: "" });
    loadItems();
  }

  async function removeItem(id) {
    if (!confirm("Eliminare articolo?")) return;
    await supabase.from("marketplace_items").delete().eq("id", id);
    loadItems();
  }

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-xl">🚫 Accesso negato</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-gray-500">Dashboard amministrativa</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Nuovo articolo
            </button>
            <button
              onClick={loadItems}
              className="px-5 py-2.5 bg-white rounded-xl shadow hover:bg-gray-50"
            >
              Aggiorna
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPI icon={DollarSign} label="Valore totale" value={`€ ${stats.totale}`} />
          <KPI icon={Package} label="Disponibili" value={stats.disponibili} />
          <KPI icon={TrendingUp} label="Venduti" value={stats.venduti} />
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca per nome o descrizione..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border shadow focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* LIST */}
        <div className="grid gap-4">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 shadow hover:shadow-xl transition flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{item.nome}</h3>
                <p className="text-sm text-gray-500">{item.descrizione}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xl font-bold text-emerald-600">
                  € {item.prezzo?.toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form
              onSubmit={addItem}
              className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <h2 className="text-2xl font-bold">Nuovo articolo</h2>
              <input
                placeholder="Nome"
                value={newItem.nome}
                onChange={e => setNewItem({ ...newItem, nome: e.target.value })}
                className="w-full p-3 border rounded-xl"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Prezzo"
                value={newItem.prezzo}
                onChange={e => setNewItem({ ...newItem, prezzo: e.target.value })}
                className="w-full p-3 border rounded-xl"
                required
              />
              <textarea
                placeholder="Descrizione"
                value={newItem.descrizione}
                onChange={e => setNewItem({ ...newItem, descrizione: e.target.value })}
                className="w-full p-3 border rounded-xl"
              />
              <div className="flex gap-2">
                <button className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold">
                  Salva
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 py-3 rounded-xl"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
      <div className="p-3 bg-emerald-100 rounded-xl">
        <Icon className="w-6 h-6 text-emerald-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
