import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-100 to-red-300 p-4">
      <h1 className="text-6xl font-black mb-4">404</h1>
      <p className="text-2xl mb-6">Pagina non trovata</p>
      <button
        onClick={() => navigate("/dashboard")}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
      >
        Torna alla Dashboard
      </button>
    </div>
  );
}
