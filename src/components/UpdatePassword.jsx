// src/components/UpdatePassword.jsx - FUNZIONA + LOGIN OK
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setMessage("❌ Password minima 6 caratteri");
      return;
    }

    setLoading(true);
    setMessage("Salvataggio...");

    try {
      // ✅ UPDATE PASSWORD
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        // ✅ SIGNOUT per pulire cache
        await supabase.auth.signOut();
        setMessage("✅ Password salvata! Effettua login.");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      setMessage("❌ Errore. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-500 p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 lg:p-12 max-w-md w-full text-center border border-white/50">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl mx-auto mb-6 shadow-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-2">Nuova Password</h2>
          <p className="text-xl text-gray-600">Imposta la tua nuova password:</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nuova password (min 6 caratteri)"
            disabled={loading}
            className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-lg font-semibold bg-white/80 shadow-xl"
            required
          />

          {message && (
            <div className={`p-4 rounded-2xl text-left font-semibold ${
              message.includes("✅") 
                ? "bg-emerald-50 border-2 border-emerald-200 text-emerald-700 animate-pulse" 
                : "bg-red-50 border-2 border-red-200 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salva...
              </div>
            ) : (
              "Salva Nuova Password 🔐"
            )}
          </button>
        </form>

        <div className="mt-8 space-y-3 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/reset-password")}
            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-semibold hover:bg-orange-600 transition-all duration-300"
          >
            🔄 Nuovo Reset Password
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-gray-200 text-gray-800 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300"
          >
            ← Torna al Login
          </button>
        </div>
      </div>
    </div>
  );
}
