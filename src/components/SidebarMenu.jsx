import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SidebarMenu({ isOpen, onClose, userType }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed left-0 top-0 w-72 h-full bg-white z-50 shadow-xl p-6">
        <h2 className="text-xl font-bold mb-6">Menu</h2>

        <nav className="space-y-2">
          <Link to="/" onClick={onClose}>🏠 Dashboard</Link>
          <Link to="/tornei" onClick={onClose}>🏆 Tornei</Link>
          <Link to="/marketplace" onClick={onClose}>🛒 Marketplace</Link>

          {userType === "admin" && (
            <>
              <Link to="/admin" onClick={onClose}>⚙️ Gestione Tornei</Link>
              <Link to="/admin/tornei" onClick={onClose}>📋 Admin</Link>
            </>
          )}

          <button
            onClick={() => {
              onClose();
              navigate(-1);
            }}
            className="text-left text-gray-600 mt-6"
          >
            ← Indietro
          </button>
        </nav>
      </aside>
    </>
  );
}
