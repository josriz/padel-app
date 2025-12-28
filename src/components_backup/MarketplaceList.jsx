// src/components/MarketplaceList.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Loader2, ShoppingCart } from "lucide-react";

export default function MarketplaceList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("venduto", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Errore fetching marketplace items:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
      </div>
    );
  }

  if (!items.length) {
    return <p className="text-center text-gray-500 mt-10">Nessun articolo disponibile al momento.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
        >
          <div className="relative w-full h-48">
            <img
              src={item.immagine_url || "https://via.placeholder.com/300x200"}
              alt={item.nome || "Prodotto"}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              {item.prezzo ? `${item.prezzo} €` : "Gratuito"}
            </div>
          </div>
          <div className="p-4 flex flex-col flex-1 justify-between">
            <h3 className="font-bold text-lg mb-2">{item.nome}</h3>
            <p className="text-sm text-gray-600 mb-4">{item.descrizione || "Nessuna descrizione"}</p>
            <button className="mt-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Acquista
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
