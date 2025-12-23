console.log("### MARKETPLACE LIST CARICATO ###");
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  ShoppingCart,
  Trash2,
  Mail,
  Phone,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function MarketplaceList() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    nome: "",
    descrizione: "",
    prezzo: "",
  });
  const [telefono, setTelefono] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [lastFetch, setLastFetch] = useState(0);
  const [showSold, setShowSold] = useState(false);

  const isAdmin = role === "admin";

  const demoImages = [
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    "https://images.unsplash.com/photo-1599058917213-423a9b9b437b",
    "https://images.unsplash.com/photo-1606813908898-7e5db4ef3de2",
  ];

  // 🔹 FETCH ANNUNCI
  useEffect(() => {
    const now = Date.now();
    if (now - lastFetch > 30000 || items.length === 0) {
      fetchItems();
    }
  }, [showSold]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data: simpleData, error } = await supabase
        .from("marketplace_items")
        .select(
          `
          *,
          profiles!user_id_fkey(full_name, display_name, email, phone)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const itemsWithImages = (simpleData || []).map((item, index) => ({
        ...item,
        immagine_url: item.immagine_url || demoImages[index % demoImages.length],
        profiles: item.profiles || {
          full_name: "Utente",
          display_name: "Utente",
          email: "email@esempio.it",
          phone: "",
        },
      }));

      setItems(showSold ? itemsWithImages : itemsWithImages.filter(i => !i.venduto));
      setLastFetch(Date.now());
    } catch (e) {
      console.error("ERRORE FETCH:", e);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 UPLOAD IMMAGINE
  const handleImageUpload = async (file) => {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const name = `${user?.id || "anonimo"}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("marketplace-images")
      .upload(name, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from("marketplace-images").getPublicUrl(name);
    return data.publicUrl;
  };

  // 🔹 ELIMINA ANNUNCIO
  const handleDelete = async (id) => {
    if (!window.confirm("Eliminare definitivamente?")) return;
    setDeletingId(id);

    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data: item } = await supabase
        .from("marketplace_items")
        .select("user_id")
        .eq("id", id)
        .single();

      if (isAdmin || auth.user.id === item?.user_id) {
        await supabase.from("marketplace_items").delete().eq("id", id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        setSelectedItem(null);
      } else {
        alert("❌ Non hai i permessi per eliminare questo annuncio");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // 🔹 MARK VENDUTO
  const handleMarkSold = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    await supabase
      .from("marketplace_items")
      .update({ venduto: !item.venduto })
      .eq("id", id);

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, venduto: !i.venduto } : i))
    );
  };

  // 🔹 AGGIUNGI ANNUNCIO
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.nome || !newItem.prezzo || !user) {
      alert("❌ Nome, prezzo e login obbligatori!");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = imageFile ? await handleImageUpload(imageFile) : null;

      const { data } = await supabase
        .from("marketplace_items")
        .insert({
          nome: newItem.nome,
          descrizione: newItem.descrizione,
          prezzo: parseFloat(newItem.prezzo),
          telefono,
          user_id: user.id,
          venduto: false,
          immagine_url: imageUrl,
        })
        .select()
        .single();

      setItems((prev) => [
        {
          ...data,
          immagine_url: data.immagine_url || demoImages[0],
          profiles: {
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
            display_name: user.user_metadata?.full_name || user.email?.split("@")[0],
            email: user.email,
            phone: telefono || "",
          },
        },
        ...prev,
      ]);

      setShowForm(false);
      setNewItem({ nome: "", descrizione: "", prezzo: "" });
      setTelefono("");
      setImageFile(null);
      setImagePreview(null);
    } catch (e) {
      console.error("ERRORE INSERT:", e);
      alert("❌ Errore inserimento: " + e.message);
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
    <div 
      className="min-h-screen py-6 px-4 relative overflow-hidden"
      style={{
        backgroundImage: `url('/images/campo-padel.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay per migliorare leggibilità */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-emerald-900/20 to-black/60"></div>
      
      <div className="max-w-7xl mx-auto px-4 space-y-6 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-xl border border-white/70 rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all text-emerald-800 font-bold"
        >
          ← Indietro
        </button>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white drop-shadow-2xl mb-6 bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent pb-4">
            🛒 Marketplace Padel
          </h1>
          <p className="text-2xl text-white/95 font-bold bg-white/20 backdrop-blur-xl px-8 py-4 rounded-3xl inline-block border border-white/30 shadow-2xl">
            {items.length} articoli {showSold && "(inclusi venduti)"}
          </p>

          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-10 px-12 py-5 bg-white/95 backdrop-blur-3xl text-emerald-800 font-black text-xl rounded-3xl hover:shadow-3xl hover:bg-white/100 hover:shadow-emerald-500/30 hover:-translate-y-2 transition-all duration-300 shadow-3xl border-2 border-white/50"
              disabled={uploading}
            >
              {showForm ? "❌ Chiudi" : "➕ Nuovo articolo"}
            </button>
          )}
        </div>

        {/* FORM INSERIMENTO */}
        {showForm && user && (
          <div className="bg-white/90 backdrop-blur-3xl p-10 rounded-3xl border-2 border-white/50 shadow-3xl max-w-5xl mx-auto">
            <form onSubmit={handleAddItem} className="grid lg:grid-cols-2 gap-8">
              <div>
                <label className="block font-bold text-xl mb-4 text-gray-800">
                  Nome articolo *
                </label>
                <input
                  required
                  value={newItem.nome}
                  onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
                  className="w-full p-5 border-2 border-gray-200 rounded-3xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/50 font-semibold text-lg shadow-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-xl mb-4 text-gray-800">
                  Prezzo (€) *
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={newItem.prezzo}
                  onChange={(e) => setNewItem({ ...newItem, prezzo: e.target.value })}
                  className="w-full p-5 border-2 border-gray-200 rounded-3xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/50 font-bold text-3xl text-emerald-600 shadow-lg"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block font-bold text-xl mb-4 text-gray-800">Descrizione</label>
                <textarea
                  value={newItem.descrizione}
                  onChange={(e) =>
                    setNewItem({ ...newItem, descrizione: e.target.value })
                  }
                  rows="4"
                  className="w-full p-5 border-2 border-gray-200 rounded-3xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/50 resize-vertical shadow-lg"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block font-bold text-xl mb-4 flex items-center gap-3 text-gray-800">
                  <ImageIcon className="w-8 h-8" /> Foto articolo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-3xl p-16 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all shadow-xl">
                  {!imagePreview ? (
                    <>
                      <Upload className="w-20 h-20 text-gray-400 mx-auto mb-8" />
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
                        className="cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-10 py-5 rounded-3xl font-black text-xl hover:shadow-3xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-2 transition-all duration-300 inline-block shadow-2xl"
                      >
                        📷 Seleziona foto
                      </label>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-72 object-cover rounded-3xl shadow-3xl border-4 border-emerald-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-3xl font-bold hover:shadow-2xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-2 transition-all duration-300"
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
                className="lg:col-span-2 bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-black py-8 px-16 rounded-4xl text-2xl hover:shadow-3xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-3 transition-all duration-400 shadow-3xl disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading ? "⏳ Caricamento in corso..." : "🚀 PUBBLICA ARTICOLO"}
              </button>
            </form>
          </div>
        )}

        {/* GRID ANNUNCI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/70 p-8 hover:shadow-4xl hover:-translate-y-4 transition-all duration-500 overflow-hidden hover:border-emerald-200/50"
            >
              <div className="relative overflow-hidden rounded-3xl mb-8 h-56">
                <img
                  src={item.immagine_url}
                  alt={item.nome}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {item.venduto && (
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl backdrop-blur-sm border border-white/50">
                    ✅ VENDUTO
                  </div>
                )}
              </div>

              <h3 className="font-black text-2xl mb-4 line-clamp-2 group-hover:text-emerald-600 transition-all duration-300">
                {item.nome}
              </h3>
              <p className="text-gray-700 mb-8 text-base line-clamp-3 leading-relaxed">
                {item.descrizione}
              </p>

              <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-8">
                €{item.prezzo?.toFixed(2)}
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 mb-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl backdrop-blur-sm border border-emerald-100">
                <span className="font-bold text-emerald-800">
                  {item.profiles?.full_name || item.profiles?.display_name || "Utente"}
                </span>
              </div>

              {user && item.user_id === user.id ? (
                <div className="space-y-4">
                  <span className="block w-full text-center text-sm bg-emerald-100 text-emerald-800 px-6 py-3 rounded-2xl font-bold border border-emerald-200">
                    👑 Il tuo articolo
                  </span>
                  <button
                    onClick={() => openItemView(item)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 px-8 rounded-3xl font-bold text-xl hover:shadow-3xl hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-2 transition-all duration-300"
                  >
                    👁️ Visualizza
                  </button>
                  {!item.venduto ? (
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-5 px-8 rounded-3xl font-bold flex items-center gap-3 justify-center hover:shadow-3xl hover:from-red-700 hover:to-red-800 transform hover:-translate-y-2 transition-all duration-300 disabled:transform-none"
                    >
                      {deletingId === item.id ? (
                        <>
                          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-6 h-6" /> Elimina
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkSold(item.id)}
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-5 px-8 rounded-3xl font-bold text-xl hover:shadow-3xl hover:from-orange-700 hover:to-orange-800 transform hover:-translate-y-2 transition-all duration-300"
                    >
                      🔄 Rimuovi Venduto
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openItemView(item)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-6 px-8 rounded-4xl font-black text-2xl hover:shadow-4xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-3 transition-all duration-500 shadow-3xl"
                >
                  👁️ Dettagli
                </button>
              )}
            </div>
          ))}
        </div>

        {/* MODALE DETTAGLI */}
        {selectedItem && (
          <div
            onClick={closeItemView}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-3xl rounded-4xl shadow-4xl max-w-4xl w-full p-12 relative overflow-y-auto max-h-[95vh] border-4 border-white/50"
            >
              <button
                onClick={closeItemView}
                className="absolute top-6 right-6 text-gray-800 hover:text-red-600 font-black text-3xl hover:scale-110 transition-all duration-200"
              >
                ✖
              </button>

              <img
                src={selectedItem.immagine_url}
                alt={selectedItem.nome}
                className="w-full h-96 object-cover rounded-4xl mb-8 shadow-4xl border-4 border-emerald-200"
              />
              <h2 className="text-4xl font-black mb-6 text-gray-900">{selectedItem.nome}</h2>
              <p className="mb-8 text-gray-700 text-lg leading-relaxed">{selectedItem.descrizione}</p>
              <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-10">
                €{selectedItem.prezzo?.toFixed(2)}
              </div>

              <div className="space-y-4 text-xl text-gray-900 bg-gradient-to-r from-gray-50 to-emerald-50 p-8 rounded-4xl backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <span className="font-black text-2xl text-emerald-700 w-32">Venditore:</span>
                  <span className="font-bold">{selectedItem.profiles?.full_name || selectedItem.profiles?.display_name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-2xl text-emerald-700 w-32">Email:</span>
                  <a
                    href={`mailto:${selectedItem.profiles?.email}`}
                    className="underline text-emerald-600 hover:text-emerald-800 font-bold text-xl hover:underline-offset-4"
                  >
                    {selectedItem.profiles?.email}
                  </a>
                </div>
                {selectedItem.telefono && (
                  <div className="flex items-center gap-4">
                    <span className="font-black text-2xl text-emerald-700 w-32">Telefono:</span>
                    <a
                      href={`tel:${selectedItem.telefono}`}
                      className="underline text-emerald-600 hover:text-emerald-800 font-bold text-xl hover:underline-offset-4"
                    >
                      {selectedItem.telefono}
                    </a>
                  </div>
                )}
              </div>

              {user &&
                (selectedItem.user_id === user.id || isAdmin) &&
                !selectedItem.venduto && (
                  <button
                    onClick={() => handleMarkSold(selectedItem.id)}
                    className="mt-12 w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-7 px-12 rounded-4xl font-black text-2xl hover:shadow-4xl hover:from-orange-700 hover:to-orange-800 transform hover:-translate-y-3 transition-all duration-500 shadow-4xl"
                  >
                    🔄 Segna come Venduto
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
