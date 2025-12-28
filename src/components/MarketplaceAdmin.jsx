// src/components/MarketplaceAdmin.jsx - ✅ CORRETTO LAYOUT FISSO + RESPONSIVE FIX
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
  const [stats, setStats] = useState({ total: 0, monthly: 0, available: 0, sold: 0 });

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from('marketplace_items').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const dataFiltered = data || [];
      const soldItems = dataFiltered.filter(p => p.venduto);
      
      setProducts(dataFiltered);
      setStats({
        total: dataFiltered.length,
        available: dataFiltered.filter(p => !p.venduto).length,
        sold: soldItems.length,
        monthly: soldItems.reduce((sum, p) => sum + (p.prezzo || 0), 0).toFixed(0)
      });
    } catch (error) {
      console.error('Errore fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.nome || !newProduct.prezzo) {
      alert('Nome e prezzo obbligatori!');
      return;
    }
    
    try {
      const { error } = await supabase.from('marketplace_items').insert({
        nome: newProduct.nome.trim(),
        prezzo: parseFloat(newProduct.prezzo),
        descrizione: newProduct.descrizione.trim(),
        user_id: user.id,
        venduto: false
      });
      
      if (error) throw error;
      setNewProduct({ nome: '', prezzo: '', descrizione: '' });
      setShowForm(false);
      fetchData();
      alert('✅ Articolo pubblicato!');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Eliminare definitivamente?')) return;
    try {
      await supabase.from('marketplace_items').delete().eq('id', id);
      fetchData();
    } catch (error) {
      alert('❌ Errore eliminazione');
    }
  };

  const filtered = products.filter(p => 
    p.nome?.toLowerCase().includes(search.toLowerCase()) ||
    p.descrizione?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
        <span>Caricamento...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER COMPATTO */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Marketplace Admin</h1>
                <p className="text-xs sm:text-sm text-gray-500">{user?.email} • {role}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <span>{stats.total} articoli</span>
              <span className="text-emerald-600">€{stats.monthly} mensile</span>
            </div>
          </div>
        </div>

        {/* STATS COMPATTE - LAYOUT FISSO */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
          <div className="text-center p-3">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Articoli</p>
          </div>
          <div className="text-center p-3">
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.available}</p>
            <p className="text-xs text-gray-500 mt-1">Disponibili</p>
          </div>
          <div className="text-center p-3">
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.sold}</p>
            <p className="text-xs text-gray-500 mt-1">Venduti</p>
          </div>
          <div className="text-center p-3 sm:hidden lg:block">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">€{stats.monthly}</p>
            <p className="text-xs text-gray-500 mt-1">Mensile</p>
          </div>
        </div>

        {/* FORM COMPATTO */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-center gap-2 p-3 sm:p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm sm:text-base transition-colors mb-4"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            {showForm ? '❌ Chiudi' : '➕ Nuovo articolo'}
          </button>
          
          {showForm && (
            <form onSubmit={addProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <input 
                  value={newProduct.nome}
                  onChange={e => setNewProduct({...newProduct, nome: e.target.value})}
                  placeholder="Nome articolo" 
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <input 
                  type="number" step="0.01" min="0"
                  value={newProduct.prezzo}
                  onChange={e => setNewProduct({...newProduct, prezzo: e.target.value})}
                  placeholder="Prezzo €" 
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <textarea 
                  value={newProduct.descrizione}
                  onChange={e => setNewProduct({...newProduct, descrizione: e.target.value})}
                  placeholder="Descrizione (opzionale)" 
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical h-20"
                  rows="3"
                />
              </div>
              <button 
                type="submit" 
                className="sm:col-span-2 lg:col-span-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:p-4 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all"
              >
                🚀 PUBBLICA ARTICOLO
              </button>
            </form>
          )}
        </div>

        {/* SEARCH + PRODUCTS - LAYOUT FISSO */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Cerca per nome o descrizione..." 
              className="flex-1 p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-sm text-gray-500 flex items-center gap-2">
              {filtered.length} di {products.length} articoli
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map(product => (
              <div key={product.id} className="border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-md hover:border-gray-300 transition-all bg-white">
                {/* IMMAGINE COMPATTA - foto reali */}
                <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop')] bg-cover bg-center bg-no-repeat opacity-20 group-hover:opacity-50 transition-opacity" />
                  <div className="relative z-10 flex flex-col items-center text-center p-2">
                    <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center mb-1 shadow-sm">
                      <ShoppingBag className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium bg-white/90 px-2 py-1 rounded-full shadow-sm">
                      {product.nome?.slice(0,15)}...
                    </span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2 leading-tight">{product.nome}</h3>
                
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xl sm:text-2xl font-black text-emerald-600">
                    €{product.prezzo?.toFixed(2)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.venduto 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {product.venduto ? 'VENDUTO' : 'DISPONIBILE'}
                  </span>
                </div>
                
                {/* BOTTONI COMPATTI */}
                {(role === 'admin' || product.user_id === user?.id) && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1 min-h-[36px]"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Elimina
                    </button>
                    <button 
                      className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1 min-h-[36px]"
                      onClick={() => alert('Modifica in arrivo!')}
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      Modifica
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun prodotto trovato</h3>
              <p className="text-gray-500 mb-6">{search ? 'Prova con altri termini' : 'Inizia creando il primo articolo'}</p>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                ➕ Crea primo articolo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
