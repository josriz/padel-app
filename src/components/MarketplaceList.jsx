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
  const [selectedItem, setSelectedItem] = useState(null); // ✅ MODAL
  
  // ✅ FORM UTENTE STANDARD
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ nome: '', descrizione: '', prezzo: '' });
  const [telefono, setTelefono] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const isAdmin = role === "admin";

  const demoImages = [
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    "https://images.unsplash.com/photo-1599058917213-423a9b9b437b",
    "https://images.unsplash.com/photo-1606813908898-7e5db4ef3de2"
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("marketplace_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      const itemsWithImages = (data || []).map((item, index) => ({
        ...item,
        immagine_url: item.immagine_url || demoImages[index % demoImages.length],
      }));
      setItems(itemsWithImages);
    }
    setLoading(false);
  };

  // ✅ UPLOAD IMMAGINE
  const handleImageUpload = async (file) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('marketplace-images')
        .upload(fileName, file, { upsert: true });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      alert('❌ Errore upload: ' + error.message);
      return null;
    }
  };

  // ✅ ELIMINA
  const handleDelete = async (id) => {
    if (!window.confirm("Eliminare definitivamente?")) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("marketplace_items").delete().eq("id", id);
      if (!error) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
        alert('✅ Eliminato!');
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
      const { error } = await supabase
        .from("marketplace_items")
        .update({ venduto: !items.find(i => i.id === id)?.venduto })
        .eq("id", id);
      if (!error) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, venduto: !item.venduto } : item));
        alert('✅ Aggiornato!');
      }
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  // ✅ INSERIMENTO CON FOTO
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.nome.trim() || !newItem.prezzo) {
      alert('❌ Nome e prezzo obbligatori!');
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
      
      setItems([data, ...items]);
      setNewItem({ nome: '', descrizione: '', prezzo: '' });
      setTelefono('');
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      alert('✅ Articolo pubblicato!');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // ✅ APRI MODAL
  const openItemView = (item) => {
    setSelectedItem(item);
  };

  // ✅ CHIUDI MODAL
  const closeItemView = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin h-10 w-10 border-4 border-gray-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="min-h-screen bg-white py-6">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">← Indietro</button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p>{items.length} articoli</p>
          {user && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="mt-6 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
              disabled={uploading}
            >
              {showForm ? '❌ Chiudi' : '➕ Nuovo articolo'}
            </button>
          )}
        </div>

        {/* ✅ FORM INSERIMENTO */}
        {showForm && user && (
          <div className="bg-gray-50 p-6 rounded-xl border max-w-3xl mx-auto">
            <div className="text-center mb-6 p-4 bg-emerald-50 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">📞 I tuoi riferimenti</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span>{telefono || '+39 3xx xxx xxxx'}</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleAddItem} className="grid md:grid-cols-2 gap-4">
              <div><label className="block font-semibold mb-2">Nome *</label><input required value={newItem.nome} onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })} className="w-full p-3 border rounded-lg" /></div>
              <div><label className="block font-semibold mb-2">Prezzo (€) *</label><input required type="number" step="0.01" value={newItem.prezzo} onChange={(e) => setNewItem({ ...newItem, prezzo: e.target.value })} className="w-full p-3 border rounded-lg" /></div>
              <div className="md:col-span-2"><label className="block font-semibold mb-2">Descrizione</label><textarea value={newItem.descrizione} onChange={(e) => setNewItem({ ...newItem, descrizione: e.target.value })} rows="3" className="w-full p-3 border rounded-lg" /></div>
              <div className="md:col-span-2"><label className="block font-semibold mb-2">📱 Telefono</label><input type="tel" placeholder="+39 333 1234567" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full p-3 border rounded-lg" /></div>
              
              {/* UPLOAD FOTO */}
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" /> Foto articolo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400">
                  {!imagePreview ? (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <input id="image-upload" type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }} className="hidden" />
                      <label htmlFor="image-upload" className="cursor-pointer bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700">
                        📷 Seleziona foto
                      </label>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-lg" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 text-sm">Cambia foto</button>
                    </div>
                  )}
                </div>
              </div>
              
              <button type="submit" disabled={uploading} className="md:col-span-2 bg-emerald-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:cursor-not-allowed">
                {uploading ? '⏳ Caricamento...' : '🚀 PUBBLICA ARTICOLO'}
              </button>
            </form>
          </div>
        )}

        {/* ✅ GRID - SOLO BOTTONI SEMPLICI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-lg transition-all">
              <img src={item.immagine_url} alt={item.nome} className="w-full h-40 object-cover rounded-lg mb-4" />
              <h3 className="font-bold text-lg mb-2">{item.nome}</h3>
              <p className="text-gray-600 mb-4 text-sm">{item.descrizione}</p>
              <p className="text-2xl font-bold text-emerald-600 mb-4">€{item.prezzo}</p>
              
              {item.venduto && (
                <div className="mb-3 p-2 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center gap-1 justify-center">
                  <CheckCircle className="w-4 h-4" /> VENDUTO
                </div>
              )}
              
              {/* ✅ BOTTONI LISTA SEMPLIFICATI */}
              {user && item.user_id === user.id ? (
                <div className="space-y-2">
                  <span className="block text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">Il tuo articolo</span>
                  {!item.venduto ? (
                    <>
                      <button onClick={() => openItemView(item)} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-700">👁️ Visualizza</button>
                      <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-bold flex items-center gap-2 justify-center">
                        {deletingId === item.id ? 'Eliminando...' : (<><Trash2 className="w-4 h-4" /> Elimina</>)}
                      </button>
                    </>
                  ) : (
                    <button className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg">VENDUTO</button>
                  )}
                </div>
              ) : user ? (
                !item.venduto ? (
                  <button onClick={() => openItemView(item)} className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-emerald-700 text-lg">
                    🛒 Visualizza & Contatta
                  </button>
                ) : (
                  <button className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg">VENDUTO</button>
                )
              ) : (
                <button className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-bold">Login</button>
              )}
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p>Nessun articolo disponibile</p>
            {user && <p className="mt-4">Clicca "➕ Nuovo articolo" per iniziare!</p>}
          </div>
        )}

        {/* ✅ MODAL DETTAGLI COMPLETO */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeItemView}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedItem.nome}</h2>
                <button onClick={closeItemView} className="text-2xl font-bold hover:text-red-500">×</button>
              </div>
              
              <div className="p-6 space-y-6">
                <img src={selectedItem.immagine_url} alt={selectedItem.nome} className="w-full h-64 object-cover rounded-xl" />
                
                <div className="text-center">
                  <p className="text-4xl font-black text-emerald-600">€{selectedItem.prezzo}</p>
                  {selectedItem.venduto && (
                    <div className="mt-2 p-3 bg-green-100 text-green-800 font-bold rounded-full inline-flex items-center gap-2 mx-auto">
                      <CheckCircle className="w-5 h-5" /> VENDUTO
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-xl mb-3">Descrizione</h3>
                  <p className="text-lg leading-relaxed">{selectedItem.descrizione || 'Nessuna descrizione'}</p>
                </div>
                
                {/* ✅ CONTATTI SOLO NEL MODAL */}
                {!selectedItem.venduto && (
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 text-center text-gray-800">📞 Contatta venditore</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-center">
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <Mail className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <p className="font-mono text-sm">{user?.email || 'email@venditore.it'}</p>
                      </div>
                      {selectedItem.telefono && (
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                          <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="font-bold text-lg">{selectedItem.telefono}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* BOTTONI MODAL */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  {user && selectedItem.user_id === user.id ? (
                    <div className="flex-1 space-y-2">
                      <button onClick={() => handleDelete(selectedItem.id)} className="w-full bg-red-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-red-700">
                        🗑️ Elimina articolo
                      </button>
                      {!selectedItem.venduto && (
                        <button onClick={() => handleMarkSold(selectedItem.id)} className="w-full bg-orange-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-orange-700">
                          ✅ Mark Venduto
                        </button>
                      )}
                    </div>
                  ) : user ? (
                    !selectedItem.venduto ? (
                      <button className="flex-1 bg-emerald-600 text-white py-4 px-8 rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl">
                        💬 CONTATTA ORA
                      </button>
                    ) : (
                      <button className="flex-1 bg-gray-400 text-white py-4 px-8 rounded-2xl font-bold cursor-not-allowed">
                        VENDUTO
                      </button>
                    )
                  ) : (
                    <button className="flex-1 bg-gray-500 text-white py-4 px-8 rounded-2xl font-bold">
                      🔐 Effettua Login
                    </button>
                  )}
                  <button onClick={closeItemView} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold">Chiudi</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
