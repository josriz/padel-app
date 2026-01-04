// src/components/MarketplaceExternalDashboard.jsx - COMPLETO PER FORNITORI
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Loader2, X, ArrowLeft, Plus, Trash2, Phone, Mail } from "lucide-react";
import { useAuth } from "../context/AuthProvider";

export default function MarketplaceExternalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
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
    const loadData = async () => {
      if (!user?.id) return;

      // Verifica ruolo fornitore
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setRole(profile?.role);

      if (profile?.role === "supplier") {
        // ✅ CORRETTO: usa seller_id per fornitori
        const { data: products } = await supabase
          .from("marketplace_items")
          .select("*")
          .eq("seller_id", user.id)
          .order('created_at', { ascending: false });

        setItems(products || []);
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  // 🔒 REDIRECT SE NON LOGGATO
  if (!user) return <Navigate to="/" replace />;

  // 🚨 BLOCCO SOLO PER NON-FORNITORI
  if (!loading && role !== "supplier") {
    return <Navigate to="/dashboard" replace />;
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        <span className="ml-3 text-xl">Caricamento dashboard fornitore...</span>
      </div>
    );
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Anteprima
    const preview = URL.createObjectURL(file);
    setNewItem(prev => ({ ...prev, immagine_preview: preview }));
    setUploading(true);

    try {
      const fileName = `${user.id}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('marketplace-images')
        .upload(`marketplace/${fileName}`, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(`marketplace/${fileName}`);

      setNewItem(prev => ({ ...prev, immagine_url: publicUrl }));
      alert('✅ Immagine caricata!');
    } catch (error) {
      alert('❌ Errore upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.nome.trim() || !newItem.prezzo) {
      alert('❌ Nome e prezzo obbligatori!');
      return;
    }

    try {
      const prezzoNum = parseFloat(newItem.prezzo);
      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          nome: newItem.nome.trim(),
          descrizione: newItem.descrizione?.trim() || '',
          prezzo: prezzoNum,
          telefono: newItem.telefono.trim() || null,
          mail: newItem.mail.trim() || null,
          immagine_url: newItem.immagine_url || null,
          seller_id: user.id,  // ✅ CORRETTO PER FORNITORI
          status: 'active'     // Default status
        })
        .select()
        .single();

      if (error) throw error;

      setItems([data, ...items]);
      setNewItem({ nome: '', descrizione: '', prezzo: '', telefono: '', mail: '', immagine_url: '', immagine_preview: '' });
      setShowForm(false);
      alert('✅ Articolo pubblicato!');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Eliminare articolo?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
      alert('✅ Articolo eliminato!');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER FORNITORE */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Torna Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Dashboard Fornitore</h1>
                <p className="text-emerald-600 font-semibold text-lg">👤 {user.email.split('@')[0]}</p>
              </div>
            </div>
            
            {/* Director Marketplace */}
            <div className="flex items-center gap-3 self-start lg:self-center">
              <img 
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop&round=true" 
                alt="Raniero Pierno" 
                className="w-14 h-14 rounded-full border-4 border-emerald-500 shadow-lg"
              />
              <div>
                <p className="text-sm font-bold text-gray-900">Director Marketplace</p>
                <p className="text-xs text-emerald-600">Raniero Pierno</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTONE INSERIMENTO */}
        {!showForm && (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
            >
              <Plus className="w-6 h-6" />
              INSERISCI ARTICOLO
            </button>
          </div>
        )}

        {/* FORM INSERIMENTO COMPLETO */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative border-2 border-emerald-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">📦 Nuovo Articolo</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-3 bg-gray-200 hover:bg-gray-300 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={addItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">Nome articolo *</label>
                <input
                  type="text"
                  value={newItem.nome}
                  onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">Prezzo (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.prezzo}
                  onChange={(e) => setNewItem({ ...newItem, prezzo: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">📱 Telefono</label>
                <input
                  type="tel"
                  value={newItem.telefono}
                  onChange={(e) => setNewItem({ ...newItem, telefono: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">✉️ Email contatto</label>
                <input
                  type="email"
                  value={newItem.mail}
                  onChange={(e) => setNewItem({ ...newItem, mail: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-lg font-semibold mb-3 text-gray-700">Descrizione</label>
                <textarea
                  rows="4"
                  value={newItem.descrizione}
                  onChange={(e) => setNewItem({ ...newItem, descrizione: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500 resize-vertical text-lg"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-lg font-semibold mb-3 text-gray-700">📸 Foto articolo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-4 border-2 border-dashed border-emerald-300 rounded-xl file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-emerald-500 file:text-lg file:font-semibold file:text-white"
                  disabled={uploading}
                />
                {newItem.immagine_preview && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                    <img src={newItem.immagine_preview} alt="Anteprima" className="w-full h-48 object-cover rounded-xl" />
                    <p className="text-sm text-emerald-600 mt-2 font-medium">✅ Anteprima pronta</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  disabled={uploading || !newItem.nome || !newItem.prezzo}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-5 px-8 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {uploading ? '⏳ Caricamento...' : '✅ PUBBLICA ARTICOLO'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTA ARTICOLI FORNITORE */}
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-8 flex items-center gap-4">
            📦 I Tuoi Articoli
            <span className="bg-emerald-100 text-emerald-800 px-6 py-2 rounded-2xl text-xl font-bold">
              {items.length}
            </span>
          </h2>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-xl border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-6">📦</div>
              <h3 className="text-3xl font-bold text-gray-700 mb-4">Nessun articolo</h3>
              <p className="text-xl text-gray-500">Pubblica il tuo primo articolo!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all group border border-gray-100 hover:border-emerald-300 overflow-hidden">
                  {item.immagine_url && (
                    <img 
                      src={item.immagine_url} 
                      alt={item.nome}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.nome}</h3>
                    {item.descrizione && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{item.descrizione}</p>
                    )}
                    
                    <div className="space-y-2 mb-6">
                      {item.telefono && (
                        <p className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="w-4 h-4 text-emerald-500" />
                          {item.telefono}
                        </p>
                      )}
                      {item.mail && (
                        <p className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="w-4 h-4 text-blue-500" />
                          {item.mail}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-emerald-600">
                        €{item.prezzo?.toFixed(2)}
                      </span>
                      <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-bold">
                        {item.status || 'active'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteItem(item.id)}
                    disabled={deletingId === item.id}
                    className="absolute top-4 right-4 p-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
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
