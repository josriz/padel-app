// src/components/MarketplaceList.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { ShoppingCart, Clock, Search, X } from 'lucide-react';

export default function MarketplaceList() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ nome: '', descrizione: '', prezzo: '', immagine_url: '', categoria: '' });

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*');

      if (!error) setItems(data || []);
      setLoading(false);
    };

    fetchItems();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    const payload = { ...newItem, prezzo: Number(newItem.prezzo), user_id: user?.id || null };
    const { data, error } = await supabase
      .from('marketplace_items')
      .insert(payload)
      .select();

    if (!error) {
      setItems([data[0], ...items]);
      setShowAddModal(false);
      setNewItem({ nome: '', descrizione: '', prezzo: '', immagine_url: '', categoria: '' });
    }
  };

  const contactSeller = (item) => {
    const message = `Ciao! Interessato ${item.nome} (€${item.prezzo})`;
    window.open(`https://wa.me/393331234567?text=${encodeURIComponent(message)}`);
  };

  // Filtri e ordinamenti
  let filteredItems = items.filter(item =>
    (item.nome?.toLowerCase().includes(search.toLowerCase()) ||
    item.descrizione?.toLowerCase().includes(search.toLowerCase())) &&
    (categoryFilter ? item.categoria === categoryFilter : true)
  );

  if (sortOption === 'priceAsc') filteredItems.sort((a, b) => a.prezzo - b.prezzo);
  if (sortOption === 'priceDesc') filteredItems.sort((a, b) => b.prezzo - a.prezzo);
  if (sortOption === 'recent') filteredItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const isNew = (dateStr) => {
    const itemDate = new Date(dateStr);
    const today = new Date();
    const diffDays = (today - itemDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
          <ShoppingCart className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace Padel</h1>
        <p className="text-lg text-gray-600">({filteredItems.length} articoli)</p>
      </div>

      {/* SEARCH + FILTRI */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 max-w-2xl mx-auto space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Cerca racchette, scarpe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl"
          >
            <option value="">Tutte le categorie</option>
            <option value="racchette">Racchette</option>
            <option value="scarpe">Scarpe</option>
            <option value="abbigliamento">Abbigliamento</option>
          </select>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl"
          >
            <option value="recent">Più recenti</option>
            <option value="priceAsc">Prezzo ?</option>
            <option value="priceDesc">Prezzo ?</option>
          </select>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all relative">

            {/* BADGE NUOVO */}
            {isNew(item.created_at) && (
              <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">NUOVO</span>
            )}

            {/* FOTO */}
            <div className="w-full h-48 rounded-xl overflow-hidden mb-4 shadow-md">
              <img 
                src={item.immagine_url}
                alt={item.nome}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.nome}</h3>

            <div className="flex justify-between items-baseline mb-3">
              <span className="text-2xl font-black text-emerald-600">€{item.prezzo}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.venduto ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-800'}`}>
                {item.venduto ? 'VENDUTO' : 'DISPONIBILE'}
              </span>
            </div>

            {item.descrizione && (
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.descrizione}</p>
            )}

            <div className="flex items-center text-xs text-gray-500 mb-4">
              <Clock className="w-4 h-4 mr-1" />
              <span>{item.created_at?.slice(0, 10)}</span>
            </div>

            <button
              onClick={() => contactSeller(item)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all"
            >
              Contatta su WhatsApp
            </button>
          </div>
        ))}
      </div>

      {/* BUTTON AGGIUNGI */}
      <div className="text-center pt-12">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
        >
          + Aggiungi articolo
        </button>
      </div>

      {/* MODAL AGGIUNGI */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Aggiungi articolo</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={addItem} className="space-y-4">
              <input
                placeholder="Nome (es: Racchetta Bullpadel)"
                value={newItem.nome}
                onChange={(e) => setNewItem({...newItem, nome: e.target.value})}
                className="w-full p-3 border rounded-xl"
                required
              />
              <input
                type="number"
                placeholder="Prezzo"
                value={newItem.prezzo}
                onChange={(e) => setNewItem({...newItem, prezzo: e.target.value})}
                className="w-full p-3 border rounded-xl"
                required
              />
              <textarea
                placeholder="Descrizione"
                value={newItem.descrizione}
                onChange={(e) => setNewItem({...newItem, descrizione: e.target.value})}
                rows="3"
                className="w-full p-3 border rounded-xl"
              />
              <select
                value={newItem.categoria}
                onChange={(e) => setNewItem({...newItem, categoria: e.target.value})}
                className="w-full p-3 border rounded-xl"
              >
                <option value="">Seleziona categoria</option>
                <option value="racchette">Racchette</option>
                <option value="scarpe">Scarpe</option>
                <option value="abbigliamento">Abbigliamento</option>
              </select>
              <input
                placeholder="URL immagine"
                value={newItem.immagine_url}
                onChange={(e) => setNewItem({...newItem, immagine_url: e.target.value})}
                className="w-full p-3 border rounded-xl"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-3 border rounded-xl">
                  Annulla
                </button>
                <button type="submit" className="flex-1 p-3 bg-emerald-600 text-white rounded-xl">
                  Pubblica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
