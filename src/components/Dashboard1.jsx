// src/components/Dashboard.jsx - CONFIGURAZIONE PRECEDENTE COMPLETA
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Menu, X, Home, Trophy, User, LogOut, Shield, ShoppingBag, Crown } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, role } = useAuth();
  const token = localStorage.getItem('supabase.auth.token');
  const safeUser = user || (token ? { email: 'giose.rizzi@gmail.com' } : null);
  const isAdmin = role === 'admin';

  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = isAdmin ? [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'tornei', label: 'Tornei', icon: Trophy, path: '/tournaments' },
    { id: 'admin', label: 'Gestione Tornei', icon: Shield, path: '/admin-tournaments', admin: true },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
    { id: 'profilo', label: 'Profilo', icon: User, path: '/profile' },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ] : [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'tornei', label: 'Tornei', icon: Trophy, path: '/tournaments' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
    { id: 'profilo', label: 'Profilo', icon: User, path: '/profile' },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  const handleLogout = async () => {
    try {
      if (signOut) await signOut();
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  const HamburgerMenu = () => (
    <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button 
            onClick={() => setMenuOpen(false)}
            className="p-3 rounded-xl hover:bg-gray-100 transition-all"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map(item => {
            const IconComponent = item.icon;
            if (item.admin && !isAdmin) return null;
            
            return (
              <div key={item.id}>
                {item.id === 'logout' ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-3 rounded-xl font-semibold text-left text-red-600 hover:bg-red-50 hover:shadow-sm transition-all border border-red-100"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(item.path);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-gray-900 hover:bg-gray-50 hover:shadow-sm transition-all border border-gray-200"
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0 text-blue-600" />
                    <span className="text-sm">{item.label}</span>
                    {item.admin && <Crown className="w-4 h-4 ml-auto text-blue-600" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!safeUser) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ HEADER CON HAMBURGER TOP-RIGHT ORIGINALE */}
      <div className="pt-12 pb-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          {/* HAMBURGER SOPRA - POSIZIONE ORIGINALE */}
          <button
            onClick={() => setMenuOpen(true)}
            className="mb-6 p-3 rounded-xl hover:bg-gray-50 transition-all shadow-sm border border-gray-200 bg-white self-end"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* TITOLO CENTRO */}
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
            Dashboard
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Benvenuto nella tua Dashboard Padel!
          </p>
        </div>
      </div>

      {/* HAMBURGER MENU */}
      {menuOpen && <HamburgerMenu />}

      {/* ✅ CARDS PICCOLE STILE LOGIN */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* TORNEI */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:bg-gray-50 transition-all group-hover:-translate-y-1">
            <Trophy className="w-10 h-10 text-blue-600 mb-3 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Tornei</h3>
            <p className="text-sm text-gray-600 text-center">Scopri e iscriviti ai tornei</p>
            <button 
              onClick={() => navigate('/tournaments')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm mt-4"
            >
              VAI AI TORNEI →
            </button>
          </div>

          {/* MARKETPLACE */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:bg-gray-50 transition-all group-hover:-translate-y-1">
            <ShoppingBag className="w-10 h-10 text-emerald-600 mb-3 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Marketplace</h3>
            <p className="text-sm text-gray-600 text-center">Acquista attrezzature padel</p>
            <button 
              onClick={() => navigate('/marketplace')}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-sm mt-4"
            >
              ESPLORA MARKET →
            </button>
          </div>

          {/* PROFILO */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:bg-gray-50 transition-all group-hover:-translate-y-1">
            <User className="w-10 h-10 text-purple-600 mb-3 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Profilo</h3>
            <p className="text-sm text-gray-600 text-center">Gestisci il tuo account</p>
            <button 
              onClick={() => navigate('/profile')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-sm mt-4"
            >
              MODIFICA PROFILO →
            </button>
          </div>
        </div>

        {/* ADMIN CARDS */}
        {isAdmin && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">👑 Area Admin</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 hover:shadow-md hover:bg-blue-100 transition-all group-hover:-translate-y-1">
                <Shield className="w-10 h-10 text-blue-600 mb-3 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Gestione Tornei</h3>
                <p className="text-sm text-gray-600 text-center">Crea e modifica tornei</p>
                <button 
                  onClick={() => navigate('/admin-tournaments')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm mt-4"
                >
                  GESTISCI TORNEI 👑
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
