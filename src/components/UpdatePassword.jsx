// src/components/UpdatePassword.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpdate = async () => {
    if (!password || !confirm) {
      setMessage("Compila tutti i campi");
      return;
    }
    if (password !== confirm) {
      setMessage("Le password non coincidono");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password aggiornata con successo!");
      setTimeout(() => navigate("/"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-200 to-blue-400 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Aggiorna Password</h2>
        <p className="mb-6 text-gray-700">
          Inserisci la nuova password
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nuova password"
          className="w-full p-4 rounded-xl border border-gray-300 mb-4"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Conferma password"
          className="w-full p-4 rounded-xl border border-gray-300 mb-4"
        />

        <button
          onClick={handleUpdate}
          className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-semibold mb-3"
        >
          Aggiorna Password
        </button>

        {message && <p className={`text-sm ${message.includes("successo") ? "text-green-600" : "text-red-600"} mb-3`}>{message}</p>}

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
