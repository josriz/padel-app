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
    if (user) fetchProducts(); 
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
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
      setNewProduct({ nome: '', descrizione: '', prezzo: '', immagine_url: '' });
      alert('✅ Articolo pubblicato!');
      fetchProducts();
    } catch (error) {
      console.error('Errore:', error);
      alert('❌ Errore: ' + error.message);
    }
  };

  const deleteProduct = async (id, ownerId) => {
    // ✅ Controllo permessi
    if (ownerId !== user.id && user.email !== "raniero.pierno@gmail.com" && user.email !== "giose.rizzi@gmail.com") {
      alert("❌ Non puoi eliminare articoli di altri utenti!");
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
        .eq('id', id)
        .eq('user_id', ownerId === user.id ? user.id : ownerId);
      
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
      
      {/* Form inserimento articoli */}
      <form onSubmit={addProduct} className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold text-gray-700">Aggiungi Articolo</h2>
        <input
          type="text"
          placeholder="Nome"
          value={newProduct.nome}
          onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })}
          className="w-full p-3 border rounded-lg"
        />
        <textarea
          placeholder="Descrizione"
          value={newProduct.descrizione}
          onChange={(e) => setNewProduct({ ...newProduct, descrizione: e.target.value })}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Prezzo"
          value={newProduct.prezzo}
          onChange={(e) => setNewProduct({ ...newProduct, prezzo: e.target.value })}
          className="w-full p-3 border rounded-lg"
        />
        <input type="file" onChange={handleImageUpload} className="w-full" />
        <button
          type="submit"
          disabled={uploading}
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700"
        >
          {uploading ? "Caricamento..." : "Aggiungi Articolo"}
        </button>
      </form>

      {/* Lista articoli */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow-md relative">
            {product.immagine_url && (
              <img src={product.immagine_url} alt={product.nome} className="w-full h-48 object-cover rounded-lg mb-3" />
            )}
            <h3 className="text-lg font-bold">{product.nome}</h3>
            <p className="text-gray-600">{product.descrizione}</p>
            <p className="font-semibold mt-2">€ {product.prezzo.toFixed(2)}</p>

            {(product.user_id === user.id || user.email === "raniero.pierno@gmail.com" || user.email === "giose.rizzi@gmail.com") && (
              <button
                onClick={() => deleteProduct(product.id, product.user_id)}
                disabled={deletingId === product.id}
                className="absolute top-3 right-3 text-red-600 hover:text-red-800 font-bold"
              >
                {deletingId === product.id ? "..." : "Elimina"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
