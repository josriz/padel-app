// src/components/LoginPages.jsx - ✅ LAYOUT PULITO + SUPABASE LOGIN
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { LogIn, UserPlus, Loader, AlertTriangle, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthProvider';

const LoginPages = () => {
  const { isAdmin } = useAuth(); 
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const [email, setEmail] = useState('giose.rizzi@gmail.com');
  const [password, setPassword] = useState('padel123');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ type: null, text: '' });
  const [showBackButton, setShowBackButton] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage({ type: null, text: '' }), 7000);
  };

  useEffect(() => {
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (window.history.length > 2) setShowBackButton(true);
  }, []);

  const goBack = () => window.history.back();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let data, error;
      if (isSignUp) {
        ({ data, error } = await supabase.auth.signUp({ email, password }));
      } else {
        ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
      }

      if (error) throw error;

      showMessage('success', `✅ Accesso riuscito: ${email}`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('❌ LOGIN ERROR', err);
      showMessage('error', err.message || 'Errore login');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
      showMessage('success', `OAuth ${provider} avviato`);
    } catch (err) {
      console.error('❌ OAuth ERROR', err);
      showMessage('error', err.message || `OAuth ${provider} fallito`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setMessage({ type: null, text: '' });
  };

  const isInputValid = email.length > 0 && password.length >= 6;
  const SubmitIcon = isSignUp ? UserPlus : LogIn;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white p-10 rounded-3xl max-w-md w-full shadow-sm border border-gray-200 relative">
        {showBackButton && (
          <button onClick={goBack} className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Indietro">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="flex flex-col items-center mb-8 pt-16">
          <img src="/logo.jpg" alt="Logo Padel Club" className="max-w-[120px] mb-4" />
          <p className="italic text-sm text-gray-500 mb-2">by Claudio Falba</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Registrati' : 'Accedi a Padel Tracker'}
          </h1>
          <p className="text-sm text-gray-600">{isSignUp ? 'Crea il tuo account' : 'Gestisci tornei PADEL 2vs2'}</p>

          {isAdmin && (
            <div className="mt-4 px-4 py-2 bg-gray-100 text-gray-800 text-sm rounded-2xl font-bold shadow-sm">
              🚀 ADMIN PADEL MODE ATTIVO
            </div>
          )}
        </div>

        <form onSubmit={handleAuth} className="space-y-6 mb-8">
          <div>
            <label htmlFor="email" className="block mb-3 text-sm font-semibold text-gray-700">Email</label>
            <input 
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="giose.rizzi@gmail.com"
              className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-3 text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimo 6 caratteri"
              className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-300 shadow-sm"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !isInputValid}
            className={`w-full flex justify-center items-center py-4 px-6 rounded-2xl font-bold text-lg shadow-sm transition-all duration-300 transform ${
              isInputValid && !loading
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin mr-3" />
                Elaborazione...
              </>
            ) : (
              <>
                <SubmitIcon className="w-6 h-6 mr-3" />
                {isSignUp ? 'Crea Account' : 'Accedi al Dashboard'}
              </>
            )}
          </button>
        </form>

        <div className="flex items-center mb-8">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-sm text-gray-400 font-medium">oppure</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="space-y-3 mb-8">
          <button 
            onClick={() => handleOAuthLogin('google')} 
            disabled={loading} 
            className="flex items-center justify-center w-full py-4 px-6 rounded-2xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm transition-all duration-300 font-medium"
          >
            <FcGoogle size={24} className="mr-4" /> Accedi con Google
          </button>
          <button 
            onClick={() => handleOAuthLogin('facebook')} 
            disabled={loading} 
            className="flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-[#1877F2] text-white hover:bg-[#166FE5] hover:shadow-sm transition-all duration-300 font-medium"
          >
            <FaFacebook size={24} className="mr-4" /> Accedi con Facebook
          </button>
        </div>

        {message.type && (
          <div className={`mb-8 p-5 rounded-2xl text-sm flex items-center shadow-sm border ${message.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200 animate-pulse' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
            <AlertTriangle className="w-6 h-6 mr-4 flex-shrink-0" />
            {message.text}
          </div>
        )}

        <div className="text-center border-t border-gray-200 pt-6">
          <button 
            onClick={toggleMode} 
            className="text-gray-900 hover:text-gray-700 font-semibold text-sm hover:underline transition-colors"
          >
            {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Privacy Policy conforme GDPR</p>
          <p className="text-sm font-semibold text-gray-800 italic">
            © 2025 Josè Rizzi - Padel Tracker 2vs2
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPages;
