import React from "react";
import { useNavigate } from "react-router-dom";

export default function RegistrationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-blue-400 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Registrazione</h1>
        <p className="mb-8 text-gray-600">Compila i dati per registrarti</p>
        {/* Qui puoi inserire form registrazione */}
        <button
          onClick={() => navigate("/")}
          className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-semibold"
        >
          Torna al Login
        </button>
      </div>
    </div>
  );
}
