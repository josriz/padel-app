// src/components/MarketplaceAdminReports.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { formatPrice } from "./marketplaceUtils";
import { Loader2, Printer, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MarketplaceAdminReports() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    if (user?.user_metadata?.role === "admin") fetchItems();
  }, [user]);

  useEffect(() => {
    if (items.length) filterItemsByPeriod();
  }, [period, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("marketplace_items")
        .select(`*, profiles(full_name, email)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Errore fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfit = (item) => {
    if (!item.profit_percent) return 0;
    return parseFloat(item.prezzo || 0) * parseFloat(item.profit_percent) / 100;
  };

  const filterItemsByPeriod = () => {
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case "monthly":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "quarterly":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "semiannual":
        startDate.setMonth(today.getMonth() - 6);
        break;
      case "annual":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filtered = items.filter((item) => {
      const created = new Date(item.created_at);
      return created >= startDate && created <= today;
    });
    setFilteredItems(filtered);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Report Guadagni Marketplace", 14, 22);

    const tableData = filteredItems.map((item) => [
      item.nome,
      formatPrice(item.prezzo),
      item.profit_percent ? item.profit_percent + "%" : "-",
      formatPrice(calculateProfit(item)),
      item.created_at ? new Date(item.created_at).toLocaleDateString("it-IT") : "-",
      item.profiles?.full_name || item.user_id,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Articolo", "Prezzo", "% Guadagno", "Guadagno", "Data", "Venditore"]],
      body: tableData,
    });

    doc.save(`report_guadagni_${period}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ["Articolo", "Prezzo", "% Guadagno", "Guadagno", "Data", "Venditore"];
    const rows = filteredItems.map((item) => [
      item.nome,
      item.prezzo,
      item.profit_percent || "-",
      calculateProfit(item),
      item.created_at ? new Date(item.created_at).toLocaleDateString("it-IT") : "-",
      item.profiles?.full_name || item.user_id,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_guadagni_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || user.user_metadata?.role !== "admin") {
    return (
      <div className="pt-20 max-w-5xl mx-auto p-8 text-center text-red-600">
        Accesso negato. Solo admin può visualizzare questa pagina.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-20 max-w-5xl mx-auto p-8 flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="pt-20 max-w-6xl mx-auto p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8">📊 Report Guadagni Marketplace</h2>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 items-center">
          <label className="font-semibold text-lg">Periodo:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border-2 border-gray-300 rounded-xl p-2 text-lg"
          >
            <option value="monthly">Mensile</option>
            <option value="quarterly">Trimestrale</option>
            <option value="semiannual">Semestrale</option>
            <option value="annual">Annuale</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            onClick={exportToPDF}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            PDF
          </button>
          <button
            onClick={exportToCSV}
            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-lg font-bold">Articolo</th>
              <th className="px-6 py-3 text-lg font-bold">Prezzo</th>
              <th className="px-6 py-3 text-lg font-bold">% Guadagno</th>
              <th className="px-6 py-3 text-lg font-bold">Guadagno</th>
              <th className="px-6 py-3 text-lg font-bold">Data</th>
              <th className="px-6 py-3 text-lg font-bold">Venditore</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{item.nome}</td>
                <td className="px-6 py-4">{formatPrice(item.prezzo)}</td>
                <td className="px-6 py-4">{item.profit_percent ? item.profit_percent + "%" : "-"}</td>
                <td className="px-6 py-4">{formatPrice(calculateProfit(item))}</td>
                <td className="px-6 py-4">{item.created_at ? new Date(item.created_at).toLocaleDateString("it-IT") : "-"}</td>
                <td className="px-6 py-4">{item.profiles?.full_name || item.user_id}</td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 font-semibold">
                  Nessun articolo trovato per il periodo selezionato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
