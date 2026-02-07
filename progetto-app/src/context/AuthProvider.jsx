// src/context/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Funzione centralizzata per caricare il ruolo
  const fetchUserRole = async (authUser) => {
    if (!authUser) {
      setRole(null);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .single();

      if (error) throw error;

      // ✅ Mantiene il ruolo reale: user | admin | superadmin
      setRole(profile?.role || "user");
    } catch (err) {
      console.error("Errore recupero ruolo:", err);
      setRole("user"); // fallback sicuro
    }
  };

  useEffect(() => {
    // 🔹 Init sessione
    const init = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      setUser(authUser);
      await fetchUserRole(authUser);
      setLoading(false);
    };

    init();

    // 🔹 Listener cambi auth (login / logout / refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authUser = session?.user || null;
        setUser(authUser);
        await fetchUserRole(authUser);
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔹 Helper comodo per le sezioni protette
  const isAdmin = role === "admin" || role === "superadmin";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
