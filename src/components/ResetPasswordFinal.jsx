// src/components/ResetPasswordFinal.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordFinal() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!email) {
      setMessage("Inserisci la tua email per ricevere il link di reset");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/update-password"
    });

    if (error) {
      setMessage(error.message);
      setSent(false);
    } else {
      setSent(true);
      setMessage("Email per il reset inviata! Controlla la tua casella.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-200 to-blue-400 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <p className="mb-6 text-gray-700">
          Inserisci la tua email per ricevere il link di reset
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-4 rounded-xl border border-gray-300 mb-4"
        />
        <button
          onClick={handleReset}
          className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-semibold mb-3"
        >
          Invia richiesta
        </button>

        {message && <p className={`text-sm ${sent ? "text-green-600" : "text-red-600"} mb-3`}>{message}</p>}

        <button
          onClick={() => navigate("/")}
          className="w-full py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
        >
          Torna al Login
        </button>
      </div>
    </div>
  );
}
