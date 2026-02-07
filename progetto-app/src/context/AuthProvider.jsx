// src/context/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          setRole(profile?.role || "user");
          console.log("ROLE FETCHED:", profile?.role); // debug
        } catch (err) {
          console.error("Errore fetch ruolo:", err);
          setRole("user");
        }
      }

      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const isAdmin = role === "admin" || role === "superadmin"; // superadmin ora incluso correttamente

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
