import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthProvider';
import { formatPrice, truncateText, isNewItem } from "./marketplaceUtils";
import { ShoppingCart, MessageCircle, Trash2, Plus, Camera } from "lucide-react";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  // ✅ NUOVI STATE PER FORM INSERIMENTO
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ nome: '', descrizione: '', prezzo: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("marketplace_items")
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNZIONE INSERIMENTO ARTICOLO
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.nome.trim() || !newItem.prezzo) {
      alert('❌ Nome e prezzo obbligatori!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          nome: newItem.nome.trim(),
          descrizione: newItem.descrizione.trim(),
          prezzo: parseFloat(newItem.prezzo),
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setItems([data, ...items]);
      setNewItem({ nome: '', descrizione: '', prezzo: '' });
      setShowForm(false);
      alert('✅ Articolo pubblicato!');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare annuncio?')) return;
    
    if (user?.user_metadata?.role !== 'admin') {
      alert('❌ Solo admin può eliminare!');
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setItems(items.filter(item => item.id !== id));
        alert('✅ Eliminato!');
      } else {
        throw error;
      }
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleContact = (item) => {
    if (!user) {
      alert('❌ Devi essere loggato!');
      return;
    }
    alert(`Contatta ${item.profiles?.full_name || 'il venditore'} per ${item.nome}`);
  };

  if (loading) {
    return (
      <div className="pt-20 max-w-5xl mx-auto p-8 flex items-center justify-center h-64">
        <div className="text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 max-w-5xl mx-auto p-8">
      <button
        className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        onClick={() => navigate(-1)}
      >
        ← Indietro
      </button>

      <h2 className="text-3xl font-bold mb-8 text-center">🛒 Marketplace Padel</h2>
      
      {/* ✅ BUTTON INSERIMENTO PER UTENTI STANDARD */}
      {user && (
        <div className="text-center mb-12">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-4 bg-emerald-600 text-white text-xl font-bold rounded-2xl hover:bg-emerald-700 shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 mx-auto"
          >
            <Plus className="w-6 h-6" />
            {showForm ? '❌ Chiudi Form' : '➕ NUOVO ARTICOLO'}
          </button>
        </div>
      )}

      {/* ✅ FORM INSERIMENTO - PER UTENTI STANDARD */}
      {showForm && user && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-8 rounded-3xl mb-12 shadow-2xl border-4 border-emerald-200">
          <h3 className="text-2xl font-bold mb-6 text-center text-emerald-800">📦 Pubblica il tuo articolo</h3>
          
          <form onSubmit={handleAddItem} className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-3 text-lg">Nome articolo *</label>
              <input
                required
                value={newItem.nome}
                onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
                placeholder="Es: Racchetta Head Speed Pro"
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-lg"
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-3 text-lg">Prezzo (€) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={newItem.prezzo}
                onChange={(e) => setNewItem({ ...newItem, prezzo: e.target.value })}
                placeholder="150.00"
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-lg"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block font-semibold mb-3 text-lg">Descrizione</label>
              <textarea
                value={newItem.descrizione}
                onChange={(e) => setNewItem({ ...newItem, descrizione: e.target.value })}
                placeholder="Condizioni, dettagli, caratteristiche..."
                rows="3"
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-lg resize-vertical"
              />
            </div>
            
            <div className="md:col-span-2 text-center">
              <button
                type="submit"
                className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xl font-bold rounded-3xl hover:from-emerald-700 hover:to-emerald-800 shadow-2xl hover:shadow-3xl transition-all"
              >
                🚀 PUBBLICA ARTICOLO
              </button>
            </div>
          </form>
          
          <p className="text-center mt-4 text-sm text-gray-600">
            👤 I venditori ti contatteranno via email: {user.email}
          </p>
        </div>
      )}

      {/* ✅ ADMIN BUTTON (mantiene originale) */}
      {user?.user_metadata?.role === 'admin' && (
        <div className="text-center mb-8">
          <button className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-2xl hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all">
            🔧 Pannello Admin
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="p-6 border rounded-2xl shadow-lg hover:shadow-2xl transition-all group relative bg-white/80 backdrop-blur-sm">
            {/* ADMIN DELETE */}
            {user?.user_metadata?.role === 'admin' && (
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 shadow-lg"
                title="Elimina"
              >
                {deletingId === item.id ? '⏳' : <Trash2 className="w-4 h-4" />}
              </button>
            )}
            
            {isNewItem(item.created_at) && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                ✨ NUOVO
              </span>
            )}
            
            <h3 className="text-2xl font-bold mb-4 mt-12 leading-tight">{item.nome || item.name}</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">{truncateText(item.descrizione || item.description, 80)}</p>
            <p className="text-3xl font-black text-emerald-600 mb-6 drop-shadow-lg">€{formatPrice(item.prezzo || item.price)}</p>
            
            {item.profiles?.full_name && (
              <p className="text-sm text-gray-500 mb-6 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {item.profiles.full_name.charAt(0).toUpperCase()}
                </div>
                {item.profiles.full_name}
              </p>
            )}
            
            {/* RUOLI BOTTONI */}
            {user?.user_metadata?.role === 'admin' ? (
              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl transition-all">
                🔧 Gestisci
              </button>
            ) : user && item.user_id === user.id ? (
              <div className="space-y-2">
                <span className="block text-xs text-emerald-600 font-bold bg-emerald-100 px-3 py-1 rounded-full text-center">
                  ✅ Il tuo articolo
                </span>
                <button className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-xl hover:shadow-2xl transition-all">
                  👁️ Visualizza
                </button>
              </div>
            ) : user ? (
              <button 
                onClick={() => handleContact(item)}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-2xl font-bold hover:from-orange-700 hover:to-orange-800 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contatta venditore
              </button>
            ) : (
              <button className="w-full py-3 bg-gray-500 text-white rounded-2xl font-bold hover:bg-gray-600 transition-all">
                🔐 Login per contattare
              </button>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-24 text-gray-500 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl mt-12">
          <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h3 className="text-3xl font-bold mb-4">Nessun articolo disponibile</h3>
          {user && (
            <p className="text-xl mb-8">Clicca "➕ NUOVO ARTICOLO" per iniziare!</p>
          )}
        </div>
      )}
    </div>
  );
}
