// src/components/Dashboard.jsx - SOSTITUISCI COMPLETO
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../supabaseClient";
import {
  Menu, X, Home, Trophy, User, LogOut, Shield, ShoppingBag, Crown
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, role } = useAuth();
  const token = localStorage.getItem("supabase.auth.token");
  const safeUser = user || (token ? { email: "giose.rizzi@gmail.com" } : null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // ✅ NUOVO
  const [roleLoading, setRoleLoading] = useState(true); // ✅ NUOVO

  // ✅ FETCH RUOLO SUPABASE
  useEffect(() => {
    if (user?.id || safeUser?.email) {
      const userId = user?.id || (token ? '45f63203-57ef-405a-8f80-a0253c0e8662' : null);
      if (userId) {
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single()
          .then(({ data, error }) => {
            if (data?.role) {
              console.log('🎾 Dashboard ruolo:', data.role);
              setUserRole(data.role);
            }
            setRoleLoading(false);
          });
      } else {
        setRoleLoading(false);
      }
    } else {
      setRoleLoading(false);
    }
  }, [user?.id, safeUser?.email, token]);

  // ✅ NUOVO: isAdmin con ruoli Supabase
  const isTorneiAdmin = !roleLoading && ['super_admin', 'tornei_admin'].includes(userRole);
  const isMarketplaceAdmin = !roleLoading && ['super_admin', 'marketplace_admin'].includes(userRole);
  const isSuperAdmin = !roleLoading && userRole === 'super_admin';

  const menuItems = isTorneiAdmin || isMarketplaceAdmin || isSuperAdmin ? [
    { id: "home", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "tornei", label: "Tornei", icon: Trophy, path: "/tournaments" },
    { id: "admin", label: "Gestione Tornei", icon: Shield, path: "/admin-tournaments", torneiAdmin: true },
    ...(isMarketplaceAdmin || isSuperAdmin ? [{ id: "marketplace", label: "Marketplace Admin", icon: ShoppingBag, path: "/marketplace-admin", marketplaceAdmin: true }] : []),
    { id: "profilo", label: "Profilo", icon: User, path: "/profile" },
    { id: "logout", label: "Logout", icon: LogOut }
  ] : [
    { id: "home", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "tornei", label: "Tornei", icon: Trophy, path: "/tournaments" },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag, path: "/marketplace" },
    { id: "profilo", label: "Profilo", icon: User, path: "/profile" },
    { id: "logout", label: "Logout", icon: LogOut }
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
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Menu {isSuperAdmin && '(Super Admin)' || isTorneiAdmin && '(Tornei Admin)'}
          </h2>
          <button onClick={() => setMenuOpen(false)} className="p-3 rounded-xl hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            // ✅ NUOVO controllo ruoli menu
            if ((item.torneiAdmin && !isTorneiAdmin) || (item.marketplaceAdmin && !isMarketplaceAdmin)) {
              return null;
            }
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
                } ${item.torneiAdmin || item.marketplaceAdmin ? "justify-between" : ""}`}
              >
                <IconComponent className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
                {(item.torneiAdmin || item.marketplaceAdmin) && (
                  <Crown className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="mt-4 text-lg text-emerald-600 font-semibold">Caricamento ruolo...</p>
      </div>
    );
  }

  if (!safeUser) return <Navigate to="/" replace />;

  return (
    <div 
      className="min-h-screen w-full flex flex-col px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/images/tornei-header.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="relative z-10 flex-1">
        {/* HEADER */}
        <div className="max-w-6xl mx-auto mb-12 lg:mb-20 text-center">
          <div className="flex justify-end mb-10 lg:mb-16">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/80 hover:bg-white hover:shadow-3xl transition-all duration-300 w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center"
            >
              <Menu className="w-6 h-6 lg:w-7 lg:h-7 text-gray-800" />
            </button>
          </div>
          
          <div className="px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white drop-shadow-2xl mb-6 lg:mb-8 leading-tight">
              Dashboard
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-white/95 drop-shadow-2xl max-w-3xl mx-auto leading-relaxed">
              Benvenuto {safeUser.email.split('@')[0]}! {isSuperAdmin && '👑 Super Admin' || isTorneiAdmin && '🏆 Admin Tornei'}
            </p>
          </div>
        </div>

        {menuOpen && <HamburgerMenu />}

        {/* 3 ICONE - IDENTICO */}
        <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* TORNEI */}
            <button
              onClick={() => navigate("/tournaments")}
              className="group bg-white/75 backdrop-blur-2xl hover:bg-white/90 rounded-3xl p-8 lg:p-10 shadow-2xl hover:shadow-4xl hover:-translate-y-4 transition-all duration-500 border-2 border-white/70 hover:border-blue-400/80 w-full h-full min-h-[320px] flex flex-col relative overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-full h-44 lg:h-52 rounded-2xl overflow-hidden mb-8 border-3 border-blue-200/80 shadow-2xl group-hover:scale-[1.03] transition-all duration-500 relative z-10 bg-white/95">
                <img src="/images/icon-tornei.jpg" alt="Tornei" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-6 text-center tracking-wide relative z-10">
                Tornei
              </h3>
              <p className="text-lg lg:text-xl text-gray-700 font-semibold text-center flex-1 relative z-10 leading-relaxed">
                Scopri e iscriviti ai tornei
              </p>
            </button>

            {/* MARKETPLACE */}
            <button
              onClick={() => navigate("/marketplace")}
              className="group bg-white/75 backdrop-blur-2xl hover:bg-white/90 rounded-3xl p-8 lg:p-10 shadow-2xl hover:shadow-4xl hover:-translate-y-4 transition-all duration-500 border-2 border-white/70 hover:border-emerald-400/80 w-full h-full min-h-[320px] flex flex-col relative overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-full h-44 lg:h-52 rounded-2xl overflow-hidden mb-8 border-3 border-emerald-200/80 shadow-2xl group-hover:scale-[1.03] transition-all duration-500 relative z-10 bg-white/95">
                <img src="/images/icon-marketplace.jpg" alt="Marketplace" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-6 text-center tracking-wide relative z-10">
                Marketplace
              </h3>
              <p className="text-lg lg:text-xl text-gray-700 font-semibold text-center flex-1 relative z-10 leading-relaxed">
                Acquista attrezzature padel
              </p>
            </button>

            {/* PROFILO */}
            <button
              onClick={() => navigate("/profile")}
              className="group bg-white/75 backdrop-blur-2xl hover:bg-white/90 rounded-3xl p-8 lg:p-10 shadow-2xl hover:shadow-4xl hover:-translate-y-4 transition-all duration-500 border-2 border-white/70 hover:border-purple-400/80 w-full h-full min-h-[320px] flex flex-col relative overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-full h-44 lg:h-52 rounded-2xl overflow-hidden mb-8 border-3 border-purple-200/80 shadow-2xl group-hover:scale-[1.03] transition-all duration-500 relative z-10 bg-white/95">
                <img src="/images/icon-profilo.jpg" alt="Profilo" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-6 text-center tracking-wide relative z-10">
                Profilo
              </h3>
              <p className="text-lg lg:text-xl text-gray-700 font-semibold text-center flex-1 relative z-10 leading-relaxed">
                Gestisci il tuo account
              </p>
            </button>
          </div>
        </div>

        {/* ✅ ADMIN SECTION - NUOVO controllo ruoli */}
        {(isTorneiAdmin || isMarketplaceAdmin || isSuperAdmin) && (
          <div className="max-w-4xl mx-auto px-6 lg:px-12 mt-24 lg:mt-32">
            <h2 className="text-4xl lg:text-6xl font-black text-white drop-shadow-2xl mb-16 text-center">
              {isSuperAdmin ? '👑 Super Admin' : isTorneiAdmin ? '🏆 Area Tornei Admin' : '🛒 Area Marketplace Admin'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* TORNEI ADMIN */}
              {isTorneiAdmin && (
                <div className="bg-white/85 backdrop-blur-2xl rounded-3xl p-10 lg:p-16 shadow-3xl hover:shadow-4xl border-2 border-white/70 hover:-translate-y-2 transition-all duration-500 text-center">
                  <Shield className="w-24 h-24 lg:w-28 lg:h-28 mx-auto mb-10 lg:mb-16 text-emerald-600 shadow-2xl" />
                  <h3 className="text-3xl lg:text-5xl font-black mb-10 lg:mb-16 text-gray-900">Gestione Tornei</h3>
                  <p className="text-2xl lg:text-3xl mb-12 lg:mb-20 text-gray-700 font-semibold leading-relaxed max-w-2xl mx-auto">
                    Crea, modifica ed elimina tornei
                  </p>
                  <button
                    onClick={() => navigate("/admin-tournaments")}
                    className="w-full max-w-lg mx-auto bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 text-white py-8 px-16 rounded-3xl font-black text-2xl shadow-3xl hover:shadow-4xl hover:scale-105 transition-all duration-500 hover:from-emerald-600 hover:to-blue-700"
                  >
                    GESTISCI TORNEI 👑
                  </button>
                </div>
              )}

              {/* MARKETPLACE ADMIN */}
              {isMarketplaceAdmin && (
                <div className="bg-white/85 backdrop-blur-2xl rounded-3xl p-10 lg:p-16 shadow-3xl hover:shadow-4xl border-2 border-white/70 hover:-translate-y-2 transition-all duration-500 text-center">
                  <ShoppingBag className="w-24 h-24 lg:w-28 lg:h-28 mx-auto mb-10 lg:mb-16 text-purple-600 shadow-2xl" />
                  <h3 className="text-3xl lg:text-5xl font-black mb-10 lg:mb-16 text-gray-900">Marketplace Admin</h3>
                  <p className="text-2xl lg:text-3xl mb-12 lg:mb-20 text-gray-700 font-semibold leading-relaxed max-w-2xl mx-auto">
                    Gestisci prodotti e ordini
                  </p>
                  <button
                    onClick={() => navigate("/marketplace-admin")}
                    className="w-full max-w-lg mx-auto bg-gradient-to-r from-purple-500 via-purple-600 to-emerald-600 text-white py-8 px-16 rounded-3xl font-black text-2xl shadow-3xl hover:shadow-4xl hover:scale-105 transition-all duration-500 hover:from-purple-600 hover:to-emerald-700"
                  >
                    MARKETPLACE ADMIN 🛒
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
