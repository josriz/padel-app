import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import {
  ShoppingCart,
  MessageCircle,
  Loader2,
  Trash2
} from "lucide-react";
import "./Marketplace.css";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("❌", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleVenduto = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      const { error } = await supabase
        .from("marketplace_items")
        .update({ venduto: !item.venduto })
        .eq("id", id);
      if (error) throw error;
      fetchItems();
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Eliminare articolo?")) return;
    if (user?.user_metadata?.role !== "admin") return alert("❌ Solo admin!");
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from("marketplace_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchItems();
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleContact = (item) => {
    if (item.venduto) return alert("❌ Articolo già venduto!");
    alert(`📱 Contatta venditore per "${item.nome}"\n💰 Prezzo: €${item.prezzo}\n👤 ID Venditore: ${item.user_id?.slice(0,8)}...`);
  };

  if (loading) {
    return (
      <div className="marketplace-loading">
        <Loader2 className="w-16 h-16 animate-spin text-white" />
        <span className="text-white text-2xl font-bold mt-4">Caricamento...</span>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      <header className="marketplace-header">
        <button onClick={() => navigate(-1)}>Indietro</button>
        <h1>🛒 Marketplace Padel</h1>
        <p>Compra e vendi attrezzatura usata</p>
      </header>

      <div className="marketplace-grid">
        {items.length === 0 && (
          <div className="marketplace-empty">
            <ShoppingCart className="w-48 h-48 text-white/30" />
            <h3>Nessun articolo disponibile</h3>
          </div>
        )}

        {items.map(item => (
          <div key={item.id} className="marketplace-card">
            {(user?.user_metadata?.role === "admin" || item.user_id === user?.id) && (
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="delete-btn"
              >
                {deletingId === item.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
              </button>
            )}
            <h3>{item.nome}</h3>
            <p>{item.descrizione || "Nessuna descrizione"}</p>
            <span className="price">€{item.prezzo?.toFixed(2)}</span>
            {item.venduto ? (
              <button disabled className="sold-btn">❌ GIÀ VENDUTO</button>
            ) : (
              <button onClick={() => handleContact(item)} className="contact-btn">
                <MessageCircle className="w-6 h-6" /> CONTATTA
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
