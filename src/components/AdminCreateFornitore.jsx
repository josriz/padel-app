// src/components/AdminCreateFornitore.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminCreateFornitore() {
  const [form, setForm] = useState({ nome: "", cognome: "", email: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: form.email,
        password: Math.random().toString(36).slice(-8), // password temporanea
        user_metadata: {
          nome: form.nome,
          cognome: form.cognome,
          role: "fornitore"
        },
        email_confirm: true
      });

      if (error) throw error;

      setMessage(`Fornitore creato con successo. Mail inviata a ${form.email}`);
      setForm({ nome: "", cognome: "", email: "" });
    } catch (err) {
      console.error(err);
      setMessage("Errore nella creazione del fornitore: " + err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center">Crea nuovo Fornitore</h2>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cognome</label>
          <input
            type="text"
            name="cognome"
            value={form.cognome}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Crea Fornitore
        </button>

        {message && <p className="mt-2 text-center text-sm">{message}</p>}
      </form>
    </div>
  );
}
