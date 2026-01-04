import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Errore fetch profilo:', err);
      return null;
    }
  }, []);

  const updateUser = useCallback(async (rawUser) => {
    if (!rawUser) {
      setUser(null);
      return;
    }
    const profile = await fetchUserProfile(rawUser.id);
    setUser({ ...rawUser, profile });
  }, [fetchUserProfile]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await updateUser(session?.user ?? null);
      } catch (err) {
        console.error('Errore getSession:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getSession();

    const { subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await updateUser(session?.user ?? null);
      setLoading(false);
    });

    // ✅ FIX SOLO QUESTA RIGA 57
    return () => { if (subscription) subscription.unsubscribe(); };
  }, [updateUser]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await updateUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Errore login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      await updateUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Errore registrazione');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      setError(err.message || 'Errore logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const oauthLogin = async (provider) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Errore OAuth');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signUp,
        logout,
        oauthLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
