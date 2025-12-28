import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

import EventiTornei from "./EventiTornei";
import MarketplaceUser from "./MarketplaceUser";
import Profilo from "./Profilo";
import SidebarMenu from "./SidebarMenu";

export default function DashboardUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Benvenuto {user?.email}
            </h2>
            <p className="text-gray-600">Usa il menu per esplorare le funzionalità.</p>
          </div>
        );
      case "eventi":
        return <EventiTornei user={user} />;
      case "marketplace":
        return <MarketplaceUser user={user} />; // ✅ sempre visibile
      case "profilo":
        return <Profilo user={user} />;
      default:
        return <div>Sezione non trovata</div>;
    }
  };

  const userType = user?.user_metadata?.role || "user";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="w-full bg-white shadow flex items-center justify-between px-5 py-3">
        <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700 focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* MENU A SCOMPARSA */}
      <SidebarMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userType={userType}
        onSelectSection={setActiveSection} // ✅ collegamento per aprire la sezione corretta
      />

      {/* CONTENUTO */}
      <main className="p-6 transition-all duration-300">
        {renderSection()}
      </main>
    </div>
  );
}
