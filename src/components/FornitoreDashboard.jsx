// src/components/FornitoreDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function FornitoreDashboard() {
  // Esempio di dati fittizi, puoi sostituirli con dati reali da Supabase
  const stats = {
    guadagno: 250.75,
    venduti: 12,
    totali: 20,
    attivi: 8,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard Fornitore</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tuo Guadagno */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
          <span className="text-sm font-medium">Tuo Guadagno</span>
          <span className="text-xl font-bold mt-2">€{stats.guadagno.toFixed(2)}</span>
          <div className="flex mt-2 gap-2">
            <button className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">←</button>
            <button className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">→</button>
          </div>
        </div>

        {/* Venduti */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
          <span className="text-sm font-medium">Venduti</span>
          <span className="text-xl font-bold mt-2">{stats.venduti}</span>
        </div>

        {/* Totali */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
          <span className="text-sm font-medium">Totali</span>
          <span className="text-xl font-bold mt-2">{stats.totali}</span>
        </div>

        {/* Attivi */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
          <span className="text-sm font-medium">Attivi</span>
          <span className="text-xl font-bold mt-2">{stats.attivi}</span>
        </div>
      </div>

      {/* Link utili */}
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link
          to="/marketplace/user"
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
        >
          Vai al Marketplace
        </Link>

        <Link
          to="/tournaments"
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
        >
          Tornei
        </Link>
      </div>
    </div>
  );
}
