// src/components/MarketplaceUser.jsx - COMPLETO CON DEBUG + UPLOAD FISSO
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthProvider";

export default function MarketplaceUser() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ nome: '', descrizione: '', prezzo: '', immagine_url: '' });
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { 
    if (user) {
      console.log('🔥 MarketplaceUser - USER ID:', user.id);
      fetchProducts(); 
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('🔥 Fetching products...');
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('🔥 Products fetched:', data, error);
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

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('❌ File troppo grande! Max 5MB');
      return;
    }

    setUploading(true);
    
    try {
      console.log('🔥 UPLOAD START - File:', file.name, 'Size:', file.size);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `marketplace/${fileName}`;

      console.log('🔥 UPLOAD PATH:', filePath);

      // ✅ UPLOAD CON DEBUG
      const { data, error: uploadError } = await supabase.storage
        .from('marketplace-images')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type,
          cacheControl: '3600'
        });

      console.log('🔥 UPLOAD RESULT:', data, uploadError);

      if (uploadError) {
        console.error('❌ UPLOAD ERROR:', uploadError);
        alert(`❌ Upload fallito: ${uploadError.message}`);
        return;
      }

      // ✅ PUBLIC URL
      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(filePath);

      console.log('🔥 PUBLIC URL:', publicUrl);
      setNewProduct(prev => ({ ...prev, immagine_url: publicUrl }));
      alert('✅ Foto caricata!');
      
    } catch (error) {
      console.error('❌ CATCH UPLOAD ERROR:', error);
      alert(`❌ Errore totale: ${error.message}`);
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
      console.log('🔥 ADD PRODUCT:', { 
        nome: newProduct.nome, 
        prezzo: newProduct.prezzo, 
        user_id: user.id 
      });
      
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
          immagine_url: newProduct.immagine_url || null,
          user_id: user.id 
        })
        .select()
        .single();
      
      console.log('🔥 INSERT RESULT:', data, error);

      if (error) {
        console.error('❌ SUPABASE INSERT ERROR:', error);
        alert(`❌ ERRORE SUPABASE: ${error.message}`);
        return;
      }
      
      setProducts([data, ...products]);
      setNewProduct({ nome: '', descrizione: '', prezzo: '', immagine_url: '' });
      alert('✅ Articolo pubblicato e SALVATO!');
      fetchProducts(); // Refresh lista
      
    } catch (error) {
      console.error('❌ CATCH INSERT ERROR:', error);
      alert('❌ Errore totale: ' + error.message);
    }
  };

  const deleteProduct = async (id, ownerId) => {
    if (ownerId !== user.id && !['raniero.pierno@gmail.com', 'giose.rizzi@gmail.com'].includes(user.email)) {
      alert("❌ Non puoi eliminare articoli di altri!");
      return;
    }

    if (!confirm("Eliminare articolo?")) return;
    
    setDeletingId(id);
    const oldProducts = products;
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
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-gradient-to-br from-emerald-50 to-blue-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 text-center">Marketplace Padel</h1>
      
      {/* INFO UTENTE */}
      <div className="bg-white p-4 rounded-lg shadow-md text-center">
        <p>👤 <strong>{user?.email}</strong></p>
        <p>ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{user?.id?.slice(0,8)}...</code></p>
      </div>

      {/* Form inserimento articoli */}
      <form onSubmit={addProduct} className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold text-gray-700">📦 Aggiungi Nuovo Articolo</h2>
        <input
          type="text"
          placeholder="Nome articolo (es: Racket Padel Pro)"
          value={newProduct.nome}
          onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          required
        />
        <textarea
          placeholder="Descrizione (opzionale)"
          value={newProduct.descrizione}
          onChange={(e) => setNewProduct({ ...newProduct, descrizione: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          rows="3"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Prezzo (€)"
          value={newProduct.prezzo}
          onChange={(e) => setNewProduct({ ...newProduct, prezzo: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          required
        />
        <div>
          <label className="block text-sm font-medium mb-2">📸 Foto (opzionale)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImageUpload} 
            className="w-full p-2 border-2 border-dashed rounded-lg hover:border-emerald-400"
            disabled={uploading}
          />
          {newProduct.immagine_url && (
            <p className="text-sm text-green-600 mt-1">✅ Immagine pronta: {newProduct.immagine_url.slice(0,50)}...</p>
          )}
        </div>
        <button
          type="submit"
          disabled={uploading || !newProduct.nome || !newProduct.prezzo}
          className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "⏳ Caricamento..." : "✅ PUBBLICA ARTICOLO"}
        </button>
      </form>

      {/* Lista articoli */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">📋 I Tuoi Articoli ({products.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all relative group">
              {product.immagine_url && (
                <img 
                  src={product.immagine_url} 
                  alt={product.nome} 
                  className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                />
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{product.nome}</h3>
              <p className="text-gray-600 mb-3 line-clamp-2">{product.descrizione}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-emerald-600">€{product.prezzo.toFixed(2)}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {product.user_id === user.id ? 'TUO' : 'Altro'}
                </span>
              </div>

              {(product.user_id === user.id || ['raniero.pierno@gmail.com', 'giose.rizzi@gmail.com'].includes(user.email)) && (
                <button
                  onClick={() => deleteProduct(product.id, product.user_id)}
                  disabled={deletingId === product.id}
                  className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                >
                  {deletingId === product.id ? '⏳' : '🗑️'}
                </button>
              )}
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-2xl mb-4">📦 Nessun articolo</p>
            <p>Pubblica il tuo primo articolo qui sopra!</p>
          </div>
        )}
      </div>
    </div>
  );
}
