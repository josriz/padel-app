// src/components/LoginPages.jsx - ✅ PULISCI CAMPi + NO AUTO-MESSAGGIO + FIX FACEBOOK
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { LogIn, UserPlus, Loader2, AlertCircle, CheckCircle, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../supabaseClient';

const LoginPages = () => {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ type: null, text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage({ type: null, text: '' }), 5000);
  };

  useEffect(() => {
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  // ✅ PULISCI CAMPI DOPO LOGOUT
  useEffect(() => {
    if (!user) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setIsSignUp(false);
      setMessage({ type: null, text: '' });
    }
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setMessage({ type: null, text: '' });

    try {
      await signIn(email, password);
      showMessage('success', `✅ Accesso riuscito ${email}`);
      navigate('/dashboard');
    } catch (err) {
      showMessage('error', err.message || 'Errore autenticazione');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    if (loading) return;
    setLoading(true);
    try {
      // 🔹 FIX FACEBOOK + Google OAuth
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin, // assicura che torni al localhost
        },
      });
    } catch (err) {
      showMessage('error', `OAuth ${provider} fallito`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (loading || !email) return;
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      showMessage('success', '📧 Email reset inviata');
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setMessage({ type: null, text: '' });
  };

  const isInputValid = email.length > 0 && password.length >= 6;
  const SubmitIcon = isSignUp ? UserPlus : LogIn;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 px-4">
      <div className="bg-white p-6 max-w-md w-full shadow-2xl rounded-3xl">
        <div className="text-center mb-8 pt-8">
          <img src="/logo.png" alt="CIEFFE Padel" className="mx-auto w-32 h-32 shadow-xl rounded-2xl mb-6 hover:scale-105 transition-all" />
          <p className="text-sm font-bold italic text-gray-900 tracking-wide mb-4">
            <span className="not-italic font-semibold text-gray-800 mr-1">by</span>
            Claudio Falba
          </p>
          <div className="w-full h-20 rounded-2xl overflow-hidden shadow-lg mb-6 bg-gray-200 mx-auto max-w-xs">
            <img src="/banner-home.jpg" alt="Banner" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">CIEFFE Padel</h1>
          <p className="text-sm text-gray-600 font-medium">Gestisci tornei PADEL 2vs2</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <LogIn className="w-4 h-4 text-emerald-600" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="giose.rizzi@gmail.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-sm"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="!Share1968"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-sm"
                minLength="6"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-all"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end text-sm mb-4">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 hover:underline transition-all disabled:opacity-50"
              disabled={loading}
            >
              <Key className="w-4 h-4" /> Reset Password
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !isInputValid}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm shadow-lg transition-all ${
              isInputValid && !loading
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Elaborazione...
              </>
            ) : (
              <>
                <SubmitIcon className="w-5 h-5" /> {isSignUp ? 'Crea Account' : 'Accedi'}
              </>
            )}
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-200" />
          <span className="mx-3 text-xs text-gray-400 font-medium">oppure</span>
          <hr className="flex-grow border-gray-200" />
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="flex items-center justify-center w-full py-3 px-4 rounded-2xl border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md transition-all text-sm font-semibold text-gray-700 disabled:opacity-50"
          >
            <FcGoogle className="w-5 h-5 mr-3" /> Accedi con Google
          </button>
          <button
            onClick={() => handleOAuthLogin('facebook')}
            disabled={loading}
            className="flex items-center justify-center w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all text-sm disabled:opacity-50"
          >
            <FaFacebook className="w-5 h-5 mr-3" /> Accedi con Facebook
          </button>
        </div>

        {message.type && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 shadow-lg border-4 text-sm font-medium ${
            message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={toggleMode}
            className="text-gray-700 hover:text-emerald-600 font-semibold text-sm hover:underline transition-all"
          >
            {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500 space-y-1">
          <p className="text-sm leading-relaxed">
            Registrandoti accetti le nostre{' '}
            <span className="font-semibold text-emerald-600 hover:underline cursor-pointer">Condizioni</span>{' '}
            e la <span className="font-semibold text-emerald-600 hover:underline cursor-pointer">Privacy</span>
          </p>
          <p className="font-bold italic text-gray-900 text-sm tracking-wide">@ Josè Rizzi</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPages;
