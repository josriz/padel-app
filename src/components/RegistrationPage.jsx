// src/pages/RegistrationPage.jsx - COMPLETO E CORRETTO
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  if (!formData.nome || !formData.cognome || !formData.email) {
    setError("Tutti i campi sono obbligatori");
    setLoading(false);
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: 'temp123!',  // ✅ PASSWORD TEMPORANEA MINIMA
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { 
          nome: formData.nome,
          cognome: formData.cognome
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("✅ Registrazione ok! Controlla email - clicca link per cambiare password.");
      setTimeout(() => navigate("/"), 4000);
    }
  } catch (err) {
    setError("❌ Errore server");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-500 p-4 relative overflow-hidden">
      {/* Sfondo animato */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 lg:p-12 max-w-md w-full text-center relative z-10 border border-white/50">
        {/* Header */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl mx-auto mb-6 shadow-2xl flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Registrati
          </h1>
          <p className="text-xl text-gray-600 font-medium">Crea il tuo account Padel App</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="nome"
              placeholder="Nome"
              value={formData.nome}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl"
            />
          </div>

          <div>
            <input
              type="text"
              name="cognome"
              placeholder="Cognome"
              value={formData.cognome}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 font-semibold text-left">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-emerald-700 font-semibold text-left animate-pulse">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 hover:from-emerald-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Invio...
              </span>
            ) : (
              "Registrati Ora 🚀"
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t-2 border-gray-100">
          <button
            onClick={() => navigate("/")}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-2xl font-semibold text-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-xl hover:shadow-2xl border border-gray-200"
          >
            ← Torna al Login
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Riceverai un'email con un link per confermare e impostare la password
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
