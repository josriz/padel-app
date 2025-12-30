import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { ShoppingBag, Plus, Trash2, Search, Loader2, DollarSign, Package, TrendingUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MarketplaceAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin =
    ["giose.rizzi@gmail.com", "boverob@libero.it", "cfalba@libero.it", "raniero.pierno@gmail.com"]
      .includes(user?.email);

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newItem, setNewItem] = useState({
    nome: "",
    prezzo: "",
    descrizione: "",
    percentualeGuadagno: ""
  });

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

  const filtered = items.filter(i =>
    (i.nome + i.descrizione).toLowerCase().includes(search.toLowerCase())
  );

  async function addItem(e) {
    e.preventDefault();
    await supabase.from("marketplace_items").insert({
      nome: newItem.nome,
      prezzo: parseFloat(newItem.prezzo),
      descrizione: newItem.descrizione,
      user_id: user.id
    });
    setShowForm(false);
    setNewItem({ nome: "", prezzo: "", descrizione: "", percentualeGuadagno: "" });
    loadItems();
  }

  function calcolaGuadagno(prezzo, percentuale) {
    if (!prezzo || !percentuale) return 0;
    return (parseFloat(prezzo) * parseFloat(percentuale)) / 100;
  }

  const totaleGuadagni = items.reduce((acc, item) => {
    return acc + (item.prezzo && item.percentualeGuadagno ? calcolaGuadagno(item.prezzo, item.percentualeGuadagno) : 0);
  }, 0);

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Indietro
            </button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Marketplace Admin</h1>
              <p className="text-gray-500">Dashboard amministrativa</p>
            </div>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-5 shadow hover:shadow-xl transition flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold">{item.nome}</h3>
                <p className="text-sm text-gray-500">{item.descrizione}</p>
                <span className="text-xl font-bold text-emerald-600">
                  € {item.prezzo?.toFixed(2)}
                </span>
                {item.percentualeGuadagno && (
                  <p className="text-sm text-gray-700">
                    Guadagno stimato: € {calcolaGuadagno(item.prezzo, item.percentualeGuadagno).toFixed(2)}
                  </p>
                )}
              </div>
              <button
                onClick={() => supabase.from("marketplace_items").delete().eq("id", item.id).then(loadItems)}
                className="text-red-600 hover:bg-red-50 p-2 mt-3 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
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
