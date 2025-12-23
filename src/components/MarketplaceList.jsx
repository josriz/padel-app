console.log("### MARKETPLACE LIST CARICATO ###");
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ShoppingCart, Trash2, Plus, MessageCircle, Mail, Phone, CheckCircle, Image as ImageIcon, Upload, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function MarketplaceList() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // ✅ FORM UTENTE STANDARD
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ nome: '', descrizione: '', prezzo: '' });
  const [telefono, setTelefono] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ CACHE PER MANTENERE ARTICOLI
  const [cache, setCache] = useState(new Map());
  const [lastFetch, setLastFetch] = useState(0);
  const [showSold, setShowSold] = useState(false);

  const isAdmin = role === "admin";

  const demoImages = [
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    "https://images.unsplash.com/photo-1599058917213-423a9b9b437b",
    "https://images.unsplash.com/photo-1606813908898-7e5db4ef3de2"
  ];

  // ✅ USEFFECT OTTIMIZZATO - non si riavvia sempre
  useEffect(() => {
    const now = Date.now();
    const shouldRefresh = now - lastFetch > 30000 || items.length === 0;
    
    if (shouldRefresh) {
      fetchItems();
    }
  }, [showSold, items.length === 0]);

  // ✅ FETCH OTTIMIZZATO CON JOIN CORRETTO
  const fetchItems = async () => {
    setLoading(true);
    console.log('🔍 DEBUG: Inizio fetch...');
    
    try {
      // ✅ SIMPLE QUERY (SICURA)
      const { data: simpleData, error: simpleError } = await supabase
        .from("marketplace_items")
        .select("*")
        .limit(10)
        .order("created_at", { ascending: false });

      console.log('🔍 SIMPLE QUERY:', simpleData, simpleError);
      
      if (simpleError) {
        console.error('❌ SIMPLE ERROR:', simpleError);
        alert('❌ Errore tabella: ' + simpleError.message);
        setLoading(false);
        return;
      }

      if (!simpleData || simpleData.length === 0) {
        console.log('📭 TABELL VUOTA');
        setLoading(false);
        return;
      }

      // ✅ JOIN CORRETTO - profiles!user_id_fkey
      const { data: joinData, error: joinError } = await supabase
        .from("marketplace_items")
        .select(`
          *,
          profiles!user_id_fkey(full_name, display_name, email, phone)
        `)
        .order("created_at", { ascending: false });

      console.log('🔍 JOIN QUERY:', joinData, joinError);

      let finalData = joinData || simpleData;
      
      // ✅ MAP CON IMMAGINI E FALLBACK PROFILES
      const itemsWithImages = (finalData || []).map((item, index) => ({
        ...item,
        immagine_url: item.immagine_url || demoImages[index % demoImages.length],
        profiles: item.profiles || { 
          full_name: 'Utente', 
          display_name: 'Utente',
          email: 'email@esempio.it'
        }
      }));
      
      setItems(itemsWithImages);
      setLastFetch(Date.now());
      console.log('✅ ITEMS CARICATI:', itemsWithImages.length);
      
    } catch (error) {
      console.error('💥 ERRORE TOTALE:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPLOAD IMMAGINE
  const handleImageUpload = async (file) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id || 'anonimo'}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('marketplace-images')
        .upload(fileName, file, { upsert: true });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('❌ UPLOAD ERROR:', error);
      alert('❌ Upload fallito: ' + error.message);
      return null;
    }
  };

  // ✅ DELETE SICURO
  const handleDelete = async (id) => {
    if (!window.confirm("Eliminare definitivamente?")) return;
    setDeletingId(id);
    
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: item } = await supabase
        .from("marketplace_items")
        .select('user_id')
        .eq("id", id)
        .single();

      if (!currentUser) {
        alert('❌ Devi essere loggato');
        return;
      }

      if (isAdmin || currentUser.id === item?.user_id) {
        const { error } = await supabase
          .from("marketplace_items")
          .delete()
          .eq("id", id);
        
        if (!error) {
          setItems((prev) => prev.filter((i) => i.id !== id));
          if (selectedItem?.id === id) setSelectedItem(null);
          alert('✅ Eliminato!');
        } else {
          alert('❌ Errore delete: ' + error.message);
        }
      } else {
        alert('❌ Non hai i permessi');
      }
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ MARK VENDUTO
  const handleMarkSold = async (id) => {
    if (!window.confirm("Segnare come VENDUTO?")) return;
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: item } = await supabase
        .from("marketplace_items")
        .select('user_id')
        .eq("id", id)
        .single();

      if (isAdmin || currentUser.id === item?.user_id) {
        const { error } = await supabase
          .from("marketplace_items")
          .update({ venduto: true })
          .eq("id", id);
        
        if (!error) {
          setItems(prev => prev.map(item => 
            item.id === id ? { ...item, venduto: true } : item
          ));
          alert('✅ Marcato come venduto!');
        }
      } else {
        alert('❌ Non hai i permessi');
      }
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  // ✅ ADD ARTICOLO
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.nome.trim() || !newItem.prezzo || !user) {
      alert('❌ Nome, prezzo e login obbligatori!');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
        if (!imageUrl) return;
      }

      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          nome: newItem.nome.trim(),
          descrizione: newItem.descrizione.trim() || '',
          prezzo: parseFloat(newItem.prezzo),
          user_id: user.id,
          telefono: telefono || null,
          venduto: false,
          immagine_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;
      
      // ✅ AGGIUNGI IN TESTA
      const newItemWithProfile = {
        ...data,
        profiles: { 
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utente', 
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utente',
          email: user.email 
        },
        immagine_url: data.immagine_url || demoImages[0]
      };
      
      setItems(prev => [newItemWithProfile, ...prev]);
      
      // Reset form
      setNewItem({ nome: '', descrizione: '', prezzo: '' });
      setTelefono('');
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      alert('✅ Articolo pubblicato!');
      
    } catch (error) {
      console.error('❌ INSERT ERROR:', error);
      alert('❌ Errore: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const openItemView = (item) => setSelectedItem(item);
  const closeItemView = () => setSelectedItem(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
        >
          ← Indietro
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🛒 Marketplace Padel
          </h1>
          <p className="text-xl text-gray-600">
            {items.length} articoli {showSold && '(inclusi venduti)'}
          </p>
          
          {user && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="mt-8 px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-lg rounded-2xl hover:shadow-2xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-1 transition-all duration-200 shadow-xl"
              disabled={uploading}
            >
              {showForm ? '❌ Chiudi' : '➕ Nuovo articolo'}
            </button>
          )}
        </div>

        {/* ✅ TOGGLE VENDUTI */}
        {!isAdmin && (
          <div className="flex gap-4 mb-6 justify-center max-w-md mx-auto">
            <button 
              onClick={() => setShowSold(false)}
              className={`px-8 py-3 rounded-2xl font-bold flex-1 transition-all shadow-lg ${
                !showSold 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Solo attivi ({items.filter(i => !i.venduto).length})
            </button>
            <button 
              onClick={() => setShowSold(true)}
              className={`px-8 py-3 rounded-2xl font-bold flex-1 transition-all shadow-lg ${
                showSold 
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Mostra venduti ({items.filter(i => i.venduto).length})
            </button>
          </div>
        )}

        {/* ✅ FORM INSERIMENTO */}
        {showForm && user && (
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-emerald-200 shadow-2xl max-w-4xl mx-auto">
            <div className="text-center mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl">
              <h3 className="text-2xl font-black text-gray-800 mb-4">📞 I tuoi riferimenti</h3>
              <div className="flex flex-col lg:flex-row gap-6 justify-center">
                <div className="flex items-center gap-3 bg-white/60 px-6 py-3 rounded-xl backdrop-blur-sm shadow-md">
                  <Mail className="w-6 h-6 text-emerald-600" />
                  <span className="font-semibold">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 px-6 py-3 rounded-xl backdrop-blur-sm shadow-md">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <span className="font-mono">{telefono || '+39 3xx xxx xxxx'}</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleAddItem} className="grid lg:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-lg mb-3 text-gray-800">Nome articolo *</label>
                <input 
                  required 
                  value={newItem.nome} 
                  onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 font-semibold text-lg"
                />
              </div>
              
              <div>
                <label className="block font-bold text-lg mb-3 text-gray-800">Prezzo (€) *</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  value={newItem.prezzo} 
                  onChange={(e) => setNewItem({ ...newItem, prezzo: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 font-bold text-2xl text-emerald-600"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block font-bold text-lg mb-3 text-gray-800">Descrizione</label>
                <textarea 
                  value={newItem.descrizione} 
                  onChange={(e) => setNewItem({ ...newItem, descrizione: e.target.value })}
                  rows="4" 
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 resize-vertical"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block font-bold text-lg mb-3 text-gray-800 flex items-center gap-2">
                  📱 Telefono contatto
                </label>
                <input 
                  type="tel" 
                  placeholder="+39 333 1234567" 
                  value={telefono} 
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 font-mono text-lg"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block font-bold text-lg mb-3 flex items-center gap-2 text-gray-800">
                  <ImageIcon className="w-7 h-7" /> Foto articolo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                  {!imagePreview ? (
                    <>
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                      <input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }} 
                        className="hidden" 
                      />
                      <label 
                        htmlFor="image-upload" 
                        className="cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-1 transition-all duration-200 inline-block"
                      >
                        📷 Seleziona foto
                      </label>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-64 object-cover rounded-2xl shadow-2xl border-4 border-emerald-200"
                      />
                      <button 
                        type="button" 
                        onClick={() => { setImageFile(null); setImagePreview(null); }} 
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold hover:shadow-xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-1 transition-all duration-200"
                      >
                        Cambia foto
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={uploading} 
                className="lg:col-span-2 bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-black py-6 px-12 rounded-3xl text-xl hover:shadow-2xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-2 transition-all duration-300 shadow-2xl disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading ? '⏳ Caricamento in corso...' : '🚀 PUBBLICA ARTICOLO'}
              </button>
            </form>
          </div>
        )}

        {/* ✅ GRID ARTICOLI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden rounded-2xl mb-6 h-48">
                <img 
                  src={item.immagine_url} 
                  alt={item.nome} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {item.venduto && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                    ✅ VENDUTO
                  </div>
                )}
              </div>
              
              <h3 className="font-black text-xl mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">{item.nome}</h3>
              <p className="text-gray-600 mb-6 text-sm line-clamp-3 leading-relaxed">{item.descrizione}</p>
              
              <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-6">
                €{item.prezzo?.toFixed(2)}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl backdrop-blur-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">
                  {item.profiles?.full_name || item.profiles?.display_name || 'Utente'}
                </span>
              </div>
              
              {user && item.user_id === user.id ? (
                <div className="space-y-3">
                  <span className="block w-full text-center text-xs bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold">
                    👑 Il tuo articolo
                  </span>
                  {!item.venduto ? (
                    <>
                      <button 
                        onClick={() => openItemView(item)} 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-1 transition-all"
                      >
                        👁️ Visualizza
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        disabled={deletingId === item.id}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl font-bold flex items-center gap-2 justify-center hover:shadow-xl hover:from-red-700 hover:to-red-800 transform hover:-translate-y-1 transition-all disabled:transform-none"
                      >
                        {deletingId === item.id ? (
                          <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-5 h-5" /> Elimina
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-2xl font-bold text-lg">
                      ✅ VENDUTO
                    </button>
                  )}
                </div>
              ) : user ? (
                !item.venduto ? (
                  <button 
                    onClick={() => openItemView(item)} 
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-5 px-6 rounded-3xl font-black text-xl hover:shadow-2xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-2 transition-all duration-300 shadow-xl"
                  >
                    🛒 Visualizza & Contatta
                  </button>
                ) : (
                  <button className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-5 px-6 rounded-3xl font-bold text-xl">
                    ✅ VENDUTO
                  </button>
                )
              ) : (
                <button className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-5 px-6 rounded-3xl font-bold text-xl hover:shadow-lg hover:from-gray-600 hover:to-gray-700">
                  🔐 Login per contattare
                </button>
              )}
            </div>
          ))}
        </div>

        {items.length === 0 && !loading && (
          <div className="text-center py-24">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-8" />
            <h2 className="text-3xl font-black text-gray-500 mb-4">Nessun articolo disponibile</h2>
            {user && (
              <p className="text-xl text-gray-400 mb-8">
                Sii il primo! Clicca "➕ Nuovo articolo" per iniziare 🚀
              </p>
            )}
            {!user && (
              <button 
                onClick={() => navigate('/login')} 
                className="px-12 py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-xl rounded-3xl hover:shadow-2xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-2 transition-all shadow-xl"
              >
                Accedi per iniziare
              </button>
            )}
          </div>
        )}

        {/* ✅ MODAL DETTAGLI */}
        {selectedItem && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={closeItemView}
          >
            <div 
              className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-white/50" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/100 backdrop-blur-sm z-10">
                <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                  {selectedItem.nome}
                </h2>
                <button 
                  onClick={closeItemView} 
                  className="text-3xl font-black hover:text-red-500 transition-colors p-2 rounded-2xl hover:bg-gray-200"
                >
                  ×
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="relative">
                  <img 
                    src={selectedItem.immagine_url} 
                    alt={selectedItem.nome} 
                    className="w-full h-96 object-cover rounded-3xl shadow-2xl"
                  />
                  {selectedItem.venduto && (
                    <div className="absolute top-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-3xl text-xl font-black shadow-2xl">
                      ✅ VENDUTO
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-6xl font-black bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 bg-clip-text">
                    €{selectedItem.prezzo?.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-black mb-6 text-gray-800">Descrizione completa</h3>
                  <p className="text-xl leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {selectedItem.descrizione || 'Nessuna descrizione fornita dal venditore.'}
                  </p>
                </div>
                
                {!selectedItem.venduto && (
                  <div className="p-10 bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-50 rounded-3xl shadow-xl border border-emerald-200">
                    <h3 className="text-3xl font-black mb-8 text-center bg-gradient-to-r from-blue-800 to-emerald-700 bg-clip-text">
                      📞 Contatta venditore
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8 text-center">
                      <div className="bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2">
                        <Mail className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                        <p className="font-mono text-2xl font-bold text-gray-800 mb-2">
                          {selectedItem.profiles?.email || 'email@venditore.it'}
                        </p>
                        <p className="text-sm text-gray-500">Invia messaggio</p>
                      </div>
                      {selectedItem.telefono && (
                        <div className="bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2">
                          <Phone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                          <p className="font-bold text-3xl text-gray-800 mb-2">
                            {selectedItem.telefono}
                          </p>
                          <p className="text-sm text-gray-500">Chiama subito</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col lg:flex-row gap-6 pt-8 border-t border-gray-200">
                  {user && selectedItem.user_id === user.id ? (
                    <div className="flex-1 space-y-4 lg:space-y-0 lg:space-x-4 lg:flex">
                      <button 
                        onClick={() => handleDelete(selectedItem.id)} 
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-8 rounded-3xl font-black text-xl hover:shadow-2xl hover:from-red-700 hover:to-red-800 transform hover:-translate-y-2 transition-all shadow-xl"
                      >
                        🗑️ Elimina articolo
                      </button>
                      {!selectedItem.venduto && (
                        <button 
                          onClick={() => handleMarkSold(selectedItem.id)} 
                          className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-6 px-8 rounded-3xl font-black text-xl hover:shadow-2xl hover:from-orange-700 hover:to-orange-800 transform hover:-translate-y-2 transition-all shadow-xl"
                        >
                          ✅ Mark Venduto
                        </button>
                      )}
                    </div>
                  ) : user ? (
                    !selectedItem.venduto ? (
                      <button className="flex-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 text-white py-8 px-12 rounded-3xl font-black text-2xl hover:shadow-2xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-3 transition-all duration-300 shadow-2xl">
                        💬 CONTATTA ORA
                      </button>
                    ) : (
                      <button className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-8 px-12 rounded-3xl font-black text-2xl shadow-xl">
                        ✅ VENDUTO
                      </button>
                    )
                  ) : (
                    <button 
                      onClick={() => navigate('/login')} 
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-8 px-12 rounded-3xl font-black text-2xl hover:shadow-xl hover:from-gray-600 hover:to-gray-700 transform hover:-translate-y-2 transition-all shadow-xl"
                    >
                      🔐 Login per contattare
                    </button>
                  )}
                  <button 
                    onClick={closeItemView} 
                    className="px-12 py-6 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-black text-xl rounded-3xl hover:shadow-xl transform hover:-translate-y-1 transition-all shadow-lg"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
