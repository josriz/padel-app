import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthProvider';
import { ShoppingCart, MessageCircle, Trash2, Plus, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ nome: '', descrizione: '', prezzo: '', venduto: false });
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('❌', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.nome.trim() || !newItem.prezzo) return alert('❌ Nome e prezzo obbligatori!');

    try {
      setUploading(true);
      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          nome: newItem.nome.trim(),
          descrizione: newItem.descrizione.trim() || null,
          prezzo: parseFloat(newItem.prezzo),
          user_id: user?.id,
          venduto: false
        })
        .select()
        .single();

      if (error) throw error;
      await fetchItems();
      setNewItem({ nome: '', descrizione: '', prezzo: '', venduto: false });
      setShowForm(false);
      alert('✅ Pubblicato!');
    } catch (error) {
      alert('❌ ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVenduto = async (id) => {
    if (!confirm('Segnare come venduto?')) return;
    try {
      const item = items.find(i => i.id === id);
      const { error } = await supabase
        .from('marketplace_items')
        .update({ venduto: !item.venduto })
        .eq('id', id);
      
      if (error) throw error;
      await fetchItems();
      alert('✅ Aggiornato!');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare?')) return;
    if (user?.user_metadata?.role !== 'admin') return alert('❌ Solo admin!');
    
    try {
      setDeletingId(id);
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
      alert(`📞 Contatta venditore per "${item.nome}"\n💰 Prezzo: €${item.prezzo}\n✉️ Email: ${item.user_id?.slice(0,8)}...`);
      return;
    }
    if (item.venduto) {
      alert('❌ Articolo già venduto!');
      return;
    }
    alert(`📱 Contatta venditore per "${item.nome}"\n💰 Prezzo: €${item.prezzo}\n👤 ID Venditore: ${item.user_id?.slice(0,8)}...\n✉️ Via email: ${user.email}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden" 
           style={{ backgroundImage: "url('/images/icon-marketplace.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 z-0"></div>
        <div className="relative z-10 flex flex-col items-center text-white">
          <Loader2 className="w-16 h-16 animate-spin mb-4 drop-shadow-2xl" />
          <span className="text-2xl font-bold drop-shadow-lg">Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative overflow-hidden px-4 py-8" 
         style={{ backgroundImage: "url('/images/icon-marketplace.jpg')" }}>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 z-0"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto pt-20">
        
        {/* Header */}
        <div className="text-center mb-12 text-white drop-shadow-2xl">
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 px-8 py-4 bg-white/90 backdrop-blur-md text-gray-900 rounded-3xl font-bold shadow-2xl hover:shadow-3xl transition-all inline-flex items-center gap-3 hover:-translate-y-1"
          >
            <ArrowLeft className="w-6 h-6" />
            Indietro
          </button>
          
          <h1 className="text-6xl font-black bg-gradient-to-r from-emerald-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-4xl mb-4 tracking-tight">
            🛒 Marketplace Padel
          </h1>
          <p className="text-2xl font-semibold drop-shadow-xl">Compra e vendi attrezzatura usata</p>
        </div>

        {/* Form Nuovo Articolo */}
        {user && (
          <div className="text-center mb-16">
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-12 py-6 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white text-2xl font-black rounded-3xl shadow-3xl hover:shadow-4xl transition-all hover:-translate-y-2 backdrop-blur-md border border-white/30 drop-shadow-2xl"
            >
              <Plus className="w-8 h-8 inline mr-3" />
              {showForm ? '❌ Chiudi Form' : '➕ PUBBLICA ARTICOLO'}
            </button>
          </div>
        )}

        {showForm && user && (
          <div className="bg-white/95 backdrop-blur-xl p-10 rounded-4xl mb-16 shadow-4xl border border-white/50 max-w-5xl mx-auto drop-shadow-2xl">
            <h3 className="text-4xl font-black mb-10 text-center text-gray-900 drop-shadow-2xl">📦 Nuovo Annuncio</h3>
            
            <form onSubmit={handleAddItem} className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-2xl font-bold mb-6 text-gray-900 drop-shadow-lg">Nome Articolo *</label>
                <input 
                  value={newItem.nome} 
                  onChange={(e) => setNewItem({...newItem, nome: e.target.value})}
                  className="w-full p-8 text-2xl border-4 border-gray-200/50 rounded-3xl focus:ring-8 ring-emerald-400/50 focus:border-emerald-500/70 shadow-2xl backdrop-blur-md" 
                  placeholder="Racchetta Head Speed Pro 2024"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-2xl font-bold mb-6 text-gray-900 drop-shadow-lg">Prezzo (€) *</label>
                <input 
                  type="number" step="0.01" min="0.01"
                  value={newItem.prezzo} 
                  onChange={(e) => setNewItem({...newItem, prezzo: e.target.value})}
                  className="w-full p-8 text-2xl border-4 border-gray-200/50 rounded-3xl focus:ring-8 ring-emerald-400/50 focus:border-emerald-500/70 shadow-2xl backdrop-blur-md" 
                  placeholder="250.00"
                  required 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-2xl font-bold mb-6 text-gray-900 drop-shadow-lg">Descrizione</label>
                <textarea 
                  value={newItem.descrizione} 
                  onChange={(e) => setNewItem({...newItem, descrizione: e.target.value})}
                  rows="5"
                  className="w-full p-8 text-xl border-4 border-gray-200/50 rounded-3xl focus:ring-8 ring-emerald-400/50 focus:border-emerald-500/70 shadow-2xl backdrop-blur-md resize-vertical"
                  placeholder="Condizioni perfette, corde nuove, usato solo 2 tornei..."
                />
              </div>
              
              <div className="md:col-span-2 text-center">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="px-20 py-8 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white text-3xl font-black rounded-4xl shadow-4xl hover:shadow-5xl hover:-translate-y-3 transition-all backdrop-blur-xl border-4 border-emerald-500/50 drop-shadow-4xl disabled:opacity-50 w-full md:w-auto"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-10 h-10 animate-spin inline mr-4" />
                      Pubblicando...
                    </>
                  ) : (
                    '🚀 PUBBLICA ORA'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grid Articoli */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item) => (
            <div key={item.id} className="group bg-white/95 backdrop-blur-xl rounded-4xl p-10 shadow-4xl hover:shadow-5xl hover:-translate-y-4 transition-all duration-700 border-4 border-white/60 overflow-hidden relative drop-shadow-4xl">
              
              {/* Badge Venduto */}
              {item.venduto && (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-2xl font-black px-8 py-4 rounded-3xl shadow-4xl drop-shadow-2xl z-20">
                  <CheckCircle className="w-10 h-10 inline mr-3 -ml-2" />
                  VENDUTO
                </div>
              )}
              
              {/* Admin Delete */}
              {user?.user_metadata?.role === 'admin' && (
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="absolute top-8 right-8 p-4 bg-red-500/95 hover:bg-red-600 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-all shadow-2xl hover:shadow-3xl backdrop-blur-md drop-shadow-2xl z-20"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Trash2 className="w-6 h-6" />
                  )}
                </button>
              )}
              
              {/* Badge Nuovo */}
              {!item.venduto && (
                <span className="absolute top-8 left-8 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl font-bold px-6 py-3 rounded-3xl shadow-2xl drop-shadow-xl z-10">
                  ✨ DISPONIBILE
                </span>
              )}
              
              {/* Immagine Placeholder */}
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden shadow-2xl">
                <ShoppingCart className="w-32 h-32 text-gray-400 drop-shadow-xl" />
              </div>
              
              <h3 className="text-3xl font-black text-gray-900 mb-6 leading-tight drop-shadow-2xl group-hover:text-emerald-600 transition-colors">
                {item.nome}
              </h3>
              
              <p className="text-xl text-gray-700 mb-8 leading-relaxed drop-shadow-lg h-24 overflow-hidden">
                {item.descrizione || 'Nessuna descrizione fornita'}
              </p>
              
              <div className="mb-10">
                <span className="text-5xl font-black text-emerald-600 drop-shadow-4xl">
                  €{item.prezzo?.toFixed(2)}
                </span>
              </div>
              
              {/* Info Venditore */}
              <div className="mb-10 p-6 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 rounded-3xl backdrop-blur-md shadow-2xl border border-white/50 drop-shadow-xl">
                <p className="text-xl font-bold text-gray-800 mb-2 drop-shadow-md">
                  👤 Venditore ID: {item.user_id?.slice(0,8)}...
                </p>
                <p className="text-lg text-gray-600 drop-shadow-sm">
                  📅 {item.created_at ? new Date(item.created_at).toLocaleDateString('it-IT') : 'Oggi'}
                </p>
              </div>
              
              {/* Bottoni */}
              <div className="space-y-4">
                {user?.user_metadata?.role === 'admin' ? (
                  <button className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-black rounded-3xl hover:from-blue-700 hover:to-blue-800 shadow-3xl hover:shadow-4xl transition-all backdrop-blur-md drop-shadow-2xl">
                    🔧 PANELLO ADMIN
                  </button>
                ) : user && item.user_id === user.id ? (
                  <div className="space-y-4">
                    <span className="block w-full text-center px-8 py-4 bg-emerald-100/90 text-emerald-800 font-black text-xl rounded-3xl backdrop-blur-md shadow-2xl drop-shadow-lg">
                      ✅ IL TUO ANNUNCIO
                    </span>
                    <button 
                      onClick={() => handleToggleVenduto(item.id)}
                      className="w-full py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xl font-black rounded-3xl hover:from-emerald-700 hover:to-emerald-800 shadow-3xl hover:shadow-4xl transition-all backdrop-blur-md drop-shadow-2xl flex items-center justify-center gap-4"
                    >
                      {item.venduto ? (
                        <>
                          <CheckCircle className="w-8 h-8" />
                          Rimuovi Venduto
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-8 h-8" />
                          Segna Venduto
                        </>
                      )}
                    </button>
                  </div>
                ) : item.venduto ? (
                  <button 
                    disabled
                    className="w-full py-6 bg-gray-400/80 text-white text-xl font-black rounded-3xl cursor-not-allowed backdrop-blur-md shadow-2xl opacity-70"
                  >
                    ❌ GIÀ VENDUTO
                  </button>
                ) : user ? (
                  <button 
                    onClick={() => handleContact(item)}
                    className="w-full py-6 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xl font-black rounded-3xl hover:from-orange-700 hover:to-orange-800 shadow-3xl hover:shadow-4xl transition-all backdrop-blur-md drop-shadow-2xl flex items-center justify-center gap-4 hover:-translate-y-1"
                  >
                    <MessageCircle className="w-10 h-10" />
                    📱 CONTATTA VENDITORE
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-6 bg-gray-500/90 hover:bg-gray-600 text-white text-xl font-black rounded-3xl shadow-3xl hover:shadow-4xl transition-all backdrop-blur-md drop-shadow-2xl"
                  >
                    🔐 LOGIN PER CONTATTARE
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-48 text-white drop-shadow-4xl">
            <ShoppingCart className="w-48 h-48 mx-auto mb-12 text-white/30 drop-shadow-4xl" />
            <h3 className="text-6xl font-black mb-8 drop-shadow-4xl">Nessun articolo disponibile</h3>
            {user ? (
              <p className="text-4xl drop-shadow-2xl mb-12">Sii il primo! 🚀 Pubblica il tuo annuncio</p>
            ) : (
              <p className="text-4xl drop-shadow-2xl">Effettua login per vedere e pubblicare annunci</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
