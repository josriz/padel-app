// src/components/LoginPage.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Mail, Facebook, Apple, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setSubmitting(false);
  };

  const handleOAuthLogin = async (provider) => {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Inserisci la tua email per il reset");
      return;
    }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) setError(error.message);
    else alert("Email di reset inviata!");
    setResetting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center p-12 rounded-3xl shadow-lg">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900">PadelClub</h1>
        <p className="text-gray-500 mb-8">Accedi con il tuo account</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* EMAIL + PASSWORD */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            <span>Accedi</span>
          </button>
        </form>

        {/* LINK RESET PASSWORD E REGISTRAZIONE */}
        <div className="flex justify-between mb-6 text-sm">
          <button
            type="button"
            onClick={handleResetPassword}
            className="text-blue-600 hover:underline"
            disabled={resetting}
          >
            {resetting ? "Invio..." : "Hai dimenticato la password?"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline"
          >
            Registrati
          </button>
        </div>

        <p className="text-gray-400 mb-4">Oppure accedi con</p>

        {/* BUTTONS OAUTH */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => handleOAuthLogin("google")}
            className="flex items-center space-x-2 border border-gray-300 rounded-xl px-4 py-2 hover:shadow-md transition-all"
          >
            <Mail className="w-5 h-5 text-red-500" />
            <span>Google</span>
          </button>
          <button
            onClick={() => handleOAuthLogin("facebook")}
            className="flex items-center space-x-2 border border-gray-300 rounded-xl px-4 py-2 hover:shadow-md transition-all"
          >
            <Facebook className="w-5 h-5 text-blue-600" />
            <span>Facebook</span>
          </button>
          <button
            onClick={() => handleOAuthLogin("apple")}
            className="flex items-center space-x-2 border border-gray-300 rounded-xl px-4 py-2 hover:shadow-md transition-all"
          >
            <Apple className="w-5 h-5" />
            <span>Apple</span>
          </button>
        </div>

        {/* PRIVACY */}
        <p className="text-gray-400 text-xs mb-2">
          Accedendo accetti la nostra politica sulla privacy e termini di servizio completi.
        </p>
        <p className="text-gray-400 text-xs italic">@Josè Rizzi</p>
      </div>
    </div>
  );
}
