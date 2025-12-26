// src/context/AuthProvider.jsx - ✅ CORRETTO: FIX SUPABASE + EXPORT SICURO
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funzione helper per impostare ruolo in base all’email
  const determineRole = (sessionUser) => {
    if (!sessionUser) return null;
    if (sessionUser.email === "giose.rizzi@gmail.com") return "admin";
    return "user";
  };

  useEffect(() => {
    let isMounted = true; // sicurezza per cleanup async

    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth getSession error:", error);
        }
        if (!isMounted) return;

        setUser(session?.user ?? null);
        setRole(determineRole(session?.user));
      } catch (err) {
        console.error("getSession failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setRole(determineRole(session?.user));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = { user, role, loading, setUser, setRole };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Esportazione del Context per App.jsx (compatibile con struttura esistente)
AuthProvider.AuthContext = AuthContext;

// ✅ Esportazione del hook (per altri componenti)
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato dentro AuthProvider");
  }
  return context;
}
