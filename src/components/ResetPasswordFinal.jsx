// src/components/ResetPasswordFinal.jsx - CORRETTO
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordFinal() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();  // ✅ AGGIUNTO
    setMessage("");
    
    if (!email) {
      setMessage("Inserisci la tua email");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`  // ✅ URL COMPLETO
    });

    setLoading(false);

    if (error) {
      setMessage(`❌ ${error.message}`);
      setSent(false);
    } else {
      setSent(true);
      setMessage("✅ Email inviata! Controlla la tua casella.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-500 p-4 relative overflow-hidden">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 lg:p-12 max-w-md w-full text-center relative z-10 border border-white/50">
        
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mx-auto mb-6 shadow-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-2">Recupera Password</h2>
          <p className="text-xl text-gray-600 font-medium">Inserisci email per il link di reset</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="La tua email"
            disabled={loading}
            className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl"
            required
          />

          {message && (
            <div className={`p-4 rounded-2xl text-left font-semibold ${
              sent 
                ? "bg-emerald-50 border-2 border-emerald-200 text-emerald-700 animate-pulse" 
                : "bg-red-50 border-2 border-red-200 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-red-500 via-red-600 to-orange-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 hover:from-red-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Invio...
              </span>
            ) : (
              "Invia Link Reset 🔑"
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

        <p className="mt-6 text-sm text-gray-500">
          Riceverai un'email con link per impostare nuova password
        </p>
      </div>
    </div>
  );
}
