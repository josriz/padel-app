import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthProvider';
import { formatPrice, truncateText, isNewItem } from "./marketplaceUtils";
import { ShoppingCart, MessageCircle, Trash2, Plus, Loader2, ArrowLeft } from "lucide-react";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ nome: '', descrizione: '', prezzo: '' });
  const [uploading, setUploading] = useState(false);

  // ✅ RISOLTO 400 ERROR - NO JOIN profiles!
  const fetchItems = async () => {
    try {
      setLoading(true);
      console.log('🔄 Caricamento articoli...');
      
      // SEMPLICE select('*') - NESSUN JOIN!
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ FETCH ERROR:', error);
        throw error;
      }
      
      console.log('✅ ARTICOLI:', data?.length || 0);
      setItems(data || []);
    } catch (error) {
      console.error('💥 FETCH:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.nome.trim() || !newItem.prezzo) {
      alert('❌ Nome e prezzo obbligatori!');
      return;
    }

    try {
      setUploading(true);
      console.log('👤 USER:', user?.id);
      
      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          nome: newItem.nome.trim(),
          descrizione: newItem.descrizione.trim() || null,
          prezzo: parseFloat(newItem.prezzo),
          user_id: user?.id
        })
        .select()
        .single();

      console.log('✅ INSERT:', data);
      
      if (error) throw error;
      
      // Refresh lista
      await fetchItems();
      setNewItem({ nome: '', descrizione: '', prezzo: '' });
      setShowForm(false);
      alert('✅ Pubblicato!');
    } catch (error) {
      console.error('❌ INSERT:', error);
      alert('❌ ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare?')) return;
    if (user?.user_metadata?.role !== 'admin') {
      alert('❌ Solo admin!');
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchItems();
      alert('✅ Eliminato!');
    } catch (error) {
      alert('❌ ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleContact = (item) => {
    if (!user) {
      alert('❌ Login richiesto!');
      return;
    }
    alert(`Contatta per "${item.nome}" - €${formatPrice(item.prezzo)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 pt-20 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 px-6 py-3 bg-white shadow-lg rounded-2xl hover:shadow-xl transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Indietro
        </button>

        <h1 className="text-5xl font-black text-center mb-12 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          🛒 Marketplace Padel
        </h1>

        {user && (
          <div className="text-center mb-12">
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-12 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xl font-bold rounded-3xl hover:from-emerald-700 shadow-2xl hover:shadow-3xl transition-all"
            >
              <Plus className="w-6 h-6 inline mr-2" />
              {showForm ? '❌ Chiudi' : '➕ Nuovo Articolo'}
            </button>
          </div>
        )}

        {showForm && user && (
          <div className="bg-white rounded-3xl p-8 mb-12 shadow-2xl max-w-4xl mx-auto">
            <form onSubmit={handleAddItem} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-lg mb-3">Nome *</label>
                <input
                  required
                  value={newItem.nome}
                  onChange={(e) => setNewItem({...newItem, nome: e.target.value})}
                  className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-lg mb-3">Prezzo (€) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={newItem.prezzo}
                  onChange={(e) => setNewItem({...newItem, prezzo: e.target.value})}
                  className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold text-lg mb-3">Descrizione</label>
                <textarea
                  value={newItem.descrizione}
                  onChange={(e) => setNewItem({...newItem, descrizione: e.target.value})}
                  rows="3"
                  className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="md:col-span-2 bg-emerald-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {uploading ? '⏳ Caricando...' : '🚀 PUBBLICA'}
              </button>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all group">
              {user?.user_metadata?.role === 'admin' && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              {isNewItem(item.created_at) && (
                <span className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  ✨ NUOVO
                </span>
              )}
              
              <h3 className="text-xl font-bold mb-3 mt-12">{item.nome}</h3>
              <p className="text-gray-600 mb-4">{truncateText(item.descrizione, 80)}</p>
              <p className="text-3xl font-black text-emerald-600 mb-6">€{formatPrice(item.prezzo)}</p>
              
              <div className="mb-6 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700">Venditore: {item.user_id?.slice(0,8)}...</p>
              </div>
              
              {user?.user_metadata?.role === 'admin' ? (
                <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">🔧 Admin</button>
              ) : user && item.user_id === user.id ? (
                <div className="space-y-2">
                  <span className="block text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-center font-bold">✅ Tuo</span>
                  <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">👁️ Modifica</button>
                </div>
              ) : user ? (
                <button onClick={() => handleContact(item)} className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Contatta
                </button>
              ) : (
                <button className="w-full py-3 bg-gray-500 text-white rounded-xl font-bold">🔐 Login</button>
              )}
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-32">
            <ShoppingCart className="w-32 h-32 mx-auto mb-8 text-gray-300" />
            <h3 className="text-3xl font-bold text-gray-500 mb-4">Nessun articolo</h3>
            {user && <p className="text-xl text-gray-400">Pubblica il primo! 👆</p>}
          </div>
        )}
      </div>
    </div>
  );
}