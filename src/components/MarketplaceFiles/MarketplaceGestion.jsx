import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { formatPrice, truncateText, isNewItem } from "./marketplaceUtils";
import { Trash2, UserCheck, Plus, Camera } from "lucide-react";

export default function MarketplaceGestion() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  // ? FORM UTENTE STANDARD
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ nome: '', descrizione: '', prezzo: '' });
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    fetchItems();
  }, []);

  // ? INSERIMENTO ARTICOLO UTENTE STANDARD
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.nome.trim() || !newItem.prezzo) {
      alert('? Nome e prezzo obbligatori!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          nome: newItem.nome.trim(),
          descrizione: newItem.descrizione.trim() || '',
          prezzo: parseFloat(newItem.prezzo),
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setItems([data, ...items]);
      setNewItem({ nome: '', descrizione: '', prezzo: '' });
      setShowForm(false);
      alert('? Articolo pubblicato!');
    } catch (error) {
      alert('? Errore: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare annuncio?')) return;
    
    if (user?.user_metadata?.role !== 'admin') {
      alert('? Solo admin può eliminare!');
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("marketplace_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
      alert('? Eliminato!');
    } catch (error) {
      alert('? Errore: ' + error.message);
      fetchItems();
    } finally {
      setDeletingId(null);
    }
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
        ? Indietro
      </button>

      <h2 className="text-3xl font-bold mb-8 text-center">?? Gestione Marketplace</h2>
      
      {/* ? BUTTON INSERIMENTO PER UTENTI STANDARD */}
      {user && (
        <div className="text-center mb-8">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xl font-bold rounded-3xl hover:from-emerald-700 hover:to-emerald-800 shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 mx-auto"
          >
            <Plus className="w-6 h-6" />
            {showForm ? '? Chiudi Form' : '? PUBBLICA ARTICOLO'}
          </button>
        </div>
      )}

      {/* ? FORM INSERIMENTO UTENTE STANDARD */}
      {showForm && user && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-8 rounded-3xl mb-12 shadow-2xl border-4 border-emerald-200">
          <h3 className="text-2xl font-bold mb-8 text-center text-emerald-800 flex items-center gap-3 justify-center">
            <Plus className="w-8 h-8" />
            Nuovo Articolo
          </h3>
          
          <form onSubmit={handleAddItem} className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <label className="block font-bold text-xl mb-4">?? Nome articolo *</label>
              <input
                required
                value={newItem.nome}
                onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
                placeholder="Es: Racchetta Head Speed Pro 2024"
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-xl font-semibold"
              />
            </div>
            
            <div>
              <label className="block font-bold text-xl mb-4">?? Prezzo (€) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={newItem.prezzo}
                onChange={(e) => setNewItem({ ...newItem, prezzo: e.target.value })}
                placeholder="150.00"
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-xl font-semibold"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block font-bold text-xl mb-4">?? Descrizione</label>
              <textarea
                value={newItem.descrizione}
                onChange={(e) => setNewItem({ ...newItem, descrizione: e.target.value })}
                placeholder="Condizioni ottime, telaio perfetto, corde nuove..."
                rows="4"
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-xl resize-vertical"
              />
            </div>
            
            <div className="md:col-span-2 text-center">
              <button
                type="submit"
                disabled={!newItem.nome || !newItem.prezzo}
                className="px-16 py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-2xl font-black rounded-3xl hover:from-emerald-700 hover:to-emerald-800 shadow-3xl hover:shadow-4xl transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                ?? PUBBLICA ARTICOLO
              </button>
            </div>
          </form>
          
          <p className="text-center mt-6 text-lg text-gray-700 font-semibold">
            ?? Venditori ti contatteranno: <span className="font-mono bg-gray-100 px-3 py-1 rounded-xl">{user.email}</span>
          </p>
        </div>
      )}

      {/* ? STATS */}
      <div className="bg-white p-6 rounded-3xl border shadow-xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-black text-emerald-600">{items.length}</p>
            <p className="text-lg text-gray-600 font-semibold">Totale annunci</p>
          </div>
          <div>
            <p className="text-3xl font-black text-blue-600">{items.filter(i => isNewItem(i.created_at)).length}</p>
            <p className="text-lg text-gray-600 font-semibold">Nuovi (3gg)</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{user?.email}</p>
            <p className="text-sm text-gray-500">{user?.user_metadata?.role || 'utente'}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="p-6 border rounded-3xl shadow-xl hover:shadow-2xl transition-all group relative bg-white/90 backdrop-blur-sm">
            {/* ADMIN DELETE */}
            {user?.user_metadata?.role === 'admin' && (
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="absolute top-4 right-4 p-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                title="Elimina"
              >
                {deletingId === item.id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            )}
            
            {isNewItem(item.created_at) && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm px-3 py-2 rounded-full font-bold shadow-lg">
                ? NUOVO
              </span>
            )}
            
            <div className="mb-6">
              {item.immagine_url ? (
                <img src={item.immagine_url} alt={item.nome} className="w-full h-48 object-cover rounded-2xl mb-4 shadow-lg" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-bold mb-3 leading-tight">{item.nome || item.name}</h3>
            <p className="text-gray-600 mb-4 text-lg leading-relaxed">{truncateText(item.descrizione || item.description, 100)}</p>
            <p className="text-3xl font-black text-emerald-600 mb-6 drop-shadow-lg">€{formatPrice(item.prezzo || item.price)}</p>
            
            {item.profiles?.full_name && (
              <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {item.profiles.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg">{item.profiles.full_name}</p>
                  <p className="text-sm text-gray-500">{item.created_at ? new Date(item.created_at).toLocaleDateString('it-IT') : 'N/D'}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-24 text-gray-500 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl mt-12 p-12">
          <Camera className="w-24 h-24 mx-auto mb-8 text-gray-400" />
          <h3 className="text-4xl font-bold mb-4 text-gray-600">Nessun annuncio disponibile</h3>
          {user && (
            <p className="text-2xl mb-8 font-semibold">Clicca "? PUBBLICA ARTICOLO" per iniziare!</p>
          )}
        </div>
      )}
    </div>
  );
}
