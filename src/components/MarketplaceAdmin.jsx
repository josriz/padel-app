// src/components/MarketplaceAdmin.jsx - ✅ COMPACT + CLEAN + ICONE REALI
import React, { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';
import { useAuth } from "../context/AuthProvider";
import { ShoppingBag, Plus, Edit, Trash2, Search, Loader2, TrendingUp } from 'lucide-react';

export default function MarketplaceAdmin() {
  const { user, role } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ nome: '', prezzo: '', descrizione: '' });
  const [stats, setStats] = useState({ total: 0, monthly: 0, available: 0 });

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data } = await supabase.from('marketplace_items').select('*');
    setProducts(data || []);
    setStats({
      total: data?.length || 0,
      available: data?.filter(p => !p.venduto).length || 0,
      monthly: data?.filter(p => p.venduto)?.reduce((sum, p) => sum + p.prezzo, 0)?.toFixed(0) || 0
    });
    setLoading(false);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    await supabase.from('marketplace_items').insert({
      nome: newProduct.nome,
      prezzo: parseFloat(newProduct.prezzo),
      descrizione: newProduct.descrizione,
      user_id: user.id,
      venduto: false
    });
    setNewProduct({ nome: '', prezzo: '', descrizione: '' });
    setShowForm(false);
    fetchData();
  };

  const deleteProduct = async (id) => {
    await supabase.from('marketplace_items').delete().eq('id', id);
    fetchData();
  };

  const filtered = products.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER COMPATTO */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>{stats.total} articoli</span>
            <span className="text-emerald-600 font-semibold">€{stats.monthly}</span>
          </div>
        </div>

        {/* STATS COMPATTE */}
        <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-2xl shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Articoli</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
            <p className="text-xs text-gray-500">Disponibili</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">€{stats.monthly}</p>
            <p className="text-xs text-gray-500">Mensile</p>
          </div>
        </div>

        {/* FORM COMPATTO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-center gap-2 p-4 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors mb-4"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Chiudi' : 'Nuovo articolo'}
          </button>
          
          {showForm && (
            <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                value={newProduct.nome}
                onChange={e => setNewProduct({...newProduct, nome: e.target.value})}
                placeholder="Nome" 
                className="p-3 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                required
              />
              <input 
                type="number" step="0.01"
                value={newProduct.prezzo}
                onChange={e => setNewProduct({...newProduct, prezzo: e.target.value})}
                placeholder="Prezzo" 
                className="p-3 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                required
              />
              <textarea 
                value={newProduct.descrizione}
                onChange={e => setNewProduct({...newProduct, descrizione: e.target.value})}
                placeholder="Descrizione" 
                className="md:col-span-3 p-3 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 resize-none h-20"
              />
              <button type="submit" className="md:col-span-3 bg-emerald-500 text-white p-3 rounded-xl font-semibold hover:bg-emerald-600">
                Pubblica
              </button>
            </form>
          )}
        </div>

        {/* SEARCH + PRODUCTS */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex gap-4 mb-6">
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Cerca..." 
              className="flex-1 p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <div key={product.id} className="border rounded-2xl p-6 hover:shadow-md transition-all h-fit">
                {/* IMMAGINE COMPATTA - usa foto reali da Unsplash */}
                <div className="w-full h-48 bg-cover bg-center rounded-xl mb-4" 
                     style={{ backgroundImage: `url(https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop)` }}
                     title="Foto racchetta da Unsplash">
                  <div className="h-48 bg-gradient-to-t from-black/20 to-transparent rounded-xl flex items-end p-4">
                    <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                      Foto reale
                    </span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.nome}</h3>
                <p className="text-2xl font-bold text-emerald-600 mb-3">€{product.prezzo?.toFixed(2)}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.venduto 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.venduto ? 'VENDUTO' : 'Disponibile'}
                  </span>
                </div>
                
                {/* BOTTONI COMPATTI */}
                {(role === 'admin' || product.user_id === user?.id) && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 p-3 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Elimina
                    </button>
                    <button className="flex-1 p-3 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-1">
                      <Edit className="w-4 h-4" />
                      Modifica
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nessun prodotto trovato</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
