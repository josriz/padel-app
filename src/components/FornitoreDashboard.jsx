// src/components/FornitoreDashboard.jsx - STESSO LAYOUT DI DashboardAdmin
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Loader2, X, ArrowLeft, Plus, Trash2, Phone, Mail } from "lucide-react";
import { useAuth } from "../context/AuthProvider";

export default function FornitoreDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ 
    nome: '', 
    descrizione: '', 
    prezzo: '', 
    telefono: '', 
    mail: '', 
    immagine_url: '',
    immagine_preview: ''
  });
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user?.id) fetchItems();
  }, [user]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false });
      
      setItems(data || []);
    } catch (error) {
      console.error('❌ Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setNewItem(prev => ({ ...prev, immagine_preview: preview }));
    setUploading(true);

    try {
      const fileName = `${user.id}-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('marketplace-images')
        .upload(`marketplace/${fileName}`, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(`marketplace/${fileName}`);

      setNewItem(prev => ({ ...prev, immagine_url: publicUrl }));
    } catch (error) {
      alert('❌ Upload fallito');
    } finally {
      setUploading(false);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    
    const prezzoNetto = parseFloat(newItem.prezzo);
    const prezzoCliente = Math.round(prezzoNetto / 0.9 * 100) / 100;

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .insert({
          nome: newItem.nome.trim(),
          descrizione: newItem.descrizione?.trim() || '',
          prezzo: prezzoNetto,
          prezzo_cliente: prezzoCliente,
          telefono: newItem.telefono?.trim() || null,
          mail: newItem.mail?.trim() || null,
          immagine_url: newItem.immagine_url || null,
          user_id: user.id,
          commissione: 10
        });

      if (error) throw error;

      setNewItem({ nome: '', descrizione: '', prezzo: '', telefono: '', mail: '', immagine_url: '', immagine_preview: '' });
      setShowForm(false);
      alert(`✅ Pubblicato!\nTu ricevi: €${prezzoNetto.toFixed(2)}\nCliente paga: €${prezzoCliente.toFixed(2)}`);
      fetchItems();
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Eliminare?')) return;
    try {
      await supabase.from('marketplace_items').delete().eq('id', id);
      setItems(items.filter(item => item.id !== id));
      alert('✅ Eliminato!');
    } catch (error) {
      alert('❌ Errore');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-12 h-12 animate-spin text-slate-600 mx-auto mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER - STESSO DI DASHBOARDADMIN */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 flex items-center gap-2 shadow-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Fornitore</h1>
                <p className="text-slate-600 font-semibold">👤 {user?.email?.split('@')[0]}</p>
                <p className="text-sm text-gray-500">💰 Inserisci PREZZO NETTO → Cliente paga +10%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&round=true" 
                   alt="Raniero" className="w-12 h-12 rounded-full border-2 border-slate-500" />
              <div>
                <p className="font-bold text-gray-900 text-sm">Director Marketplace</p>
                <p className="text-xs text-slate-600">Raniero Pierno</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTONE INSERIMENTO - NORMALE */}
        {!showForm && (
          <div className="text-center">
            <button onClick={() => setShowForm(true)}
              className="bg-slate-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-700 shadow-xl hover:shadow-2xl transition-all"
            >
              ➕ INSERISCI ARTICOLO
            </button>
          </div>
        )}

        {/* FORM - STESSO STILE DASHBOARDADMIN */}
        {showForm && (
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">📦 Nuovo Articolo</h2>
              <button onClick={() => setShowForm(false)} className="p-2 bg-gray-200 rounded-xl hover:bg-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold mb-3 text-gray-700 text-lg">Nome articolo *</label>
                <input 
                  value={newItem.nome} 
                  onChange={(e) => setNewItem({...newItem, nome: e.target.value})} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-slate-500 focus:border-slate-500 text-lg transition-all" 
                  required 
                />
              </div>
              <div>
                <label className="block font-bold mb-3 text-gray-700 text-lg">Prezzo NETTO (€) *</label>
                <p className="text-sm text-slate-600 mb-2">Cliente pagherà +10%</p>
                <input 
                  type="number" step="0.01"
                  value={newItem.prezzo} 
                  onChange={(e) => setNewItem({...newItem, prezzo: e.target.value})} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-slate-500 focus:border-slate-500 text-lg transition-all" 
                  required 
                />
              </div>
              <div>
                <label className="block font-bold mb-3 text-gray-700 text-lg">📱 Telefono</label>
                <input 
                  type="tel" 
                  value={newItem.telefono} 
                  onChange={(e) => setNewItem({...newItem, telefono: e.target.value})} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-slate-500 focus:border-slate-500" 
                />
              </div>
              <div>
                <label className="block font-bold mb-3 text-gray-700 text-lg">✉️ Email</label>
                <input 
                  type="email" 
                  value={newItem.mail} 
                  onChange={(e) => setNewItem({...newItem, mail: e.target.value})} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-slate-500 focus:border-slate-500" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold mb-3 text-gray-700 text-lg">Descrizione</label>
                <textarea 
                  rows="4"
                  value={newItem.descrizione} 
                  onChange={(e) => setNewItem({...newItem, descrizione: e.target.value})} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-slate-500 focus:border-slate-500 resize-vertical" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold mb-3 text-gray-700 text-lg">📸 Foto</label>
                <input 
                  type="file" accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-slate-600 file:text-white hover:file:bg-slate-700" 
                />
                {newItem.immagine_preview && (
                  <img src={newItem.immagine_preview} className="w-full h-48 object-cover rounded-xl mt-4 shadow-lg" />
                )}
              </div>
              <button 
                type="submit" 
                disabled={uploading || !newItem.nome.trim() || !newItem.prezzo}
                className="md:col-span-2 bg-slate-600 text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-slate-700 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 w-full flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  '✅ PUBBLICA ARTICOLO'
                )}
              </button>
            </form>
          </div>
        )}

        {/* LISTA - STESSO STILE DASHBOARDADMIN */}
        <div>
          <h2 className="text-3xl font-bold mb-8">📦 I Tuoi Articoli ({items.length})</h2>
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-xl border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-8">📦</div>
              <h3 className="text-3xl font-bold mb-4">Nessun articolo pubblicato</h3>
              <p className="text-xl text-gray-600 mb-8">Clicca "INSERISCI ARTICOLO" per iniziare!</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-slate-600 text-white px-12 py-4 rounded-xl font-bold text-xl hover:bg-slate-700 shadow-xl hover:shadow-2xl transition-all"
              >
                🚀 PUBBLICA ORA
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-xl p-6 relative group hover:shadow-2xl hover:-translate-y-2 transition-all border border-gray-200 hover:border-slate-400">
                  {item.immagine_url && (
                    <img src={item.immagine_url} alt={item.nome} 
                         className="w-full h-48 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform" />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{item.nome}</h3>
                  {item.descrizione && (
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{item.descrizione}</p>
                  )}
                  <div className="space-y-2 mb-6">
                    {item.telefono && (
                      <p className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                        <Phone className="w-4 h-4" /> {item.telefono}
                      </p>
                    )}
                    {item.mail && (
                      <p className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                        <Mail className="w-4 h-4" /> {item.mail}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-6 mb-6 border-b border-gray-200">
                    <div>
                      <span className="text-2xl font-black text-slate-800 block">
                        €{(item.prezzo_cliente || item.prezzo)?.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">Cliente paga</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-emerald-600">
                        NETTO €{item.prezzo?.toFixed(2)}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                        +10%
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
