import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ShoppingBag, Plus, Trash2, Loader2, Camera, Phone, Mail, User } from "lucide-react";
import { useAuth } from "../context/AuthProvider";

export default function MarketplaceUser() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ nome:'', descrizione:'', prezzo:'', immagine_url:'' });
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showReferences, setShowReferences] = useState(false);

  useEffect(() => { 
    if (user) fetchProducts(); 
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) setProducts(data);
    } catch (error) {
      console.error('Errore fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `marketplace/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('marketplace-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(filePath);

      setNewProduct(prev => ({ ...prev, immagine_url: publicUrl }));
      alert('✅ Foto caricata!');
    } catch (error) {
      alert('❌ Errore upload: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.nome.trim() || !newProduct.prezzo) {
      alert('❌ Nome e prezzo obbligatori!');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({ 
          nome: newProduct.nome.trim(),
          descrizione: newProduct.descrizione?.trim() || '',
          prezzo: parseFloat(newProduct.prezzo),
          immagine_url: newProduct.immagine_url || null,
          user_id: user.id 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts([data, ...products]);
      setNewProduct({ nome:'', descrizione:'', prezzo:'', immagine_url:'' });
      alert('✅ Articolo pubblicato!');
      fetchProducts();
    } catch (error) {
      console.error('Errore:', error);
      alert('❌ Errore: ' + error.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Eliminare articolo?")) return;
    
    setDeletingId(id);
    const oldProducts = products;
    setProducts(products.filter(p => p.id !== id));
    
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      setProducts(oldProducts);
      alert('❌ Errore: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-gradient-to-br from-emerald-50 to-blue-50 min-h-screen">
      
      {/* HEADER */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent mb-6">
          🛒 Marketplace Personale
        </h1>
        <p className="text-2xl text-gray-700 font-semibold">Inserisci articoli, prezzi e i tuoi riferimenti</p>
      </div>

      {/* FORM INSERIMENTO ARTICOLO */}
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800 flex items-center justify-center gap-4">
          <Plus className="w-12 h-12 text-emerald-600" />
          Nuovo Articolo
        </h2>
        
        <form id="productForm" onSubmit={addProduct} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* DATI ARTICOLO */}
          <div className="space-y-6">
            <div>
              <label className="block text-xl font-bold text-gray-800 mb-4">📝 Nome articolo *</label>
              <input 
                required 
                placeholder="Es: Racchetta Head Speed Pro" 
                value={newProduct.nome} 
                onChange={e=>setNewProduct({...newProduct, nome:e.target.value})}
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-xl font-semibold transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xl font-bold text-gray-800 mb-4">💰 Prezzo (€) *</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                min="0.01"
                placeholder="150.00" 
                value={newProduct.prezzo} 
                onChange={e=>setNewProduct({...newProduct, prezzo:e.target.value})}
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-xl font-semibold transition-all"
              />
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-xl font-bold text-gray-800 mb-4">📄 Descrizione</label>
              <textarea 
                rows="4" 
                placeholder="Condizioni, caratteristiche, dettagli..." 
                value={newProduct.descrizione} 
                onChange={e=>setNewProduct({...newProduct, descrizione:e.target.value})}
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 ring-emerald-500 focus:border-emerald-500 text-xl transition-all resize-vertical"
              />
            </div>
          </div>

          {/* UPLOAD FOTO */}
          <div className="flex flex-col items-center">
            <label className="w-full text-xl font-bold text-gray-800 mb-6 text-center flex items-center gap-3 justify-center">
              📸 Foto articolo
              {newProduct.immagine_url && <span className="text-emerald-600 font-bold">✅ Caricata</span>}
            </label>
            
            <label className="w-full p-10 border-2 border-dashed border-emerald-300 rounded-3xl text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center min-h-[280px] bg-gradient-to-br from-emerald-50/50 to-blue-50/50">
              {uploading ? (
                <>
                  <Loader2 className="w-20 h-20 text-emerald-600 animate-spin mb-6" />
                  <p className="text-2xl font-bold text-emerald-700 mb-2">Caricando... {uploadProgress}%</p>
                </>
              ) : newProduct.immagine_url ? (
                <>
                  <img src={newProduct.immagine_url} alt="Anteprima" className="w-full h-48 object-cover rounded-2xl mb-6 shadow-2xl" />
                  <p className="text-xl font-bold text-emerald-700">✅ Foto pronta</p>
                </>
              ) : (
                <>
                  <Camera className="w-24 h-24 text-gray-400 mb-6 opacity-60" />
                  <p className="text-2xl font-bold text-gray-700 mb-2">Clicca per caricare</p>
                  <p className="text-lg text-gray-500">JPG, PNG (max 5MB)</p>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={uploading} 
                className="hidden" 
              />
            </label>
          </div>
        </form>

        {/* BUTTON PUBBLICA */}
        <div className="flex justify-center mt-12">
          <button 
            type="submit" 
            form="productForm"
            disabled={uploading || !newProduct.nome || !newProduct.prezzo}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-20 py-8 rounded-3xl font-black text-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-4 disabled:cursor-not-allowed disabled:shadow-none px-20"
          >
            <Plus className="w-10 h-10" />
            {uploading ? '⏳ Pubblicando...' : '🚀 PUBBLICA ARTICOLO'}
          </button>
        </div>
      </div>

      {/* RIFERIMENTI PERSONALI */}
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 flex items-center justify-center gap-4">
          <Phone className="w-12 h-12 text-blue-600" />
          I Miei Contatti
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl">
            <User className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{user?.user_metadata?.full_name || 'Nome Utente'}</h3>
            <p className="text-xl text-gray-600">{user?.email}</p>
          </div>
          <div className="p-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl">
            <Mail className="w-20 h-20 text-emerald-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-xl font-mono bg-white px-6 py-3 rounded-xl shadow-sm">{user?.email}</p>
          </div>
          <div className="p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
            <Phone className="w-20 h-20 text-orange-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Telefono</h3>
            <p className="text-xl font-mono bg-white px-6 py-3 rounded-xl shadow-sm">+39 123 456 7890</p>
            <p className="text-sm text-gray-500 mt-2">Aggiungi nel profilo</p>
          </div>
        </div>
      </div>

      {/* LISTA ARTICOLI */}
      <div>
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800 flex items-center justify-center gap-4 mx-auto">
          <ShoppingBag className="w-16 h-16 text-emerald-600" />
          I Miei Articoli ({products.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl hover:-translate-y-4 transition-all group">
              <div className="w-full h-64 rounded-3xl overflow-hidden mb-8 group-hover:scale-105 transition-transform">
                {product.immagine_url ? (
                  <img src={product.immagine_url} alt={product.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <ShoppingBag className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{product.nome}</h3>
              <p className="text-4xl font-black text-emerald-600 mb-6">€{parseFloat(product.prezzo).toFixed(2)}</p>
              <p className="text-gray-600 text-lg mb-8 line-clamp-3 leading-relaxed">{product.descrizione}</p>
              
              <button 
                onClick={() => deleteProduct(product.id)}
                disabled={deletingId === product.id}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-400 text-white py-6 rounded-3xl font-bold text-xl flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transition-all disabled:cursor-not-allowed"
              >
                {deletingId === product.id ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-8 h-8" />
                    Elimina Articolo
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-24 bg-white/50 backdrop-blur-xl rounded-3xl p-12 border border-dashed border-emerald-300">
          <ShoppingBag className="w-32 h-32 text-gray-300 mx-auto mb-8" />
          <h3 className="text-4xl font-bold text-gray-600 mb-6">Nessun articolo pubblicato</h3>
          <p className="text-2xl text-gray-500 mb-12 max-w-3xl mx-auto">
            🎾 Inizia ora! Compila nome, prezzo e foto → Clicca il bottone verde grande → Articolo pubblicato!
          </p>
        </div>
      )}
    </div>
  );
}
