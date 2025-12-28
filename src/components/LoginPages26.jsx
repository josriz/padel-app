// src/components/LoginPage.jsx - CAROUSEL 5 FOTO FUNZIONANTE
import React, { useState, useEffect } from "react"; // ✅ useEffect AGGIUNTO
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
  
  // ✅ STATE CAROUSEL
  const [carouselIndex, setCarouselIndex] = useState(0);
  const foto = ['mia-foto1.jpg', 'mia-foto2.jpg', 'mia-foto3.jpg', 'mia-foto4.jpg', 'mia-foto5.jpg'];

  // ✅ AUTO-SCROLL OGNI 3 SECONDI
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % foto.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [foto.length]);

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
        {/* BANNER 1 - LOGO + PALLINE GIALLE */}
        <div className="relative w-full h-28 sm:h-32 md:h-36 rounded-2xl overflow-hidden shadow-xl mb-6 sm:mb-8 mx-auto bg-cover bg-center bg-no-repeat" 
             style={{ backgroundImage: "url('/images/sfondo-banner-logo.jpg')" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/30 backdrop-blur-sm"></div>
          <div className="relative z-10 flex items-center gap-4 pl-4 sm:pl-6 pr-4 pb-4 pt-2 sm:pt-4 h-full">
            <div className="w-20 h-20 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border-3 sm:border-2 border-white/80 bg-white/95">
              <img src="/logo.jpg" alt="Cieffe Padel Club" className="w-full h-full object-contain p-1.5 sm:p-1"/>
            </div>
            <div className="text-white drop-shadow-2xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">CIEFFE</h1>
              <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide -mt-1">PADEL CLUB</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-3 text-xs sm:text-sm font-bold text-white/95 italic bg-black/60 px-2 py-1 rounded-full shadow-lg">
            by Claudio Falba
          </div>
        </div>

        {/* ✅ CAROUSEL 5 FOTO FUNZIONANTE */}
        <div className="relative w-full h-24 sm:h-32 md:h-36 rounded-2xl overflow-hidden shadow-xl mb-6 sm:mb-8 mx-auto">
          <div className="absolute inset-0 w-full h-full flex transition-transform duration-700 ease-in-out"
               style={{ transform: `translateX(-${carouselIndex * 100}%)` }}>
            {foto.map((fotoNome, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 bg-cover bg-center bg-no-repeat"
                   style={{ backgroundImage: `url('/images/${fotoNome}')` }} />
            ))}
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40"></div>
          
          {/* Indicatori cliccabili */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {foto.map((_, index) => (
              <button key={index}
                      onClick={() => setCarouselIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === carouselIndex 
                          ? 'bg-white scale-125 shadow-lg' 
                          : 'bg-white/50 hover:bg-white hover:scale-110'
                      }`} />
            ))}
          </div>
        </div>

        {/* TITOLO */}
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold mb-2 text-white drop-shadow-lg px-2">
          Accedi o registrati
        </h2>
        <p className="text-center text-white/90 mb-6 text-base sm:text-lg drop-shadow-md px-4">
          La tua partita inizia da qui
        </p>

        {/* FORM */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3 sm:gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/20 shadow-2xl mb-4">
          <input type="email" placeholder="Email" className="border border-white/30 bg-white/20 backdrop-blur-sm rounded-xl p-3.5 sm:p-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/70 transition-all text-base" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="border border-white/30 bg-white/20 backdrop-blur-sm rounded-xl p-3.5 sm:p-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/70 transition-all text-base" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {message && <p className="text-sm text-red-300/90 p-3 bg-red-500/20 rounded-xl backdrop-blur-sm border border-red-400/50">{message}</p>}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3.5 sm:p-4 rounded-xl font-bold text-base sm:text-lg hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98] border-2 border-white/20 backdrop-blur-sm">
            {loading ? "Caricamento..." : "Accedi"}
          </button>
        </form>

        {/* SEPARATORE */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-white/30" />
          <span className="px-3 text-white/70 font-medium text-sm">o</span>
          <hr className="flex-grow border-white/30" />
        </div>

        {/* SOCIAL */}
        <div className="flex flex-col gap-2 sm:gap-3 mb-6">
          <button onClick={() => handleOAuthLogin("apple")} className="flex items-center justify-center gap-2 w-full border border-white/30 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-3 hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-white font-medium shadow-xl text-sm sm:text-base">
            <FaApple className="text-lg" /> Continua con Apple
          </button>
          <button onClick={() => handleOAuthLogin("google")} className="flex items-center justify-center gap-2 w-full border border-white/30 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-3 hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-white font-medium shadow-xl text-sm sm:text-base">
            <FcGoogle className="text-xl sm:text-2xl" /> Continua con Google
          </button>
          <button onClick={() => handleOAuthLogin("facebook")} className="flex items-center justify-center gap-2 w-full border border-white/30 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-3 hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-white font-medium shadow-xl text-sm sm:text-base">
            <FaFacebookF className="text-lg" /> Continua con Facebook
          </button>
        </div>

        {/* LINKS */}
        <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 text-sm gap-2 sm:gap-0">
          <button onClick={handleRegister} className="text-white/90 hover:text-white hover:underline transition text-center sm:text-left">Registrati</button>
          <button onClick={handleResetPassword} className="text-white/90 hover:text-white hover:underline transition text-center sm:text-right">Password dimenticata?</button>
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
