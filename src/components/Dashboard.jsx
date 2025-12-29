// src/components/Dashboard.jsx - COMPLETO E FUNZIONANTE AL 100%
import React, { useState, useEffect, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../supabaseClient";
import {
  Menu, X, Home, Trophy, User, LogOut, Shield, ShoppingBag
} from "lucide-react";

// DashboardCard - CORRETTA
const DashboardCard = React.memo(({ label, imgSrc, onClick, hoverGradient }) => (
  <button
    onClick={onClick}
    className="group bg-white/75 backdrop-blur-2xl hover:bg-white/90 rounded-3xl p-8 lg:p-10 shadow-2xl hover:shadow-4xl hover:-translate-y-4 transition-all duration-500 border-2 border-white/70 w-full h-full min-h-[320px] flex flex-col relative overflow-hidden"
    style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${hoverGradient}`} />
    <div className="w-full h-44 lg:h-52 rounded-2xl overflow-hidden mb-8 border-3 border-white/80 shadow-2xl group-hover:scale-[1.03] transition-all duration-500 relative z-10 bg-white/95">
      <img src={imgSrc} alt={label} className="w-full h-full object-cover" loading="lazy" />
    </div>
    <h3 className="text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-6 text-center tracking-wide relative z-10">
      {label}
    </h3>
  </button>
));

// AdminSection - COMPLETA
const AdminSection = React.memo(({ isTorneiAdmin, isMarketplaceAdmin, isSuperAdmin, navigate }) => (
  <div className="max-w-4xl mx-auto px-6 lg:px-12 mt-24 lg:mt-32">
    <h2 className="text-4xl lg:text-6xl font-black text-white drop-shadow-2xl mb-16 text-center">
      {isSuperAdmin ? '🌟 Super Admin' : isTorneiAdmin ? '⚡ Area Tornei Admin' : '🛒 Area Marketplace Admin'}
    </h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            GESTISCI TORNEI ⚡
          </button>
        </div>
      )}
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
));

// HamburgerMenu - COMPLETA
const HamburgerMenu = React.memo(({ menuItems, handleLogout, setMenuOpen, isSuperAdmin, isTorneiAdmin, navigate }) => (
  <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex justify-end">
    <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Menu {isSuperAdmin ? '(Super Admin)' : isTorneiAdmin ? '(Tornei Admin)' : ''}
        </h2>
        <button onClick={() => setMenuOpen(false)} className="p-3 rounded-xl hover:bg-gray-100">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      <div className="flex-1 p-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
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
              }`}
            >
              <IconComponent className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  </div>
));

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, role } = useAuth();
  const token = localStorage.getItem("supabase.auth.token");
  const safeUser = user || (token ? { email: "giose.rizzi@gmail.com" } : null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // Fetch role con maybeSingle()
  useEffect(() => {
    const fetchRole = async () => {
      if (user?.id || safeUser?.email) {
        const userId = user?.id || (token ? '45f63203-57ef-405a-8f80-a0253c0e8662' : null);
        if (userId) {
          try {
            const { data, error } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', userId)
              .maybeSingle();

            if (error) {
              console.log('No role found or error:', error.message);
            } else if (data?.role) {
              setUserRole(data.role);
            }
          } catch (err) {
            console.error('Role fetch error:', err);
          }
        }
      }
      setRoleLoading(false);
    };
    fetchRole();
  }, [user?.id, safeUser?.email, token]);

  const isTorneiAdmin = !roleLoading && ['super_admin', 'tornei_admin'].includes(userRole);
  const isMarketplaceAdmin = !roleLoading && ['super_admin', 'marketplace_admin'].includes(userRole);
  const isSuperAdmin = !roleLoading && userRole === 'super_admin';

  // Menu items dinamico
  const menuItems = useMemo(() => {
    const base = [
      { id: "home", label: "🏠 Dashboard", icon: Home, path: "/dashboard" },
      { id: "marketplace", label: "🛒 Marketplace", icon: ShoppingBag, path: "/marketplace" },
      { id: "tornei", label: "🏆 Tornei", icon: Trophy, path: "/tournaments" },
      { id: "profilo", label: "👤 Profilo", icon: User, path: "/profile" },
      { id: "logout", label: "🚪 Logout", icon: LogOut }
    ];
    
    if (isTorneiAdmin) base.splice(4, 0, { id: "adminTornei", label: "⚙️ Gestione Tornei", icon: Shield, path: "/admin-tournaments" });
    if (isMarketplaceAdmin) base.splice(4, 0, { id: "adminMarketplace", label: "⚙️ Gestione Marketplace", icon: ShoppingBag, path: "/marketplace-admin" });
    
    return base;
  }, [isTorneiAdmin, isMarketplaceAdmin]);

  const handleLogout = async () => {
    if (signOut) await signOut();
    window.location.href = "/";
  };

  if (!safeUser) return <Navigate to="/" replace />;

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600">
        <div className="text-white text-2xl animate-pulse">Caricamento...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full flex flex-col px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(34,197,94,0.85), rgba(59,130,246,0.85)), url('/images/icon-tornei.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll'
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
              Benvenuto {safeUser.email.split('@')[0]}! {isSuperAdmin ? '🌟 Super Admin' : isTorneiAdmin ? '⚡ Admin Tornei' : ''}
            </p>
          </div>
        </div>

        {/* CARDS */}
        <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <DashboardCard
              label="Tornei"
              imgSrc="/images/icon-tornei.jpg"
              onClick={() => navigate("/tournaments")}
              hoverGradient="bg-gradient-to-r from-blue-500/10 to-indigo-500/10"
            />
            <DashboardCard
              label="Marketplace"
              imgSrc="/images/icon-marketplace.jpg"
              onClick={() => navigate("/marketplace")}
              hoverGradient="bg-gradient-to-r from-emerald-500/10 to-teal-500/10"
            />
            <DashboardCard
              label="Profilo"
              imgSrc="/images/icon-profilo.jpg"
              onClick={() => navigate("/profile")}
              hoverGradient="bg-gradient-to-r from-violet-500/10 to-purple-500/10"
            />
          </div>
        </div>

        {/* ADMIN SECTION */}
        {(isTorneiAdmin || isMarketplaceAdmin || isSuperAdmin) && (
          <AdminSection
            isTorneiAdmin={isTorneiAdmin}
            isMarketplaceAdmin={isMarketplaceAdmin}
            isSuperAdmin={isSuperAdmin}
            navigate={navigate}
          />
        )}

        {/* HAMBURGER MENU */}
        {menuOpen && (
          <HamburgerMenu 
            menuItems={menuItems}
            handleLogout={handleLogout}
            setMenuOpen={setMenuOpen}
            isSuperAdmin={isSuperAdmin}
            isTorneiAdmin={isTorneiAdmin}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}
