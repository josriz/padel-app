// src/components/MarketplaceAdmin.jsx - ✅ UTENTI STANDARD POSSONO INSERIRE!
import React, { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';
import { useAuth } from "../context/AuthProvider";
import { ShoppingBag, Plus, Edit3, Trash2, X, Loader2, UserCheck, Camera } from 'lucide-react';

export default function MarketplaceAdmin() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ nome: '', descrizione: '', prezzo: '', immagine_url: '' });
  const [editingProduct, setEditingProduct] = useState(null);

  // ✅ UTENTE STANDARD - FORM SEMPLICE
  const [showUserForm, setShowUserForm] = useState(false);

  useEffect(() => {
    if (user?.id) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
      console.log('📊 Caricati', data?.length || 0, 'prodotti');
    } catch (err) {
      console.error('Errore marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FORM UTENTE STANDARD - SEMPLICE E VELOCE
  const handleUserAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.nome || !newProduct.prezzo) {
      alert('❌ Nome e prezzo obbligatori!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          nome: newProduct.nome.trim(),
          descrizione: newProduct.descrizione.trim() || '',
          prezzo: parseFloat(newProduct.prezzo),
          user_id: user.id,
          venduto: false
        })
        .select()
        .single();

      if (error) throw error;
      
      setProducts([data, ...products]);
      setNewProduct({ nome: '', descrizione: '', prezzo: '', immagine_url: '' });
      setShowUserForm(false);
      alert('✅ Articolo pubblicato!');
      fetchProducts();
    } catch (err) {
      console.error('Errore:', err);
      alert('❌ Errore: ' + err.message);
    }
  };

  const addOrUpdateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.nome || !newProduct.prezzo) return;

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('marketplace_items')
          .update({
            nome: newProduct.nome,
            descrizione: newProduct.descrizione,
            prezzo: parseFloat(newProduct.prezzo),
            immagine_url: newProduct.immagine_url
          })
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('marketplace_items')
          .insert({
            ...newProduct,
            prezzo: parseFloat(newProduct.prezzo),
            user_id: user.id,
            venduto: false
          });
        if (error) throw error;
      }
      setShowAddModal(false);
      setEditingProduct(null);
      setNewProduct({ nome: '', descrizione: '', prezzo: '', immagine_url: '' });
      fetchProducts();
    } catch (err) {
      console.error('Errore salvataggio prodotto:', err);
    }
  };

  const deleteProduct = async (product) => {
    console.log('🔥 CLICK ELIMINA:', product.id, 'Nome:', product.nome, 'User:', user?.email);
    
    if (!confirm(`Eliminare "${product.nome}" definitivamente?`)) {
      console.log('❌ Annullato dall\'utente');
      return;
    }
    
    const oldProducts = products;
    setProducts(products.filter(p => p.id !== product.id));
    setDeletingId(product.id);
    
    console.log('🔥 UI RIMUOVO OTIMISTICO, vecchi prodotti:', oldProducts.length);
    
    try {
      console.log('🚀 INVIO DELETE Supabase:', product.id);
      const { data, error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', product.id)
        .select();

      console.log('📤 RISULTATO Supabase:', { data, error });
      
      if (error) {
        console.error('❌ SUPABASE ERROR:', error);
        throw error;
      }
      
      console.log('✅ ELIMINATO DAL DB:', product.nome);
      
    } catch (err) {
      console.error('💥 DELETE FALLITO COMPLETO:', err);
      setProducts(oldProducts);
      alert(`❌ Errore eliminazione: ${err.message}`);
    } finally {
      setDeletingId(null);
      console.log('🏁 Fine delete, deletingId reset');
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      nome: product.nome,
      descrizione: product.descrizione,
      prezzo: product.prezzo,
      immagine_url: product.immagine_url
    });
    setShowAddModal(true);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({ nome: '', descrizione: '', prezzo: '', immagine_url: '' });
    setShowAddModal(false);
  };

  const filteredProducts = products.filter(p =>
    p.nome?.toLowerCase().includes(search.toLowerCase()) ||
    p.descrizione?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-500 border-t-transparent mx-auto mb-4"></div>
      <p className="text-lg font-semibold text-gray-700">Caricamento marketplace...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2B0B3F] via-[#5E1A5F] to-[#FF7A3C] pt-4 pb-12">
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* ✅ HEADER CON RUOLO */}
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-white">
            <ShoppingBag className="w-8 h-8 md:w-9 md:h-9 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-100 bg-clip-text text-transparent mb-2">
            Marketplace
          </h1>
          <p className="text-lg font-semibold text-gray-100">
            👤 <span className="font-mono bg-white/10 px-4 py-2 rounded-xl shadow-sm border border-white/30">
              {user?.email || 'Nessuno'}
            </span>{" "}
            | 📦 {products.length} articoli | 🔍 {filteredProducts.length} visibili
          </p>
          <p className="text-sm text-emerald-200 font-semibold mt-1">
            {user?.user_metadata?.role === 'admin' ? '👑 ADMIN' : '👤 UTENTE STANDARD'}
          </p>
        </div>

        {/* ✅ FORM VELOCE PER UTENTI STANDARD */}
        {user && (
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
            <button 
              onClick={() => setShowUserForm(!showUserForm)}
              className="w-full p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xl font-black rounded-3xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-4 mb-6"
            >
              <Plus className="w-8 h-8" />
              {showUserForm ? '❌ Chiudi Form' : '➕ INSERISCI NUOVO ARTICOLO'}
            </button>

            {showUserForm && (
              <form onSubmit={handleUserAddProduct} className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">📝 Nome *</label>
                  <input 
                    required 
                    value={newProduct.nome} 
                    onChange={e => setNewProduct({...newProduct, nome: e.target.value})}
                    placeholder="Racchetta Head Speed Pro" 
                    className="w-full p-5 border-2 border-gray-200 rounded-3xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-xl font-semibold"
                  />
                </div>
                
                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">💰 Prezzo (€) *</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    value={newProduct.prezzo} 
                    onChange={e => setNewProduct({...newProduct, prezzo: e.target.value})}
                    placeholder="150.00" 
                    className="w-full p-5 border-2 border-gray-200 rounded-3xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-xl font-semibold"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xl font-bold text-gray-800 mb-3">📄 Descrizione</label>
                  <textarea 
                    rows="3" 
                    value={newProduct.descrizione} 
                    onChange={e => setNewProduct({...newProduct, descrizione: e.target.value})}
                    placeholder="Condizioni ottime, usato 2 mesi..." 
                    className="w-full p-5 border-2 border-gray-200 rounded-3xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-xl resize-vertical"
                  />
                </div>
                
                <div className="md:col-span-2 text-center">
                  <button 
                    type="submit"
                    disabled={!newProduct.nome.trim() || !newProduct.prezzo}
                    className="w-full lg:w-auto px-16 py-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-2xl font-black rounded-3xl shadow-3xl hover:shadow-4xl transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-8 h-8 inline mr-3" />
                    🚀 PUBBLICA ARTICOLO
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* BUTTONS ADMIN/SEARCH */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none px-8 py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg"
          >
            <Plus className="w-5 h-5" /> {editingProduct ? 'Modifica Articolo' : 'Gestione Admin'}
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Cerca articoli..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 transition-all text-lg"
            />
          </div>
        </div>

        {/* LISTA PRODOTTI */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-600 mb-4">Nessun prodotto trovato</h3>
            <p className="text-xl text-gray-500">
              {search ? 'Prova con un termine diverso' : 'Pubblica il tuo primo articolo!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all group"
              >
                <div className="w-full h-40 rounded-2xl mb-6 overflow-hidden group-hover:scale-105 transition-transform shadow-lg">
                  {product.immagine_url ? (
                    <img
                      src={product.immagine_url}
                      alt={product.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">
                  {product.nome}
                </h3>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-black text-emerald-600 drop-shadow-lg">
                    €{product.prezzo?.toFixed(2)}
                  </span>
                  <span
                    className={`px-3 py-2 rounded-2xl text-xs font-bold border-2 ${
                      product.venduto
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {product.venduto ? 'VENDUTO' : '🟢 DISPONIBILE'}
                  </span>
                </div>

                {(user?.user_metadata?.role === 'admin' || product.user_id === user?.id) && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(product)}
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit3 className="w-5 h-5" />
                      Modifica
                    </button>
                    <button
                      onClick={() => deleteProduct(product)}
                      disabled={deletingId === product.id}
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {deletingId === product.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Elimina...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-5 h-5" />
                          Elimina
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MODAL ADMIN */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Modifica Articolo' : 'Aggiungi Articolo'}
                </h2>
                <button
                  onClick={cancelEdit}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all shadow-sm"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <form onSubmit={addOrUpdateProduct} className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">
                    Nome*
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.nome}
                    onChange={e =>
                      setNewProduct({ ...newProduct, nome: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Es: Palmera Carbono"
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">
                    Prezzo (€)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.prezzo}
                    onChange={e =>
                      setNewProduct({ ...newProduct, prezzo: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">
                    Descrizione
                  </label>
                  <textarea
                    rows="4"
                    value={newProduct.descrizione}
                    onChange={e =>
                      setNewProduct({
                        ...newProduct,
                        descrizione: e.target.value,
                      })
                    }
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 ring-blue-500 focus:border-blue-500 text-lg resize-vertical"
                    placeholder="Condizioni, taglia, etc..."
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">
                    URL Immagine
                  </label>
                  <input
                    type="url"
                    value={newProduct.immagine_url}
                    onChange={e =>
                      setNewProduct({
                        ...newProduct,
                        immagine_url: e.target.value,
                      })
                    }
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="https://example.com/immagine.jpg"
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-lg text-lg"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all text-lg"
                  >
                    {editingProduct ? 'Aggiorna' : 'Pubblica'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
