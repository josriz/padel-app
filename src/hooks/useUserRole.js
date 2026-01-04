import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useUserRole(user) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    const fetchRole = async () => {
      try {
        // Legge il profilo dell'utente dal DB
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Errore fetch ruolo:", error.message);
          // fallback: usa il ruolo dal JWT
          setRole(user.role || "authenticated");
          return;
        }

        setRole(data?.role || "authenticated");
      } catch (err) {
        console.error("Errore useUserRole:", err.message);
        setRole(user.role || "authenticated");
      }
    };

    fetchRole();
  }, [user]);

  return role;
}
