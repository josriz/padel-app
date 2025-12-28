import React from "react";
import { useNavigate } from "react-router-dom";

export default function SidebarMenu({
  isOpen,
  onClose,
  userType,
  onSelectSection
}) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const go = (section) => {
    onSelectSection(section);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <aside className="fixed left-0 top-0 w-72 h-full bg-gradient-to-b from-white to-emerald-50 z-50 shadow-2xl p-6 border-r-4 border-emerald-200">
        <div className="flex items-center gap-3 mb-8 p-4 bg-emerald-100 rounded-2xl">
          <img
            src="/images/icon-marketplace.jpg"
            alt="Logo"
            className="w-12 h-12 rounded-xl"
          />
          <h2 className="text-2xl font-black text-emerald-700">
            PADEL APP
          </h2>
        </div>

        <nav className="space-y-4">

          {/* DASHBOARD */}
          <div className="bg-emerald-50 rounded-xl p-4">
            <button
              onClick={() => go("home")}
              className="w-full text-left p-3 rounded-xl hover:bg-emerald-100 font-semibold"
            >
              🏠 Dashboard
            </button>

            {/* ✅ Marketplace visibile a tutti */}
            <button
              onClick={() => go("marketplace")}
              className="w-full text-left p-3 rounded-xl hover:bg-emerald-100 font-semibold"
            >
              🛒 Marketplace
            </button>

            <button
              onClick={() => go("profilo")}
              className="w-full text-left p-3 rounded-xl hover:bg-emerald-100 font-semibold"
            >
              👤 Profilo
            </button>
          </div>

          {/* TORNEI */}
          <div className="bg-blue-50 rounded-xl p-4">
            <button
              onClick={() => go("eventi")}
              className="w-full text-left p-3 rounded-xl hover:bg-blue-100 font-semibold"
            >
              🏆 Eventi Tornei
            </button>
          </div>

          {/* GESTIONE */}
          <div className="bg-orange-50 rounded-xl p-4">
            <span className="block text-xs font-bold mb-2 text-orange-600">
              SEZIONI GESTIONE
            </span>

            {/* ⚙️ Gestione Marketplace (permessi all'interno della pagina) */}
            <button
              onClick={() => go("marketplace")}
              className="w-full text-left p-3 rounded-xl hover:bg-orange-100 font-semibold"
            >
              ⚙️ Gestione Marketplace
            </button>

            {/* ⚙️ Gestione Tornei */}
            <button
              onClick={() => go("eventi")}
              className="w-full text-left p-3 rounded-xl hover:bg-orange-100 font-semibold"
            >
              ⚙️ Gestione Tornei
            </button>
          </div>

          {/* INDIETRO */}
          <button
            onClick={() => {
              onClose();
              navigate(-1);
            }}
            className="w-full text-left p-3 rounded-xl hover:bg-gray-100 font-semibold"
          >
            ← Indietro
          </button>

        </nav>
      </aside>
    </>
  );
}
