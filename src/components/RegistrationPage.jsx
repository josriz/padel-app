import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Assicurati che supabaseClient sia configurato correttamente

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Aggiorna i campi del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Invia i dati al backend Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.nome || !formData.email || !formData.password) {
      setError("Tutti i campi sono obbligatori");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { nome: formData.nome }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Registrazione completata! Controlla la tua email per confermare.");
        // Dopo 3 secondi torna al login
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (err) {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-blue-400 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Registrazione</h1>
        <p className="mb-8 text-gray-600">Compila i dati per registrarti</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full p-4 rounded-xl border border-gray-300"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 rounded-xl border border-gray-300"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-4 rounded-xl border border-gray-300"
          />

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-semibold"
          >
            {loading ? "Registrazione..." : "Registrati"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
        >
          Torna al Login
        </button>
      </div>
    </div>
  );
}
