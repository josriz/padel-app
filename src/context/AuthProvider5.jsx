import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Se l'URL contiene PKCE OAuth code
        if (window.location.search.includes("code=")) {
          const { data, error } = await supabase.auth.exchangeCodeForSession();
          if (error && error.message !== "No code in URL") {
            console.error("Errore OAuth:", error.message);
          }
          if (data?.session) {
            setUser(data.session.user);
            setRole(data.session.user.user_metadata?.role || null);
          }
        } else {
          // Carica sessione corrente
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            setRole(session.user.user_metadata?.role || null);
          }
        }
      } catch (err) {
        console.error("Errore generico AuthProvider:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listener per cambiamenti di sessione
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || null);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    // Cleanup sicuro
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  const value = { user, role, loading, setUser, setRole };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
