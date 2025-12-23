// src/components/LoginPage.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) setMessage(error.message);
    setLoading(false);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setMessage(error.message);
    if (data?.user) navigate("/dashboard");
    setLoading(false);
  };

  const handleRegister = async () => {
    navigate("/register");
  };

  const handleResetPassword = async () => {
    if (!email) return setMessage("Inserisci la tua email per reimpostare la password");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) setMessage(error.message);
    else setMessage("Email di reset inviata!");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-slate-50/95 via-blue-50/90 to-indigo-50/85 px-4">
      <div className="w-full max-w-md">
        {/* ✅ HEADER: LOGO SINISTRA + CIEFFE PADEL CLUB */}
        <div className="flex items-center gap-4 mb-8 p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
          <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
            <img 
              src="/logo.png" 
              alt="Cieffe Padel Club"
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-tight">
              CIEFFE
            </h1>
            <p className="text-xl md:text-2xl font-bold text-emerald-600 tracking-wide">
              PADEL CLUB
            </p>
          </div>
        </div>

        <div className="w-full max-w-2xl h-28 md:h-32 rounded-2xl overflow-hidden shadow-lg mb-8 mx-auto">
          <img 
            src="/banner-home.jpg" 
            alt="Padel Banner Home"
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-center text-3xl font-extrabold mb-2 text-gray-900">Accedi o registrati</h2>
        <p className="text-center text-gray-500 mb-6">La tua partita inizia da qui</p>

        <div className="flex flex-col gap-3 mb-4">
          <button onClick={() => handleOAuthLogin("apple")} className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition">
            <FaApple /> Continua con Apple
          </button>
          <button onClick={() => handleOAuthLogin("google")} className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition">
            <FcGoogle /> Continua con Google
          </button>
          <button onClick={() => handleOAuthLogin("facebook")} className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition">
            <FaFacebookF className="text-blue-600" /> Continua con Facebook
          </button>
        </div>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-gray-400">o</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <input type="email" placeholder="Email" className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {message && <p className="text-sm text-red-500">{message}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            {loading ? "Caricamento..." : "Accedi"}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-sm">
          <button onClick={handleRegister} className="text-blue-600 hover:underline">Registrati</button>
          <button onClick={handleResetPassword} className="text-blue-600 hover:underline">Password dimenticata?</button>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Registrandoti accetti le nostre <span className="text-blue-600 underline">condizioni di uso</span> e la <span className="text-blue-600 underline">politica sulla privacy</span>
        </p>
        <p className="text-xs italic text-center mt-1">@Josè Rizzi</p>
      </div>
    </div>
  );
}
