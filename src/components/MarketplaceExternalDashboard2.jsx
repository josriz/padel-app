// src/components/MarketplaceExternalDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../supabaseClient";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function MarketplaceExternalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ articoli: 0, attivi: 0, venduti: 0 });
  const [articoli, setArticoli] = useState([]);
  const [newArticolo, setNewArticolo] = useState({ nome: "", prezzo: "", descrizione: "", image: null });
  const [uploading, setUploading] = useState(false);
  const [commissioni, setCommissioni] = useState(15.0);
  const [showForm, setShowForm] = useState(false);

  if (!user || user.user_metadata?.role !== "fornitore") {
    return <div style={{ padding: 80, textAlign: "center", color: "red", fontSize: "24px" }}>❌ Accesso riservato ai fornitori</div>;
  }

  // Carica commissioni
  useEffect(() => {
    const fetchCommissioni = async () => {
      const { data } = await supabase.from("marketplace_commissioni").select("percentuale").single();
      if (data) setCommissioni(data.percentuale);
    };
    fetchCommissioni();
  }, []);

  // Carica articoli
  useEffect(() => {
    if (!user?.id) return;
    const fetchArticoli = async () => {
      const { data } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("fornitore_id", user.id)
        .order("created_at", { ascending: false });
      if (data) {
        setArticoli(data);
        setStats({
          articoli: data.length,
          attivi: data.filter(a => a.is_active).length,
          venduti: data.filter(a => a.is_venduto).length
        });
      }
    };
    fetchArticoli();
  }, [user?.id]);

  // --- FUNZIONI ARTICOLI ---
  const handleInserisciArticolo = async () => {
    const prezzoBase = parseFloat(newArticolo.prezzo);
    if (!newArticolo.nome || prezzoBase <= 0 || isNaN(prezzoBase)) return alert("❌ Compila nome e prezzo valido!");
    setUploading(true);
    let image_url = null;

    if (newArticolo.image) {
      const fileExt = newArticolo.image.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("marketplace-images").upload(fileName, newArticolo.image);
      if (!uploadError) {
        const { data } = supabase.storage.from("marketplace-images").getPublicUrl(fileName);
        image_url = data.publicUrl;
      }
    }

    const prezzoFinale = Math.round(prezzoBase * (1 + commissioni / 100) * 100) / 100;
    const articoloData = { ...newArticolo, prezzo_base: prezzoBase, prezzo_finale: prezzoFinale, commissione_percentuale: commissioni, fornitore_id: user.id, is_active: true, is_venduto: false, image_url };
    const { error } = await supabase.from("marketplace_items").insert(articoloData).select().single();
    setUploading(false);
    setNewArticolo({ nome: "", prezzo: "", descrizione: "", image: null });
    if (!error) setArticoli(prev => [articoloData, ...prev]);
  };

  const toggleArticolo = async (id, field) => {
    const articolo = articoli.find(a => a.id === id);
    if (!articolo) return;
    const { error } = await supabase.from("marketplace_items").update({ [field]: !articolo[field] }).eq("id", id);
    if (!error) setArticoli(prev => prev.map(a => a.id === id ? { ...a, [field]: !a[field] } : a));
  };

  // --- STAMPA PDF ---
  const handlePrintPDF = () => {
    const content = document.getElementById("fornitore-dashboard").innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Report Fornitore</title></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  // --- DATI GRAFICI ---
  const pieData = {
    labels: ["Attivi", "Inattivi"],
    datasets: [{ data: [stats.attivi, stats.articoli - stats.attivi], backgroundColor: ["#10B981", "#EF4444"] }]
  };
  const barData = {
    labels: articoli.map(a => a.nome),
    datasets: [{ label: "Prezzo Finale (€)", data: articoli.map(a => a.prezzo_finale || 0), backgroundColor: "#2563EB" }]
  };
  const chartOptions = { responsive: true, plugins: { legend: { display: false } }, maintainAspectRatio: false };

  return (
    <div id="fornitore-dashboard" style={{ minHeight: "100vh", background: "#ffffff", padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>Benvenuto RoclaClub</h1>
          <img src="/logo.png" alt="Logo RoclaClub" style={{ height: "60px", objectFit: "contain" }} />
          <button onClick={() => window.location.href = "/dashboard"} 
            style={{ padding: "6px 12px", background: "#F59E0B", color: "#fff", borderRadius: "6px" }}>Esci</button>
        </div>

        {/* GRAFICI */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "200px", background: "#F3F4F6", padding: "12px", borderRadius: "8px" }}>
            <Pie data={pieData} options={chartOptions} />
          </div>
          <div style={{ flex: 2, height: "200px", background: "#F3F4F6", padding: "12px", borderRadius: "8px" }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        {/* ACCORDION FORM */}
        <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: "12px", padding: "8px 12px", borderRadius: "6px", background: "#2563EB", color: "white" }}>
          {showForm ? "Chiudi Form" : "Inserisci Nuovo Articolo"}
        </button>
        {showForm && (
          <div style={{ padding: "12px", background: "#F9FAFB", borderRadius: "6px", marginBottom: "20px" }}>
            <input type="text" placeholder="Nome" value={newArticolo.nome} onChange={e => setNewArticolo({ ...newArticolo, nome: e.target.value })} style={{ marginBottom: "8px", width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input type="number" placeholder="Prezzo" value={newArticolo.prezzo} onChange={e => setNewArticolo({ ...newArticolo, prezzo: e.target.value })} style={{ marginBottom: "8px", width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }} />
            <textarea placeholder="Descrizione" value={newArticolo.descrizione} onChange={e => setNewArticolo({ ...newArticolo, descrizione: e.target.value })} style={{ marginBottom: "8px", width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input type="file" accept="image/*" onChange={e => setNewArticolo({ ...newArticolo, image: e.target.files[0] })} style={{ marginBottom: "8px" }} />
            <button onClick={handleInserisciArticolo} disabled={uploading} style={{ padding: "6px 12px", background: "#10B981", color: "white", borderRadius: "6px" }}>
              {uploading ? "Caricamento..." : "Inserisci"}
            </button>
          </div>
        )}

        {/* LISTA ARTICOLI */}
        {articoli.map(a => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", marginBottom: "8px", background: "#F3F4F6", borderRadius: "6px", borderLeft: `4px solid ${a.is_active ? "#10B981" : "#EF4444"}` }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {a.image_url && <img src={a.image_url} alt={a.nome} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }} />}
              <div>
                <strong>{a.nome}</strong> - €{a.prezzo_finale?.toFixed(2)}
                <div style={{ fontSize: "12px", color: "#555" }}>{a.descrizione}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => toggleArticolo(a.id, "is_active")} style={{ padding: "4px 8px", background: a.is_active ? "#EF4444" : "#10B981", color: "#fff", borderRadius: "4px" }}>{a.is_active ? "Disattiva" : "Attiva"}</button>
              <button onClick={() => toggleArticolo(a.id, "is_venduto")} style={{ padding: "4px 8px", background: a.is_venduto ? "#2563EB" : "#F59E0B", color: "#fff", borderRadius: "4px" }}>{a.is_venduto ? "Venduto" : "Disponibile"}</button>
            </div>
          </div>
        ))}

        {/* BOTTONI REPORT */}
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <button onClick={handlePrintPDF} style={{ padding: "6px 12px", background: "#EF4444", color: "white", borderRadius: "6px" }}>Stampa/PDF</button>
          <button onClick={() => {
            const csvContent = [
              ["Nome Articolo", "Prezzo Base (€)", "Prezzo Finale (€)", "Stato", "Venduto", "Commissione %", "Data"],
              ...articoli.map(a => [a.nome, (a.prezzo_base || a.prezzo || 0).toFixed(2), a.prezzo_finale?.toFixed(2), a.is_active ? "ATTIVO" : "INATTIVO", a.is_venduto ? "VENDUTO" : "DISPONIBILE", `${a.commissione_percentuale || commissioni}%`, new Date(a.created_at).toLocaleDateString("it-IT")])
            ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
            const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `report_${user.email.replace("@", "_")}_${new Date().toISOString().split("T")[0]}.csv`;
            link.click();
          }} style={{ padding: "6px 12px", background: "#10B981", color: "white", borderRadius: "6px" }}>Esporta CSV</button>
        </div>
      </div>
    </div>
  );
}
