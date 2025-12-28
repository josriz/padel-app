// src/context/AuthProvider.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Assicurati che questo percorso sia corretto

const AuthContext = createContext();

/**
 * Hook personalizzato per accedere facilmente al contesto di autenticazione.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
};

/**
 * Provider del contesto di autenticazione che gestisce lo stato e la sessione Supabase.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Funzione di logout
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Errore durante il logout:', error.message);
    } finally {
      // Aggiorna lo stato locale indipendentemente dal successo di signOut (gestito da onAuthStateChange)
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Funzione per inizializzare la sessione al caricamento del componente
    const initSession = async () => {
      try {
        // Tenta di recuperare la sessione esistente (utile al primo caricamento)
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error('Errore sessione iniziale:', error.message);
        
        const sessionUser = data?.session?.user || null;
        setUser(sessionUser);
        // Logica Admin: sostituire con un controllo più sicuro se necessario
        setIsAdmin(sessionUser?.email === 'gioserizzi@gmail.com');
      } catch (err) {
        console.error('Errore nella fase di inizializzazione Auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Sottoscrizione ai cambiamenti di stato dell'autenticazione (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null;
      setUser(sessionUser);
      setIsAdmin(sessionUser?.email === 'gioserizzi@gmail.com');
      setLoading(false);
    });

    // Cleanup della sottoscrizione quando il componente viene smontato
    return () => subscription.unsubscribe();
  }, []); // Dipendenza vuota: esegue solo al mount

  return (
    <AuthContext.Provider value={{ user, setUser, isAdmin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
