import React, { useState, useEffect } from "react";
import {
  User,
  Edit3,
  Trophy,
  Menu,
  Shield,
  Bell,
  Lock,
  Trash2,
  FileText,
  ChevronRight,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../supabaseClient";

export default function UserProfileMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(null);
  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);

  // Carica il nome dal profilo
  useEffect(() => {
    if (user?.id) {
      fetchNome();
    }
  }, [user]);

  const fetchNome = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("nome")
        .eq("id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) setNome(data.nome || "");
    } catch (err) {
      console.error("Errore fetch nome:", err.message);
    }
  };

  const handleSaveNome = async () => {
    if (!nome.trim()) return alert("Il nome non può essere vuoto");
    try {
      setSaving(true);
      const updates = { nome, full_name: nome + " " + (user?.user_metadata?.cognome || "") };
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
      alert("✅ Nome salvato!");
    } catch (err) {
      alert("❌ Errore: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (section) => {
    setOpen(open === section ? null : section);
  };

  return (
    <div className="h-full w-full max-w-md bg-white p-4 overflow-y-auto">

      {/* HEADER CON BOTTONE INDIETRO */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 font-semibold p-2 hover:bg-gray-100 rounded"
        >
          Indietro
        </button>
      </div>

      {/* INFO PROFILO CON INPUT NOME */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-7 h-7 text-gray-500" />
        </div>
        <div className="flex-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border rounded p-1 text-gray-700 font-bold text-lg w-full"
              placeholder="Inserisci il nome"
            />
            <button
              onClick={handleSaveNome}
              disabled={saving}
              className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700 flex items-center justify-center"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-500 mt-1">Account Standard</div>
        </div>
      </div>

      <Divider />

      {/* MODIFICA PROFILO */}
      <MainItem
        icon={Edit3}
        label="Modifica profilo"
        onClick={() => navigate("/profile")}
      />

      {/* ATTIVITÀ */}
      <MainItem
        icon={Trophy}
        label="La tua attività"
        onClick={() => toggle("attivita")}
      />
      {open === "attivita" && (
        <SubBox>
          <SubItem label="Partite" onClick={() => navigate("/attivita/partite")} />
          <SubItem label="Lezioni" onClick={() => navigate("/attivita/lezioni")} />
          <SubItem label="Competizioni" onClick={() => navigate("/attivita/competizioni")} />
        </SubBox>
      )}

      {/* IMPOSTAZIONI */}
      <MainItem
        icon={Menu}
        label="Impostazioni"
        onClick={() => toggle("impostazioni")}
      />
      {open === "impostazioni" && (
        <SubBox>
          <SubItem icon={Shield} label="Privacy" onClick={() => navigate("/settings/privacy")} />
          <SubItem icon={Bell} label="Notifiche" onClick={() => navigate("/settings/notifiche")} />
          <SubItem icon={Lock} label="Sicurezza" onClick={() => navigate("/settings/sicurezza")} />
          <SubItem icon={Trash2} label="Elimina account" danger />
        </SubBox>
      )}

      <Divider />

      {/* LEGALI */}
      <MainItem
        icon={FileText}
        label="Condizioni d’uso"
        onClick={() => navigate("/legal/terms")}
      />
      <MainItem
        icon={FileText}
        label="Politiche sulla privacy"
        onClick={() => navigate("/legal/privacy")}
      />
    </div>
  );
}

/* ================= COMPONENTI ================= */

function MainItem({ icon: Icon, label, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-600" />
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  );
}

function SubBox({ children }) {
  return (
    <div className="ml-6 mr-2 mt-2 bg-gray-50 rounded-lg p-3 space-y-1">
      {children}
    </div>
  );
}

function SubItem({ label, icon: Icon, danger, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 text-sm py-1 cursor-pointer ${
        danger ? "text-red-500" : "text-gray-600"
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-200 my-3" />;
}
