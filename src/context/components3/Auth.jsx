import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AlertTriangle, Loader, LogIn, UserPlus } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { setUser } = useAuth(); 
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ type: null, text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 7000);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.hash.includes('access_token') || url.hash.includes('refresh_token')) {
      const handleOAuthRedirect = async () => {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();
          const fullUser = { ...data.session.user, role: profileData?.role || 'user' };
          setUser(fullUser);
          navigate(fullUser.role === 'admin' ? '/admin' : '/user');
        }
      };
      handleOAuthRedirect();
    }
  }, [navigate, setUser]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: null, text: '' });

    try {
      let data = null;
      let error = null;

      if (isSignUp) {
        const signUpRes = await supabase.auth.signUp({ email, password });
        data = signUpRes.data;
        error = signUpRes.error;
        if (!error && data.user) showMessage('success', "Registrazione completata! Controlla la tua email.");
        else if (!error && data.session === null) showMessage('warning', "Controlla la tua email per confermare l'account.");
      } else {
        const signInRes = await supabase.auth.signInWithPassword({ email, password });
        error = signInRes.error;
        data = signInRes.data;

        if (!error && data?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          const fullUser = { ...data.user, role: profileData?.role || 'user' };
          setUser(fullUser);
          showMessage('success', "Accesso riuscito!");
          navigate(fullUser.role === 'admin' ? '/admin' : '/user');
          return;
        } else if (!data?.user && !error) {
          showMessage('warning', "Email non confermata o problema di accesso.");
        }
      }

      if (error) {
        let errorMessage = "Errore sconosciuto.";
        if (error.message.includes('Invalid login credentials')) errorMessage = "Credenziali non valide.";
        else if (error.message.includes('User already registered')) errorMessage = "Email già registrata.";
        else if (error.message.includes('Email not confirmed')) errorMessage = "Email non confermata.";
        else errorMessage = `Errore DB: ${error.message}`;
        showMessage('error', errorMessage);
      }
    } catch (err) {
      showMessage('error', `Errore di connessione: ${err.message || 'Verifica la tua rete.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setMessage({ type: null, text: '' });
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) showMessage('error', `Errore accesso con ${provider}: ${error.message}`);
    } catch {
      showMessage('error', `Errore di rete durante l'accesso social.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setMessage({ type: null, text: '' });
    setEmail('');
    setPassword('');
  };

  const isInputValid = email.length > 0 && password.length >= 6;
  const SubmitIcon = isSignUp ? UserPlus : LogIn;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-3xl max-w-md w-full shadow-md">
        <div className="flex flex-col items-center mb-1">
          <img src="/logo.jpg" alt="Logo Padel Club" className="max-w-[120px] mb-2" />
          <p className="italic text-sm text-gray-400 mb-6">by Claudio Falba</p>
          <h1 className="text-3xl font-bold text-indigo-700 mb-1">Accedi a Padel Tracker</h1>
          <p className="text-sm text-gray-500 mb-6">{isSignUp ? 'Crea il tuo Account' : 'Continua con le tue credenziali'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 mb-6">
          <div>
            <label htmlFor="email" className="block mb-2 font-semibold text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              placeholder="utente@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 font-semibold text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Minimo 6 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !isInputValid}
            className={`w-full flex justify-center items-center py-3 rounded-lg font-bold transition ${
              isInputValid && !loading ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {loading ? <Loader className="w-5 h-5 animate-spin mr-3" /> : <SubmitIcon className="w-5 h-5 mr-3" />}
            {loading ? 'Elaborazione...' : (isSignUp ? 'Registra Account' : 'Accedi')}
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-400 lowercase">o</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <div className="space-y-4 mb-6">
          <button onClick={() => handleOAuthLogin("google")} disabled={loading} className="flex items-center justify-center w-full py-3 rounded-lg border border-gray-300 hover:bg-indigo-50 transition">
            <FcGoogle size={24} className="mr-3" />
            Accedi con Google
          </button>
          <button onClick={() => handleOAuthLogin("facebook")} disabled={loading} className="flex items-center justify-center w-full py-3 rounded-lg bg-[#3b5998] text-white hover:bg-[#344e86] transition">
            <FaFacebook size={24} className="mr-3" />
            Accedi con Facebook
          </button>
        </div>

        {message.type && (
          <div className={`mb-6 px-4 py-3 rounded text-sm ${
            message.type === 'error' ? 'bg-red-100 text-red-700' :
            message.type === 'success' ? 'bg-green-100 text-green-700' :
            'bg-yellow-100 text-yellow-700'
          } flex items-center`}>
            <AlertTriangle className="w-5 h-5 mr-2" />
            {message.text}
          </div>
        )}

        <div className="mt-6 text-center border-t border-gray-200 pt-5">
          <button onClick={toggleMode} className="text-indigo-600 hover:underline font-semibold text-sm">
            {isSignUp ? 'Hai già un account? Accedi ora' : 'Non hai un account? Registrati qui'}
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          Privacy &amp; Policy - Tutti i dati vengono trattati nel rispetto della normativa vigente.
        </div>
        <div className="mt-1 text-center italic text-xs text-gray-400">
          ©by Josè Rizzi
        </div>
      </div>
    </div>
  );
};

export default Auth;
