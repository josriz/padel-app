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
    <div className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-2 sm:px-4 relative overflow-hidden" 
         style={{ backgroundImage: "url('/images/sfondo-login.jpg')" }}>
      
      {/* Overlay ultra-trasparente responsive */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/8 to-black/25 z-0"></div>
      
      <div className="w-full max-w-sm sm:max-w-md relative z-10 px-3 sm:px-0">
        {/* HEADER LOGO - Responsive */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 sm:mb-8 p-4 sm:p-6 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
            <img 
              src="/logo.png" 
              alt="Cieffe Padel Club"
              className="w-full h-full object-contain p-1 sm:p-2"
            />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-tight">
              CIEFFE
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600 tracking-wide">
              PADEL CLUB
            </p>
          </div>
          {/* ✅ BY CLAUDIO FALBA - In basso a destra del logo */}
          <div className="absolute bottom-2 right-2 text-xs sm:text-sm font-bold text-gray-700 italic bg-white/80 px-2 py-1 rounded-full shadow-md">
            by Claudio Falba
          </div>
        </div>

        {/* BANNER - Responsive */}
        <div className="w-full h-20 sm:h-28 md:h-32 rounded-2xl overflow-hidden shadow-xl mb-6 sm:mb-8 mx-auto bg-white/90 backdrop-blur-sm">
          <img 
            src="/banner-home.jpg" 
            alt="Padel Banner Home"
            className="w-full h-full object-cover"
          />
        </div>

        {/* TITOLO - Responsive */}
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold mb-2 text-white drop-shadow-lg px-2">
          Accedi o registrati
        </h2>
        <p className="text-center text-white/90 mb-6 text-base sm:text-lg drop-shadow-md px-4">
          La tua partita inizia da qui
        </p>

        {/* BOTTONI OAUTH - Responsive */}
        <div className="flex flex-col gap-2 sm:gap-3 mb-4">
          <button onClick={() => handleOAuthLogin("apple")} 
                  className="flex items-center justify-center gap-2 w-full border border-white/30 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-3 hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-white font-medium shadow-xl text-sm sm:text-base">
            <FaApple className="text-lg" /> Continua con Apple
          </button>
          <button onClick={() => handleOAuthLogin("google")} 
                  className="flex items-center justify-center gap-2 w-full border border-white/30 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-3 hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-white font-medium shadow-xl text-sm sm:text-base">
            <FcGoogle className="text-xl sm:text-2xl" /> Continua con Google
          </button>
          <button onClick={() => handleOAuthLogin("facebook")} 
                  className="flex items-center justify-center gap-2 w-full border border-white/30 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-3 hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-white font-medium shadow-xl text-sm sm:text-base">
            <FaFacebookF className="text-lg" /> Continua con Facebook
          </button>
        </div>

        {/* SEPARATORE */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-white/30" />
          <span className="px-3 text-white/70 font-medium text-sm">o</span>
          <hr className="flex-grow border-white/30" />
        </div>

        {/* FORM - Responsive */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3 sm:gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/20 shadow-2xl">
          <input 
            type="email" 
            placeholder="Email" 
            className="border border-white/30 bg-white/20 backdrop-blur-sm rounded-xl p-3.5 sm:p-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/70 transition-all text-base" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="border border-white/30 bg-white/20 backdrop-blur-sm rounded-xl p-3.5 sm:p-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/70 transition-all text-base" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          {message && (
            <p className="text-sm text-red-300/90 p-3 bg-red-500/20 rounded-xl backdrop-blur-sm border border-red-400/50">
              {message}
            </p>
          )}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3.5 sm:p-4 rounded-xl font-bold text-base sm:text-lg hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98] border-2 border-white/20 backdrop-blur-sm"
          >
            {loading ? "Caricamento..." : "Accedi"}
          </button>
        </form>

        {/* LINKS */}
        <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 text-sm gap-2 sm:gap-0">
          <button onClick={handleRegister} className="text-white/90 hover:text-white hover:underline transition text-center sm:text-left">
            Registrati
          </button>
          <button onClick={handleResetPassword} className="text-white/90 hover:text-white hover:underline transition text-center sm:text-right">
            Password dimenticata?
          </button>
        </div>

        {/* FOOTER */}
        <p className="text-xs text-white/70 mt-8 text-center backdrop-blur-sm px-2">
          Registrandoti accetti le nostre{" "}
          <span className="text-white underline hover:text-emerald-300 transition">condizioni di uso</span>{" "}
          e la{" "}
          <span className="text-white underline hover:text-emerald-300 transition">politica sulla privacy</span>
        </p>
        <p className="text-xs italic text-emerald-300/90 text-center mt-2 font-medium">@Josè Rizzi</p>
      </div>
    </div>
  );
}
