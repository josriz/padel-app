import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function CreateFornitore() {
  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.functions.invoke(
      "create-fornitore",
      {
        body: form,
      }
    );

    setLoading(false);

    if (error) {
      setMessage("Errore: " + error.message);
    } else {
      setMessage("Fornitore creato e mail inviata");
      setForm({ nome: "", cognome: "", email: "" });
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Crea Fornitore
      </h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4"
      >
        <input
          name="nome"
          placeholder="Nome"
          value={form.nome}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          name="cognome"
          placeholder="Cognome"
          value={form.cognome}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Creazione..." : "Crea Fornitore"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center font-medium">
          {message}
        </p>
      )}
    </div>
  );
}

