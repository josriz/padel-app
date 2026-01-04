// src/components/MarketplaceUser.jsx - COMPLETO CON CONTATTI + LAYOUT IDENTICO + BOTTONI PICCOLI
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Loader2, X, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function MarketplaceUser() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ 
    nome: '', 
    descrizione: '', 
    prezzo: '', 
    telefono: '', 
    mail: '', 
    immagine_url: '',
    immagine_preview: ''
  });
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { 
    if (user) {
      console.log('🔥 MarketplaceUser - USER:', user.id, user.email);
      fetchProducts(); 
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      console.log('🔥 TUOI Products:', data?.length || 0);
      if (!error && data) setProducts(data);
    } catch (error) {
      console.error('❌ Errore fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) {
      alert('❌ Seleziona un file e accedi!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File troppo grande! Max 5MB');
      return;
    }

    // ✅ ANTEPRIMA IMMEDIATA
    const previewUrl = URL.createObjectURL(file);
    setNewProduct(prev => ({ 
      ...prev, 
      immagine_preview: previewUrl,
      immagine_url: '' 
    }));

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `marketplace/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('marketplace-images')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(filePath);

      setNewProduct(prev => ({ 
        ...prev, 
        immagine_url: publicUrl,
        immagine_preview: previewUrl 
      }));
      alert('✅ Foto caricata!');
    } catch (error) {
      alert('❌ Errore upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.nome.trim() || !newProduct.prezzo) {
      alert('❌ Nome e prezzo obbligatori!');
      return;
    }
    try {
      const prezzoNum = parseFloat(newProduct.prezzo);
      if (isNaN(prezzoNum) || prezzoNum <= 0) {
        alert('❌ Prezzo non valido!');
        return;
      }

      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({ 
          nome: newProduct.nome.trim(),
          descrizione: newProduct.descrizione?.trim() || '',
          prezzo: prezzoNum,
          telefono: newProduct.telefono.trim() || null,
          mail: newProduct.mail.trim() || null,
          immagine_url: newProduct.immagine_url || null,
          user_id: user.id 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts([data, ...products]);
      setNewProduct({ nome: '', descrizione: '', prezzo: '', telefono: '', mail: '', immagine_url: '', immagine_preview: '' });
      setShowForm(false);
      alert('✅ Articolo pubblicato!');
      fetchProducts();
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const deleteProduct = async (id, ownerId) => {
    if (ownerId !== user.id && !['raniero.pierno@gmail.com', 'giose.rizzi@gmail.com'].includes(user.email)) {
      alert("❌ Non puoi eliminare articoli di altri!");
      return;
    }
    if (!confirm("Eliminare articolo?")) return;
    
    setDeletingId(id);
    const oldProducts = [...products];
    setProducts(products.filter(p => p.id !== id));
    
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      alert('✅ Articolo eliminato!');
    } catch (error) {
      setProducts(oldProducts);
      alert('❌ Errore: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-gradient-to-br from-emerald-50 to-blue-50 min-h-screen">
      
      {/* HEADER - INDIETRO SINISTRA + DIRECTOR DESTRA */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          {/* INDIETRO PICCOLO */}
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1 text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </button>
          
          {/* DIRECTOR MARKETPLACE A DESTRA */}
          <div className="flex items-center gap-2">
            <img 
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&round=true" 
              alt="Raniero Pierno" 
              className="w-12 h-12 rounded-full border-3 border-emerald-500 shadow-md"
            />
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Director Marketplace</p>
              <p className="text-xs text-emerald-600 font-semibold">Raniero Pierno</p>
            </div>
          </div>
        </div>
        {/* INFO UTENTE CENTRO */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">👤 {user?.email?.split('@')[0]}</p>
          <code className="bg-gray-100 px-3 py-1 rounded-full text-xs mt-1 inline-block">
            ID: {user?.id?.slice(0,8)}...
          </code>
        </div>
      </div>

      {/* BOTTONE INSERISCI PICCOLO */}
      {!showForm && (
        <div className="text-center">
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-emerald-700 shadow-lg transition-all"
          >
            ➕ Inserisci articolo
          </button>
        </div>
      )}

      {/* FORM A SCOMPARSA CON CONTATTI */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">📦 Nuovo Articolo</h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={addProduct} className="space-y-4">
            <input
              type="text"
              placeholder="Nome articolo (es: Racket Padel Pro)"
              value={newProduct.nome}
              onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            
            <input
              type="tel"
              placeholder="📱 Numero di telefono (opzionale)"
              value={newProduct.telefono}
              onChange={(e) => setNewProduct({ ...newProduct, telefono: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            
            <input
              type="email"
              placeholder="✉️ Email di contatto (opzionale)"
              value={newProduct.mail}
              onChange={(e) => setNewProduct({ ...newProduct, mail: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            
            <textarea
              placeholder="Descrizione (opzionale)"
              value={newProduct.descrizione}
              onChange={(e) => setNewProduct({ ...newProduct, descrizione: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows="3"
            />
            
            <input
              type="number"
              step="0.01"
              placeholder="Prezzo (€)"
              value={newProduct.prezzo}
              onChange={(e) => setNewProduct({ ...newProduct, prezzo: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">📸 Foto (opzionale)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload} 
                className="w-full p-2 border-2 border-dashed rounded-lg hover:border-emerald-400"
                disabled={uploading}
              />
              {newProduct.immagine_preview && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg border">
                  <img 
                    src={newProduct.immagine_preview} 
                    alt="Anteprima" 
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-xs text-emerald-600 mt-1">✅ Anteprima foto</p>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={uploading || !newProduct.nome || !newProduct.prezzo}
              className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-md"
            >
              {uploading ? "⏳ Caricamento..." : "✅ Pubblica articolo"}
            </button>
          </form>
        </div>
      )}

      {/* LISTA ARTICOLI CON CONTATTI VISIBILI */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">📋 I Tuoi Articoli ({products.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all relative group">
              {product.immagine_url && (
                <img 
                  src={product.immagine_url} 
                  alt={product.nome} 
                  className="w-full h-40 object-cover rounded-lg mb-3 group-hover:scale-[1.02] transition-transform"
                />
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{product.nome}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.descrizione}</p>
              
              {/* ✅ CONTATTI VISIBILI */}
              {product.telefono && (
                <p className="text-xs text-gray-700 mb-1 flex items-center gap-1">
                  📱 {product.telefono}
                </p>
              )}
              {product.mail && (
                <p className="text-xs text-gray-700 mb-3 flex items-center gap-1">
                  ✉️ {product.mail}
                </p>
              )}
              
              <div className="flex justify-between items-center pb-2">
                <span className="text-lg font-bold text-emerald-600">€{product.prezzo.toFixed(2)}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">TUO</span>
              </div>
              
              {(product.user_id === user.id || ['raniero.pierno@gmail.com', 'giose.rizzi@gmail.com'].includes(user.email)) && (
                <button
                  onClick={() => deleteProduct(product.id, product.user_id)}
                  disabled={deletingId === product.id}
                  className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  {deletingId === product.id ? '⏳' : '🗑️'}
                </button>
              )}
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-xl mb-2">📦 Nessun articolo</p>
            <p className="text-gray-500 text-sm">Clicca sopra per inserire il primo!</p>
          </div>
        )}
      </div>
    </div>
  );
}
