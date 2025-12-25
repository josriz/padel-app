// src/components/Dashboard.jsx - SFONDO BANNER tornei-header.png
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import {
  Menu,
  X,
  Home,
  Trophy,
  User,
  LogOut,
  Shield,
  ShoppingBag,
  Crown,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, role } = useAuth();
  const token = localStorage.getItem("supabase.auth.token");
  const safeUser = user || (token ? { email: "giose.rizzi@gmail.com" } : null);
  const isAdmin = role === "admin";

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  const padelBanners = [
    "/images/mia-foto1.jpg",
    "/images/mia-foto2.jpg",
    "/images/mia-foto3.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % padelBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = isAdmin
    ? [
        { id: "home", label: "Dashboard", icon: Home, path: "/dashboard" },
        { id: "tornei", label: "Tornei", icon: Trophy, path: "/tournaments" },
        {
          id: "admin",
          label: "Gestione Tornei",
          icon: Shield,
          path: "/admin-tournaments",
          admin: true,
        },
        {
          id: "marketplace",
          label: "Marketplace",
          icon: ShoppingBag,
          path: "/marketplace",
        },
        { id: "profilo", label: "Profilo", icon: User, path: "/profile" },
        { id: "logout", label: "Logout", icon: LogOut },
      ]
    : [
        { id: "home", label: "Dashboard", icon: Home, path: "/dashboard" },
        { id: "tornei", label: "Tornei", icon: Trophy, path: "/tournaments" },
        {
          id: "marketplace",
          label: "Marketplace",
          icon: ShoppingBag,
          path: "/marketplace",
        },
        { id: "profilo", label: "Profilo", icon: User, path: "/profile" },
        { id: "logout", label: "Logout", icon: LogOut },
      ];

  const handleLogout = async () => {
    try {
      if (signOut) await signOut();
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  const HamburgerMenu = () => (
    <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-3 rounded-xl hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            if (item.admin && !isAdmin) return null;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setMenuOpen(false);
                  if (item.id === "logout") handleLogout();
                  else navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl font-semibold transition-all border ${
                  item.id === "logout"
                    ? "text-red-600 hover:bg-red-50 border-red-200"
                    : "text-gray-900 hover:bg-gray-50 border-gray-200"
                } ${item.admin ? "justify-between" : ""}`}
              >
                <IconComponent className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
                {item.admin && <Crown className="w-4 h-4 text-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!safeUser) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat px-2 sm:px-4 relative overflow-hidden" 
         style={{ backgroundImage: "url('/images/tornei-header.png')" }}>
      
      {/* Overlay ultra-trasparente come LoginPage */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/8 to-black/25 z-0"></div>
      
      {/* Contenuti con z-index */}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen">

        {/* HEADER */}
        <div className="pt-12 pb-6">
          <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
            <button
              onClick={() => setMenuOpen(true)}
              className="mb-6 p-3 rounded-xl hover:bg-white/80 backdrop-blur-sm shadow-sm border self-end bg-white/70"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-4xl font-black text-white drop-shadow-2xl text-center mb-4 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xl text-white/90 drop-shadow-lg text-center mb-8 max-w-2xl">
              Benvenuto nella tua Dashboard Padel!
            </p>
          </div>
        </div>

        {/* BANNER - Sostituito con tornei-header.png fisso */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="relative h-32 md:h-40 lg:h-48 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/80 bg-white/20 backdrop-blur-sm">
            <img
              src="/images/tornei-header.png"
              alt="Tornei Header"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-3xl" />
          </div>
        </div>

        {menuOpen && <HamburgerMenu />}

        {/* CARDS - Adattate allo sfondo */}
        <div className="max-w-4xl mx-auto px-6 pb-12 flex-1">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Tornei - blu */}
            <button
              onClick={() => navigate("/tournaments")}
              className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:-translate-y-3 transition-all border border-white/70 text-left hover:bg-white"
            >
              <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 border border-blue-200/50 shadow-lg">
                <img
                  src="/images/icon-tornei.jpg"
                  alt="Tornei"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center tracking-wide">
                Tornei
              </h3>
              <p className="text-lg text-gray-700 mb-2 text-center font-medium">
                Scopri e iscriviti ai tornei
              </p>
            </button>

            {/* Marketplace - verde */}
            <button
              onClick={() => navigate("/marketplace")}
              className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:-translate-y-3 transition-all border border-white/70 text-left hover:bg-white"
            >
              <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 border border-emerald-200/50 shadow-lg">
                <img
                  src="/images/icon-marketplace.jpg"
                  alt="Marketplace"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center tracking-wide">
                Marketplace
              </h3>
              <p className="text-lg text-gray-700 mb-2 text-center font-medium">
                Acquista attrezzature padel
              </p>
            </button>

            {/* Profilo - viola */}
            <button
              onClick={() => navigate("/profile")}
              className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:-translate-y-3 transition-all border border-white/70 text-left hover:bg-white"
            >
              <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-violet-500 to-purple-500" />
              <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 border border-violet-200/50 shadow-lg">
                <img
                  src="/images/icon-profilo.jpg"
                  alt="Profilo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center tracking-wide">
                Profilo
              </h3>
              <p className="text-lg text-gray-700 mb-2 text-center font-medium">
                Gestisci il tuo account
              </p>
            </button>
          </div>

          {isAdmin && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-white drop-shadow-2xl mb-12 text-center tracking-tight">
                👑 Area Admin
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/90 backdrop-blur-md text-gray-900 rounded-3xl p-10 shadow-3xl hover:shadow-4xl hover:-translate-y-3 transition-all border border-white/70">
                  <Shield className="w-20 h-20 mx-auto mb-8 text-blue-600 shadow-lg" />
                  <h3 className="text-2xl font-bold mb-6 text-center tracking-wide">
                    Gestione Tornei
                  </h3>
                  <p className="text-xl mb-10 text-center text-gray-700 opacity-90 font-medium">
                    Crea e modifica tornei
                  </p>
                  <button
                    onClick={() => navigate("/admin-tournaments")}
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-5 px-10 rounded-2xl font-bold text-xl hover:from-emerald-600 hover:to-blue-700 shadow-2xl transition-all hover:shadow-3xl hover:scale-[1.02]"
                  >
                    GESTISCI TORNEI 👑
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
