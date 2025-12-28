// src/components/Auth.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { AlertTriangle, Loader, LogIn, UserPlus } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useAuth } from "../context/AuthProvider";

const Auth = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ type: null, text: "" });
  const [formLoading, setFormLoading] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: "" }), 7000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ type: null, text: "" });

    try {
      let data, error;

      if (isSignUp) {
        const signUpRes = await supabase.auth.signUp({ email, password });
        data = signUpRes.data;
        error = signUpRes.error;

        if (!error && data.user)
          showMessage("success", "Registrazione completata! Controlla la tua email.");
        else if (!error && data.session === null)
          showMessage("warning", "Controlla la tua email per confermare l'account.");
      } else {
        const signInRes = await supabase.auth.signInWithPassword({ email, password });
        data = signInRes.data;
        error = signInRes.error;

        if (!error && data.user) {
          showMessage("success", "Accesso riuscito!");
          return;
        }
      }

      if (error) {
        let errorMessage = "Errore sconosciuto.";
        if (error.message.includes("Invalid login credentials")) errorMessage = "Email o Password errate.";
        else if (error.message.includes("User already registered")) errorMessage = "Email già registrata.";
        else if (error.message.includes("Email not confirmed")) errorMessage = "Email non confermata.";
        showMessage("error", errorMessage);
      }
    } catch (err) {
      showMessage("error", `Errore di rete: ${err.message || "Controlla la connessione"}`);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setMessage({ type: null, text: "" });
    setEmail("");
    setPassword("");
  };

  const isInputValid = email.length > 0 && password.length >= 6;
  const SubmitIcon = isSignUp ? UserPlus : LogIn;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl max-w-md w-full shadow-md">
        {/* LOGO + By Claudio Falba */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.jpg" alt="Logo Padel Club" className="h-16 mb-2" />
          <p className="italic text-sm text-gray-400 mb-4">by Claudio Falba</p>
          <h1 className="text-2xl font-bold text-indigo-700 mb-1 text-center">
            {isSignUp ? "Crea il tuo Account" : "Accedi a Padel Tracker"}
          </h1>
        </div>

        {/* FORM */}
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={formLoading || !isInputValid}
            className={`w-full py-2 rounded font-bold ${
              isInputValid && !formLoading ? "bg-indigo-600 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {formLoading ? <Loader className="w-5 h-5 animate-spin mr-2 inline-block" /> : <SubmitIcon className="w-5 h-5 mr-2 inline-block" />}
            {formLoading ? "Elaborazione..." : isSignUp ? "Registra Account" : "Accedi"}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-4 text-center">
          <button onClick={toggleMode} className="text-indigo-600 hover:underline text-sm">
            {isSignUp ? "Hai già un account? Accedi" : "Non hai un account? Registrati"}
          </button>
        </div>

        {/* Social Buttons */}
        <div className="mt-4 flex justify-center gap-4">
          <button className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-100">
            <FcGoogle className="w-5 h-5" /> Google
          </button>
          <button className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-100">
            <FaFacebook className="w-5 h-5 text-blue-600" /> Facebook
          </button>
        </div>

        {/* Messaggi */}
        {message.type && (
          <div className={`mt-4 p-2 rounded text-sm ${
            message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}>
            <AlertTriangle className="inline-block w-5 h-5 mr-2" />
            {message.text}
          </div>
        )}

        {/* FOOTER */}
        <p className="mt-6 text-center text-gray-400 text-sm">Josè Rizzi</p>
      </div>
    </div>
  );
};

export default Auth;
